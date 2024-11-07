from tempfile import mkdtemp

import pytest
from django.contrib.auth.models import User
from django.test import TestCase, override_settings

from tessellation.management.commands import populate_db
from tessellation.models import Composition

tmp_media_root = mkdtemp("tessellation-tests")


@override_settings(MEDIA_ROOT=tmp_media_root)
class TestPopulateDB(TestCase):
    def test_populate_db_loads_fixture(self):
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

    def test_populate_db_requires_superuser(self):
        command = populate_db.Command()
        with pytest.raises(populate_db.FixtureError):
            command.handle()
