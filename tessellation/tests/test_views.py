import shutil
from tempfile import mkdtemp

from django.contrib.auth.models import User
from django.test import Client, TestCase, override_settings

from tessellation.models import Composition

tmp_media_root = mkdtemp('tessellation-tests')


@override_settings(MEDIA_ROOT=tmp_media_root)
class TestViews(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user_charlie = User.objects.create_user(
            'charlie', 'charlie@example.com', 'charliepassword'
        )
        cls.user_mallory = User.objects.create_user(
            'mallory', 'mallory@example.com', 'mallorypassword'
        )
        cls.public_composition = Composition.objects.create(
            owner=cls.user_charlie,
            name="Charlie's public composition",
            slug='charlie-public-composition',
            width=10,
            height=10,
            public=True,
        )
        cls.private_composition = Composition.objects.create(
            owner=cls.user_charlie,
            name="Charlie's private composition",
            slug='charlie-private-composition',
            width=10,
            height=10,
            public=False,
        )
        cls.featured_composition = Composition.objects.create(
            owner=cls.user_charlie,
            name="Charlie's featured composition",
            slug='charlie-featured-composition',
            width=10,
            height=10,
            public=True,
            featured=True,
        )
        cls.newer_featured_composition = Composition.objects.create(
            owner=cls.user_charlie,
            name="Charlie's newer featured composition",
            slug='charlie-newer-featured-composition',
            width=10,
            height=10,
            public=True,
            featured=True,
        )
        cls.featured_private_composition = Composition.objects.create(
            owner=cls.user_charlie,
            name="Charlie's featured private composition",
            slug='charlie-featured-private-composition',
            width=10,
            height=10,
            public=False,
            featured=True,
        )

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(tmp_media_root, ignore_errors=True)

    def test_composition_list_view_shows_all_featured_compositions(self):
        client = Client()
        response = client.get('/explore/')
        context_compositions = response.context['compositions']
        self.assertEqual(len(context_compositions), 2)
        self.assertEqual(
            context_compositions[0], self.newer_featured_composition
        )
        self.assertEqual(context_compositions[1], self.featured_composition)

    def test_composition_detail_view_returns_public_composition(self):
        client = Client()
        response = client.get('/explore/charlie-public-composition/')
        context_composition = response.context['composition']
        self.assertEqual(context_composition, self.public_composition)

    def test_composition_detail_view_returns_featured_composition(self):
        client = Client()
        response = client.get('/explore/charlie-featured-composition/')
        context_composition = response.context['composition']
        self.assertEqual(context_composition, self.featured_composition)

    def test_composition_detail_view_returns_owners_private_composition(self):
        client = Client()
        client.login(username='charlie', password='charliepassword')
        response = client.get('/explore/charlie-private-composition/')
        context_composition = response.context['composition']
        self.assertEqual(context_composition, self.private_composition)

    def test_composition_detail_view_returns_owners_featured_private_composition(
        self,
    ):
        client = Client()
        client.login(username='charlie', password='charliepassword')
        response = client.get('/explore/charlie-featured-private-composition/')
        context_composition = response.context['composition']
        self.assertEqual(
            context_composition, self.featured_private_composition
        )

    def test_composition_detail_view_doesnt_return_private_composition(self):
        client = Client()
        response = client.get('/explore/charlie-private-composition/')
        self.assertEqual(response.status_code, 404)

    def test_composition_detail_view_doesnt_return_private_featured_composition(
        self,
    ):
        client = Client()
        response = client.get('/explore/charlie-featured-private-composition/')
        self.assertEqual(response.status_code, 404)

    def test_composition_detail_view_doesnt_return_another_owners_private_composition(
        self,
    ):
        client = Client()
        client.login(username='mallory', password='mallorypassword')
        response = client.get('/explore/charlie-private-composition/')
        self.assertEqual(response.status_code, 404)

    def test_composition_edit_view_returns_public_composition(self):
        client = Client()
        response = client.get('/create/charlie-public-composition/')
        context_composition = response.context['composition']
        self.assertEqual(context_composition, self.public_composition)

    def test_composition_edit_view_returns_featured_composition(self):
        client = Client()
        response = client.get('/create/charlie-featured-composition/')
        context_composition = response.context['composition']
        self.assertEqual(context_composition, self.featured_composition)

    def test_composition_edit_view_returns_owners_private_composition(self):
        client = Client()
        client.login(username='charlie', password='charliepassword')
        response = client.get('/create/charlie-private-composition/')
        context_composition = response.context['composition']
        self.assertEqual(context_composition, self.private_composition)

    def test_composition_edit_view_returns_owners_featured_private_composition(
        self,
    ):
        client = Client()
        client.login(username='charlie', password='charliepassword')
        response = client.get('/create/charlie-featured-private-composition/')
        context_composition = response.context['composition']
        self.assertEqual(
            context_composition, self.featured_private_composition
        )

    def test_composition_edit_view_doesnt_return_private_composition(self):
        client = Client()
        response = client.get('/create/charlie-private-composition/')
        self.assertEqual(response.status_code, 404)

    def test_composition_edit_view_doesnt_return_private_featured_composition(
        self,
    ):
        client = Client()
        response = client.get('/create/charlie-featured-private-composition/')
        self.assertEqual(response.status_code, 404)

    def test_composition_edit_view_doesnt_return_another_owners_private_composition(
        self,
    ):
        client = Client()
        client.login(username='mallory', password='mallorypassword')
        response = client.get('/create/charlie-private-composition/')
        self.assertEqual(response.status_code, 404)

    def test_composition_create_view_returns_oldest_public_featured_composition(
        self,
    ):
        client = Client()
        response = client.get('/create/')
        context_composition = response.context['composition']
        self.assertEqual(context_composition, self.featured_composition)
