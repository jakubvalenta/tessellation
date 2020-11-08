from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from tessellation.models import Composition


class TestAPI(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            'user1', 'example1@example.com', 'user1password'
        )
        Composition.objects.create(
            owner=self.user1,
            name='User1\'s public composition',
            width=10,
            height=10,
            public=True,
        )
        Composition.objects.create(
            owner=self.user1,
            name='User1\'s private composition',
            width=10,
            height=10,
            public=False,
        )
        self.user2 = User.objects.create_user(
            'user2', 'example2@example.com', 'user2password'
        )
        Composition.objects.create(
            owner=self.user2,
            name='User2\'s public composition',
            width=10,
            height=10,
            public=True,
        )
        Composition.objects.create(
            owner=self.user2,
            name='User2\'s private composition',
            width=10,
            height=10,
            public=False,
        )

    def test_composition_list_requires_authentication(self):
        client = APIClient()
        response = client.get('/api/compositions/', format='json')
        self.assertEqual(response.status_code, 403)

    def test_composition_list_returns_all_users_compositions(self):
        client = APIClient()
        client.login(username='user1', password='user1password')
        response = client.get('/api/compositions/', format='json')
        data = response.json()
        self.assertEqual(len(data), 2)
        self.assertEqual(data[0]['name'], 'User1\'s private composition')
        self.assertEqual(data[1]['name'], 'User1\'s public composition')
