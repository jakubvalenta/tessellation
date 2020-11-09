from tempfile import mkdtemp

from django.contrib.auth.models import User
from django.test import TestCase, override_settings

from tessellation.management.commands import populate_db
from tessellation.models import Composition

tmp_media_root = mkdtemp('tessellation-tests')


@override_settings(MEDIA_ROOT=tmp_media_root)
class TestPopulateDB(TestCase):
    def test_populate_db_loads_fixture(self):
        User.objects.create_superuser(username='populatedbadmin')
        with self.assertRaises(Composition.DoesNotExist):
            Composition.objects.get(name='Minimal')
        command = populate_db.Command()
        command.handle()
        composition = Composition.objects.get(name='Minimal')
        self.assertEqual(len(composition.images), 5)
        self.assertEqual(composition.tiles.count(), 5 * 4)
        self.assertTrue(composition.public)
        self.assertTrue(composition.featured)
