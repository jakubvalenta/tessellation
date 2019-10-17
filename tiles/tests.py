from ddt import data, ddt, unpack
from django.test import TestCase

from tiles.models import find_shortest_str


@ddt
class TestModels(TestCase):
    @data(
        ('abc', ['a', 'x'], 'ab'),
        ('abc', ['a', 'ab'], 'abc'),
        ('abc', ['a', 'ab', 'abc'], None),
    )
    @unpack
    def test_find_shortest_str(self, s, existing_s, expected):
        result = find_shortest_str(s, test_fn=lambda x: x not in existing_s)
        self.assertEqual(result, expected)
