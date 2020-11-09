import io
import itertools
import logging
import math
import random
import time
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import IO, Callable, Dict, Iterator, List, Optional, Sequence

import cairosvg
from django.conf import settings
from django.contrib.postgres.fields import ArrayField
from django.core.files import File
from django.db import models, transaction
from django.utils.functional import cached_property
from django.utils.http import int_to_base36
from PIL import Image as PILImage

from tessellation.managers import CompositionManager

logger = logging.getLogger(__name__)


class CompositionError(Exception):
    pass


class TessellationError(Exception):
    pass


SIDES = [0, 1, 2, 3]
SIDE_NAMES = ['left', 'top', 'right', 'bottom']
CONNECTIONS = [1, 2, 3, 4, 5]
(LEFT, TOP, RIGHT, BOTTOM) = SIDES

TComposition = List[List[Optional['Tile']]]
TTried = List[List[List['Tile']]]
TStack = List['Tile']
TUpdateStackFunc = Callable[[TStack, int], None]


@dataclass
class Requirement:
    side: int
    connection: int


@dataclass
class UpdateStackFunc:
    label: str
    func: TUpdateStackFunc


UPDATE_STACK_FUNC_DEFAULT_NAME: str = 'push_current'

UPDATE_STACK_FUNCS: Dict[str, UpdateStackFunc] = {
    UPDATE_STACK_FUNC_DEFAULT_NAME: UpdateStackFunc(
        label='Degrade last used tile',
        func=lambda stack, i: stack.append(stack.pop(i)),
    ),
    'cycle_stack': UpdateStackFunc(
        label='Repeat sequence',
        func=lambda stack, i: stack.append(stack.pop(0)),
    ),
    'noop': UpdateStackFunc(
        label='Prefer one tile', func=lambda stack, i: None
    ),
    'shuffle_stack': UpdateStackFunc(
        label='Random', func=lambda stack, i: random.shuffle(stack)
    ),
    'unshift_current': UpdateStackFunc(
        label='Prefer last used tile',
        func=lambda stack, i: stack.insert(0, stack.pop(i)),
    ),
}


def reverse_digits(n: int) -> int:
    if n < 10:
        return n
    rev = 0
    while n > 0:
        rev = rev * 10 + (n % 10)
        n = n // 10
    return rev


def generate_tiles(
    images: Sequence['Image'], allow_rotation: bool = True
) -> List['Tile']:
    if not allow_rotation:
        return [Tile(image=image, rotation=0) for image in images]
    return list(
        itertools.chain.from_iterable(
            (Tile(image=image, rotation=rotation) for rotation in SIDES)
            for image in images
        )
    )


def find_requirements(
    composition: TComposition, col: int, row: int
) -> Iterator[Requirement]:
    if col != 0:
        left_tile = composition[row][col - 1]
        if left_tile:
            yield Requirement(
                side=LEFT,
                connection=reverse_digits(left_tile.get_connection(RIGHT)),
            )
    if row != 0:
        top_tile = composition[row - 1][col]
        if top_tile:
            yield Requirement(
                side=TOP,
                connection=reverse_digits(top_tile.get_connection(BOTTOM)),
            )


def fits(tile: 'Tile', requirements: Sequence[Requirement]) -> bool:
    for requirement in requirements:
        if tile.get_connection(requirement.side) != requirement.connection:
            return False
    return True


def choose_tile(
    stack: TStack,
    requirements: Sequence[Requirement],
    excl: Sequence['Tile'],
    update_stack_func: TUpdateStackFunc,
) -> Optional['Tile']:
    for i in range(len(stack)):
        tile = stack[i]
        if tile not in excl and fits(tile, requirements):
            update_stack_func(stack, i)
            return tile
    return None


def generate_composition(
    tiles: List['Tile'],
    width: int,
    height: int,
    max_steps: int = pow(2, 18),
    update_stack_func_name: str = UPDATE_STACK_FUNC_DEFAULT_NAME,
) -> TComposition:
    logger.info(
        f'Generating composition update_stack_func_name={update_stack_func_name}'
    )
    t0 = time.time()
    composition: TComposition = [
        [None for _ in range(width)] for _ in range(height)
    ]
    if not tiles:
        return composition
    tried: TTried = [[[] for _ in range(width)] for _ in range(height)]
    stack = tiles.copy()
    update_stack_func: TUpdateStackFunc = UPDATE_STACK_FUNCS[
        update_stack_func_name
    ].func  # type: ignore
    i = 0
    row = 0
    col = 0
    while row < height and col < width:
        tile = choose_tile(
            stack,
            list(find_requirements(composition, col, row)),
            tried[row][col],
            update_stack_func,
        )
        if tile is not None:
            tried[row][col].append(tile)
            composition[row][col] = tile
            if col == width - 1:
                row += 1
                col = 0
            else:
                col += 1
        else:
            # logger.info(f'[{row}, {col}] No fitting tile found, going one step back')
            tried[row][col].clear()
            if col == 0:
                if row == 0:
                    raise CompositionError("Input tiles don't connect.")
                row -= 1
                col = width - 1
            else:
                col -= 1
        if i >= max_steps:
            raise CompositionError(
                f'Failed to calculate composition in {max_steps} steps.'
            )
        i += 1
    t1 = time.time()
    logger.info(f'Generated composition in {t1 - t0:.5f}ms')
    return composition


def calc_render_tile_size(
    composition: TComposition, max_size: int = 1920
) -> int:
    width = len(composition[0])
    height = len(composition)
    tile_size = math.ceil(max_size / min(width, height))
    if tile_size % 2:
        tile_size += 1
    tile_size = max(2, tile_size)
    return tile_size


