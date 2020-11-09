import base64

from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from tessellation.models import Composition


class TestAPI(TestCase):
    maxDiff = None

    @classmethod
    def setUpTestData(cls):
        cls.user1 = User.objects.create_user(
            'user1', 'example1@example.com', 'user1password'
        )
        Composition.objects.create(
            owner=cls.user1,
            name='User1\'s public composition',
            width=10,
            height=10,
            public=True,
        )
        Composition.objects.create(
            owner=cls.user1,
            name='User1\'s private composition',
            width=10,
            height=10,
            public=False,
        )
        cls.user2 = User.objects.create_user(
            'user2', 'example2@example.com', 'user2password'
        )
        Composition.objects.create(
            owner=cls.user2,
            name='User2\'s public composition',
            width=10,
            height=10,
            public=True,
        )
        Composition.objects.create(
            owner=cls.user2,
            name='User2\'s private composition',
            width=10,
            height=10,
            public=False,
        )

    def test_list_compositions_api_requires_authentication(self):
        client = APIClient()
        response = client.get('/api/compositions/', format='json')
        self.assertEqual(response.status_code, 403)

    def test_list_compositions_api_returns_all_users_compositions(self):
        client = APIClient()
        client.login(username='user1', password='user1password')
        response = client.get('/api/compositions/', format='json')
        data = response.json()
        self.assertEqual(len(data), 2)
        self.assertEqual(data[0]['name'], 'User1\'s private composition')
        self.assertEqual(data[1]['name'], 'User1\'s public composition')

    def test_create_composition_api_requires_authentication(self):
        client = APIClient()
        response = client.post('/api/compositions/', format='json')
        self.assertEqual(response.status_code, 403)

    def test_create_composition_api_creates_composition(self):
        image_data = 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAwIiBoZWlnaHQ9IjEwMDAiPjxwYXRoIGQ9Ik0wIDBsMTAwMCAxMDAwVjBIMCIvPjwvc3ZnPg=='  # noqa: E501
        client = APIClient()
        client.login(username='user1', password='user1password')
        response = client.post(
            '/api/compositions/',
            {
                'images': [
                    {
                        'connections': [1, 2, 2, 1],
                        'data': f'data:image/svg+xml;base64,{image_data}',
                        'ref': 'myimageref',
                    }
                ],
                'name': 'User1\'s new composition',
                'public': True,
                'size': {'height': 4, 'width': 4},
                'tiles': [
                    {
                        'imgRef': 'myimageref',
                        'rotation': 0,
                    },
                    {
                        'imgRef': 'myimageref',
                        'rotation': 1,
                    },
                    {
                        'imgRef': 'myimageref',
                        'rotation': 2,
                    },
                    {
                        'imgRef': 'myimageref',
                        'rotation': 3,
                    },
                ],
            },
            format='json',
        )
        new_composition = Composition.objects.get(
            name='User1\'s new composition'
        )
        self.assertEqual(new_composition.public, True)
        self.assertEqual(new_composition.width, 4)
        self.assertEqual(new_composition.height, 4)
        self.assertEqual(len(new_composition.images), 1)
        new_image = new_composition.images[0]
        with new_image.image.open('rb') as f:
            new_image_data = base64.b64encode(f.read()).decode()
            self.assertEqual(new_image_data, image_data)
        self.assertNotEqual(new_image.pk, 'myimageref')
        new_tiles = list(new_composition.tiles.all())
        self.assertEqual(len(new_tiles), 4)
        self.assertEqual(new_tiles[0].rotation, 0)
        self.assertEqual(new_tiles[0].image, new_image)
        self.assertEqual(new_tiles[1].rotation, 1)
        self.assertEqual(new_tiles[1].image, new_image)
        self.assertEqual(new_tiles[2].rotation, 2)
        self.assertEqual(new_tiles[2].image, new_image)
        self.assertEqual(new_tiles[3].rotation, 3)
        self.assertEqual(new_tiles[3].image, new_image)
