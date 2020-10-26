import itertools
import logging
import random
import time
from dataclasses import dataclass
from typing import Callable, Dict, Iterator, List, Optional, Sequence

from tessellation.models import BOTTOM, LEFT, RIGHT, SIDES, TOP, Image, Tile

logger = logging.getLogger(__name__)

TComposition = List[List[Optional[Tile]]]
TTried = List[List[List[Tile]]]
TStack = List[Tile]
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
    images: Sequence[Image], allow_rotation: bool = True
) -> List[Tile]:
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


def fits(tile: Tile, requirements: Sequence[Requirement]) -> bool:
    for requirement in requirements:
        if tile.get_connection(requirement.side) != requirement.connection:
            return False
    return True


def choose_tile(
    stack: TStack,
    requirements: Sequence[Requirement],
    excl: Sequence[Tile],
    update_stack_func: TUpdateStackFunc,
) -> Optional[Tile]:
    for i in range(len(stack)):
        tile = stack[i]
        if tile not in excl and fits(tile, requirements):
            update_stack_func(stack, i)
            return tile
    return None


def generate_composition(
    tiles: List[Tile],
    width: int,
    height: int,
    max_steps: int = pow(2, 18),
    update_stack_func_name: str = UPDATE_STACK_FUNC_DEFAULT_NAME,
) -> TComposition:
    logger.info(f'Generating composition {update_stack_func_name=}')
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
                    raise Exception("Input tiles don't connect.")
                row -= 1
                col = width - 1
            else:
                col -= 1
        if i >= max_steps:
            raise Exception(
                f'Failed to calculate composition in {max_steps} steps.'
            )
        i += 1
    t1 = time.time()
    logger.info(f'Generated composition in {t1 - t0:.5f}ms')
    return composition
