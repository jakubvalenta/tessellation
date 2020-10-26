from unittest import skip

from django.test import TestCase

from tessellation.composition import generate_composition, generate_tiles, reverse_digits
from tessellation.models import Image


class TestComposition(TestCase):
    maxDiff = None

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
