import logging
import uuid
from pathlib import Path
from typing import Callable, List, Optional

from django.contrib.postgres.fields import ArrayField
from django.db import models, transaction
from django.utils.functional import cached_property
from django.utils.http import int_to_base36

from tessellation.managers import CompositionManager

logger = logging.getLogger(__name__)

SIDES = [0, 1, 2, 3]
SIDE_NAMES = ['left', 'top', 'right', 'bottom']
CONNECTIONS = [1, 2, 3, 4, 5]
(LEFT, TOP, RIGHT, BOTTOM) = SIDES


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


class Composition(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now=True)
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
            raise Exception('Slug collision')
        iterations = len(self.slug) - self.MIN_SLUG_LENGTH + 1
        logger.info(f'Generated new slug in {iterations} interations')

    def save(self, *args, **kwargs):
        if not self.slug:
            self.generate_slug()
        super().save(*args, **kwargs)

    @transaction.atomic
    def delete(self, *args, **kwargs):
        Image.objects.filter(tiles__compositions__id=self.pk).delete()
        super().delete(*args, **kwargs)

    @property
    def title(self) -> str:
        name = f'{self.name} / ' if self.name else ''
        return f'Composition {name}{self.slug}'

    def __str__(self) -> str:
        return str(self.id)
