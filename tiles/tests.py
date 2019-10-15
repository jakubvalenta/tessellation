from django.test import TestCase

from tiles.models import find_shortest_str


class TestModels(TestCase):
    def test_find_shortest_str(self):
        result = find_shortest_str('a', test_fn=lambda x: x not in ['x'])
        result = find_shortest_str(
            'abc', test_fn=lambda x: x not in ['a', 'x']
        )
        self.assertEqual(result, 'ab')
        result = find_shortest_str(
            'abc', test_fn=lambda x: x not in ['a', 'ab']
        )
        self.assertEqual(result, 'abc')
        result = find_shortest_str(
            'abc', test_fn=lambda x: x not in ['a', 'ab', 'abc']
        )
        self.assertIsNone(result)
