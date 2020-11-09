import math
from pathlib import Path
from unittest import skip

from django.core.files import File
from django.test import TestCase

from tessellation.models import (
    Image, calc_render_tile_size, generate_composition, generate_tiles, read_im, render_composition,
    reverse_digits,
)

test_data_dir = Path(__file__).parent / 'test_data'
results_dir = Path(__file__).parents[2] / 'results'


class TestComposition(TestCase):
    def test_reverse_number_single_digit(self):
        self.assertEqual(reverse_digits(0), 0)
        self.assertEqual(reverse_digits(1), 1)

    def test_reverse_number_multi_digit(self):
        self.assertEqual(reverse_digits(12), 21)
        self.assertEqual(reverse_digits(9986), 6899)

    def test_generate_composition_small(self):
        images = [Image(connections=[1, 2, 2, 1])]
        tiles = generate_tiles(images)
        expected = [
            [tiles[0], tiles[1], tiles[3]],
            [tiles[2], tiles[3], tiles[1]],
            [tiles[0], tiles[1], tiles[3]],
        ]
        width, height = len(expected[0]), len(expected)
        self.assertEqual(generate_composition(tiles, width, height), expected)

    @skip('Skipped')
    def test_generate_composition_large(self):
        images = [
            Image(connections=[1, 1, 1, 1]),
            Image(connections=[2, 2, 1, 2]),
            Image(connections=[1, 2, 2, 1]),
            Image(connections=[1, 1, 2, 1]),
            Image(connections=[2, 2, 2, 2]),
        ]
        tiles = generate_tiles(images)
        width, height = 500, 500
        self.assertIsNotNone(generate_composition(tiles, width, height))

    def test_generate_composition_multi_digit_connections(self):
        images = [Image(connections=[1, 12, 1, 21])]
        tiles = generate_tiles(images)
        expected = [
            [tiles[0], tiles[2], tiles[0]],
            [tiles[0], tiles[2], tiles[0]],
            [tiles[0], tiles[2], tiles[0]],
        ]
        width, height = len(expected[0]), len(expected)
        self.assertEqual(generate_composition(tiles, width, height), expected)

    def test_generate_composition_limit_steps(self):
        images = [
            Image(connections=[1, 1, 1, 1]),
            Image(connections=[2, 2, 1, 2]),
            Image(connections=[1, 2, 2, 1]),
            Image(connections=[1, 1, 2, 1]),
            Image(connections=[2, 2, 2, 2]),
        ]
        tiles = generate_tiles(images)
        width, height = 500, 500
        with self.assertRaises(Exception):
            generate_composition(tiles, width, height, max_steps=pow(2, 10))

    def test_calc_render_tile_size(self):
        composition = [[None] * 2] * 4
        self.assertEqual(calc_render_tile_size(composition), 1920 / 2)
        composition = [[None] * 8] * 7
        self.assertEqual(
            calc_render_tile_size(composition), math.ceil(1920 / 7) + 1
        )

    def test_read_im_png(self):
        with open(test_data_dir / 'image.png', 'rb') as f:
            new_f = read_im(f)
            self.assertTrue(new_f)

    def test_read_im_svg(self):
        with open(test_data_dir / 'image.svg', 'rb') as f:
            new_f = read_im(f)
            self.assertTrue(new_f)

    def test_read_im_invalid(self):
        with open(test_data_dir / 'invalid.jpg', 'rb') as f:
            with self.assertRaises(Exception):
                read_im(f)

    def test_render_composition(self):
        with (test_data_dir / 'cargo.svg').open('rb') as f:
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
            with open(results_dir / 'composition.png', 'wb+') as f:
                render_composition(composition, images, tiles, tile_size, f)
                f.seek(0)
                self.assertTrue(f.read())
