import uuid
from unittest.mock import patch

from ddt import data, ddt, unpack
from django.contrib.auth.models import User
from django.test import TestCase, override_settings

from tessellation.models import Composition, TessellationError, find_shortest_str


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

    @override_settings(MAX_COMPOSITIONS_PER_USER=3)
    def test_regular_user_has_limited_number_of_compositions(self):
        user = User.objects.create_user(
            'maxcompositionsuser',
            'maxcompositionsuser@example.com',
            'maxcompositionsuserpassword',
        )
        Composition.objects.create(owner=user, width=1, height=1)
        Composition.objects.create(owner=user, width=2, height=2)
        Composition.objects.create(owner=user, width=3, height=3)
        with self.assertRaises(TessellationError):
            Composition.objects.create(owner=user, width=4, height=4)
        self.assertEqual(Composition.objects.filter(owner=user).count(), 3)

    @override_settings(MAX_COMPOSITIONS_PER_USER=3)
    def test_superuser_has_unlimited_number_of_compositions(self):
        superuser = User.objects.create_superuser(
            'maxcompositionsadmin',
            'maxcompositionsadmin@example.com',
            'maxcompositionsadminpassword',
        )
        Composition.objects.create(owner=superuser, width=1, height=1)
        Composition.objects.create(owner=superuser, width=2, height=2)
        Composition.objects.create(owner=superuser, width=3, height=3)
        Composition.objects.create(owner=superuser, width=4, height=4)
        self.assertEqual(
            Composition.objects.filter(owner=superuser).count(), 4
        )

    @override_settings(MIN_SLUG_LENGTH=25)
    def test_slug_collision(self, *args):
        user = User.objects.create_user('sluguser')
        with patch('uuid.uuid4', return_value=uuid.uuid4()):
            Composition.objects.create(owner=user, width=1, height=1)
            with self.assertRaises(TessellationError):
                Composition.objects.create(owner=user, width=2, height=2)