def read_im(f: IO) -> PILImage:
    try:
        return PILImage.open(f)
    except OSError:  # Use OSError instead of UnidentifiedImageError for compatibility w/ Pillow 6.x
        f.seek(0)
        bitmap_f = io.BytesIO()
        cairosvg.svg2png(file_obj=f, write_to=bitmap_f)
        bitmap_f.seek(0)
        return PILImage.open(bitmap_f)


def render_composition(
    composition: TComposition,
    images: Sequence['Image'],
    tiles: Sequence['Tile'],
    tile_size: int,
    f: IO,
):
    logger.info('Rendering composition')
    t0 = time.time()
    if not composition:
        raise CompositionError(
            'Can\'t render composition, because it\'s not generated.'
        )
    width = len(composition[0])
    height = len(composition)
    images_im = {}
    for image in images:
        images_im[image.id] = read_im(io.BytesIO(image.image.read()))
    tile_im = {
        tile.id: images_im[tile.image.id]
        .resize((tile_size, tile_size))
        .rotate(tile.rotation * 90)
        for tile in tiles
    }
    im = PILImage.new('RGBA', (width * tile_size, height * tile_size), '#fff')
    for row in range(height):
        for col in range(width):
            tile = composition[row][col]
            if tile:
                im.paste(tile_im[tile.id], (col * tile_size, row * tile_size))
    t1 = time.time()
    logger.info(f'Rendered composition in {t1 - t0:.5f}ms')
    im.save(f, 'PNG')


def image_upload_to(instance: 'Image', filename: str) -> str:
    suffix = Path(filename).suffix
    name = str(uuid.uuid4())
    path = (Path('images') / name).with_suffix(suffix)
    return str(path)


class Image(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now=True)
    image = models.FileField(upload_to=image_upload_to, unique=True)
    connections = ArrayField(models.PositiveSmallIntegerField())

    def __str__(self):
        return str(self.id)


class Tile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now=True)
    image = models.ForeignKey(
        Image, on_delete=models.CASCADE, related_name='tiles'
    )
    rotation = models.PositiveSmallIntegerField()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['image', 'rotation'], name='unique_image_and_rotation'
            )
        ]

    def __str__(self):
        return str(self.id)

    def __repr__(self):
        return f'<Tile: image__id={self.image.id} rotation={self.rotation}>'

    def get_connection(self, side: int) -> int:
        return self.image.connections[(side + self.rotation) % len(SIDES)]


def find_shortest_str(
    s: str,
    test_fn: Callable[[str], bool],
    length: int = 1,
    max_length: int = 0,
) -> Optional[str]:
    if length > len(s) or max_length and length > max_length:
        return None
    out = s[:length]
    if not test_fn(out):
        return find_shortest_str(s, test_fn, length + 1)
    return out


def composition_upload_to(instance: 'Composition', filename: str) -> str:
    return str(Path('compositions') / (str(instance.id) + '.png'))


class Composition(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    owner = models.ForeignKey(
        'auth.User', related_name='compositions', on_delete=models.CASCADE
    )
    name = models.CharField(max_length=128, null=True, blank=True)
    width = models.PositiveSmallIntegerField()
    height = models.PositiveSmallIntegerField()
    tiles = models.ManyToManyField(Tile, related_name='compositions')
    slug = models.SlugField(max_length=50)
    public = models.BooleanField(default=False)
    featured = models.BooleanField(default=False)
    featured_requested_at = models.DateTimeField(null=True)
    image = models.FileField(upload_to=composition_upload_to, null=True)

    MIN_SLUG_LENGTH = 8
    MAX_SLUG_LENGTH = 50

    objects = CompositionManager()

    class Meta:
        ordering = ['-created_at']

    @property
    def size(self) -> dict:
        return {'width': self.width, 'height': self.height}

    @cached_property
    def images(self) -> List[Image]:
        images: List[
            Image
        ] = []  # Don't use the 'set' data type to preserve order.
        for tile in self.tiles.all():
            if tile.image not in images:
                images.append(tile.image)
        return images

    def generate_slug(self):
        self.id = uuid.uuid4()
        self.slug = find_shortest_str(
            int_to_base36(self.id.int),
            test_fn=Composition.objects.slug_doesnt_exist,
            length=self.MIN_SLUG_LENGTH,
        )
        if self.slug is None:
            raise TessellationError('Slug collision')
        iterations = len(self.slug) - self.MIN_SLUG_LENGTH + 1
        logger.info(f'Generated new slug in {iterations} interations')

    def save(self, *args, **kwargs):
        if (
            not self.owner.is_superuser
            and Composition.objects.filter(owner=self.owner).count()
            >= settings.MAX_COMPOSITIONS_PER_USER
        ):
            raise TessellationError(
                'Reached the maximum number of published compositions'
            )
        if not self.slug:
            self.generate_slug()
        super().save(*args, **kwargs)

    def render(self, images: List[Image], tiles: List[Tile]):
        composition = generate_composition(tiles, self.width, self.height)
        tile_size = calc_render_tile_size(composition)
        f = io.BytesIO()
        render_composition(
            composition,
            images,
            tiles,
            tile_size,
            f,
        )
        self.image.save('ignored', File(f))

    @transaction.atomic
    def delete(self, *args, **kwargs):
        Image.objects.filter(tiles__compositions__id=self.pk).delete()
        super().delete(*args, **kwargs)

    def __str__(self) -> str:
        return str(self.id)
