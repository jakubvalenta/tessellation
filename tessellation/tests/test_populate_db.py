import pytest
from django.contrib.auth.models import User

from tessellation.management.commands import populate_db
from tessellation.models import Composition


def test_populate_db_loads_fixture():
    User.objects.create_superuser(username="populatedbadmin")
    with pytest.raises(Composition.DoesNotExist):
        Composition.objects.get(name="Minimal")
    command = populate_db.Command()
    command.handle()
    composition = Composition.objects.get(name="Minimal")
    assert len(composition.images) == 5
    assert composition.tiles.count() == 5 * 4
    assert composition.public
    assert composition.featured


def test_populate_db_requires_superuser():
    command = populate_db.Command()
    with pytest.raises(populate_db.FixtureError):
        command.handle()
