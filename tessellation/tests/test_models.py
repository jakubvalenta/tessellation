import uuid
from unittest.mock import patch

import pytest
from django.contrib.auth.models import User

from tessellation.models import Composition, TessellationError, find_shortest_str


@pytest.mark.parametrize(
    ("s", "existing_s", "expected"),
    [
        ("abc", ["a", "x"], "ab"),
        ("abc", ["a", "ab"], "abc"),
        ("abc", ["a", "ab", "abc"], None),
    ],
)
def test_find_shortest_str(s, existing_s, expected):
    result = find_shortest_str(s, test_fn=lambda x: x not in existing_s)
    assert result == expected


def test_regular_user_has_limited_number_of_compositions(settings):
    settings.MAX_COMPOSITIONS_PER_USER = 3
    user = User.objects.create_user(
        "maxcompositionsuser",
        "maxcompositionsuser@example.com",
        "maxcompositionsuserpassword",
    )
    Composition.objects.create(owner=user, width=1, height=1)
    Composition.objects.create(owner=user, width=2, height=2)
    Composition.objects.create(owner=user, width=3, height=3)
    with pytest.raises(TessellationError):
        Composition.objects.create(owner=user, width=4, height=4)
    assert Composition.objects.filter(owner=user).count() == 3


def test_superuser_has_unlimited_number_of_compositions(settings):
    settings.MAX_COMPOSITIONS_PER_USER = 3
    superuser = User.objects.create_superuser(
        "maxcompositionsadmin",
        "maxcompositionsadmin@example.com",
        "maxcompositionsadminpassword",
    )
    Composition.objects.create(owner=superuser, width=1, height=1)
    Composition.objects.create(owner=superuser, width=2, height=2)
    Composition.objects.create(owner=superuser, width=3, height=3)
    Composition.objects.create(owner=superuser, width=4, height=4)
    assert Composition.objects.filter(owner=superuser).count() == 4


def test_slug_collision(settings):
    settings.MIN_SLUG_LENGTH = 25
    user = User.objects.create_user("sluguser")
    with patch("uuid.uuid4", return_value=uuid.uuid4()):
        Composition.objects.create(owner=user, width=1, height=1)
        with pytest.raises(TessellationError):
            Composition.objects.create(owner=user, width=2, height=2)
