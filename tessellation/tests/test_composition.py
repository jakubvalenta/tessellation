import itertools
import math
from pathlib import Path
from typing import List, Sequence
from xml.etree.ElementTree import ParseError

import pytest
from django.core.files import File

from tessellation.models import (
    SIDES,
    CompositionError,
    Image,
    Tile,
    calc_render_tile_size,
    generate_composition,
    read_im,
    render_composition,
    reverse_digits,
)

test_data_dir = Path(__file__).parent / "test_data"
results_dir = Path(__file__).parents[2] / "results"


def generate_tiles(images: Sequence["Image"]) -> List["Tile"]:
    return list(
        itertools.chain.from_iterable(
            (Tile(image=image, rotation=rotation) for rotation in SIDES) for image in images
        )
    )


def generate_tiles_without_rotation(images: Sequence["Image"]) -> List["Tile"]:
    return [Tile(image=image, rotation=0) for image in images]


def test_reverse_number_single_digit():
    assert reverse_digits(0) == 0
    assert reverse_digits(1) == 1


def test_reverse_number_multi_digit():
    assert reverse_digits(12) == 21
    assert reverse_digits(9986) == 6899


def test_generate_composition_small():
    images = [Image(connections=[1, 2, 2, 1])]
    tiles = generate_tiles(images)
    expected = [
        [tiles[0], tiles[1], tiles[3]],
        [tiles[2], tiles[3], tiles[1]],
        [tiles[0], tiles[1], tiles[3]],
    ]
    width, height = len(expected[0]), len(expected)
    assert generate_composition(tiles, width, height) == expected


@pytest.mark.skip(reason="takes too long")
def test_generate_composition_large():
    images = [
        Image(connections=[1, 1, 1, 1]),
        Image(connections=[2, 2, 1, 2]),
        Image(connections=[1, 2, 2, 1]),
        Image(connections=[1, 1, 2, 1]),
        Image(connections=[2, 2, 2, 2]),
    ]
    tiles = generate_tiles(images)
    width, height = 500, 500
    assert generate_composition(tiles, width, height) is not None


def test_generate_composition_multi_digit_connections():
    images = [Image(connections=[1, 12, 1, 21])]
    tiles = generate_tiles(images)
    expected = [
        [tiles[0], tiles[2], tiles[0]],
        [tiles[0], tiles[2], tiles[0]],
        [tiles[0], tiles[2], tiles[0]],
    ]
    width, height = len(expected[0]), len(expected)
    assert generate_composition(tiles, width, height) == expected


def test_generate_composition_limit_steps():
    images = [
        Image(connections=[1, 1, 1, 1]),
        Image(connections=[2, 2, 1, 2]),
        Image(connections=[1, 2, 2, 1]),
        Image(connections=[1, 1, 2, 1]),
        Image(connections=[2, 2, 2, 2]),
    ]
    tiles = generate_tiles(images)
    width, height = 500, 500
    with pytest.raises(CompositionError):
        generate_composition(tiles, width, height, max_steps=pow(2, 10))


def test_generate_composition_go_back():
    images = [Image(connections=[1, 3, 2, 1])]
    tiles = generate_tiles(images)
    expected = [
        [tiles[0], tiles[2], tiles[0]],
        [tiles[2], tiles[0], tiles[2]],
        [tiles[0], tiles[2], tiles[0]],
    ]
    width, height = len(expected[0]), len(expected)
    assert generate_composition(tiles, width, height) == expected


def test_generate_composition_that_doesnt_connect():
    images = [Image(connections=[1, 2, 1, 1])]
    tiles = generate_tiles_without_rotation(images)
    width, height = 3, 3
    with pytest.raises(CompositionError):
        generate_composition(tiles, width, height)


def test_calc_render_tile_size():
    composition = [[None] * 2] * 4
    assert calc_render_tile_size(composition) == 1920 / 2
    composition = [[None] * 8] * 7
    calc_render_tile_size(composition) == math.ceil(1920 / 7) + 1


def test_read_im_png():
    with open(test_data_dir / "image.png", "rb") as f:
        new_f = read_im(f)
        assert new_f


def test_read_im_svg():
    with open(test_data_dir / "image.svg", "rb") as f:
        new_f = read_im(f)
        assert new_f


def test_read_im_invalid():
    with open(test_data_dir / "invalid.jpg", "rb") as f:
        with pytest.raises(ParseError):
            read_im(f)


def test_render_composition():
    with (test_data_dir / "cargo.svg").open("rb") as f:
        tile_file = File(f)
        images = [Image(connections=[1, 2, 2, 1], image=tile_file)]
        tiles = generate_tiles(images)
        composition = [
            [tiles[0], tiles[1], tiles[3]],
            [tiles[2], tiles[3], tiles[1]],
            [tiles[0], tiles[1], tiles[3]],
        ]
        tile_size = 20
        results_dir.mkdir(exist_ok=True)
        with open(results_dir / "composition.png", "wb+") as f:
            render_composition(composition, images, tiles, tile_size, f)
            f.seek(0)
            assert f.read()
