from django.contrib.auth.models import User
from django.test import TestCase, override_settings
from rest_framework.test import APIClient


class TestUserAPI(TestCase):
    @classmethod
    def setUpTestData(cls):
        User.objects.create_user('alice', 'alice@example.com', 'alicepassword')
        User.objects.create_superuser(
            'accountsadmin',
            'accountsadmin@example.com',
            'accountsadminpassword',
        )

    def test_get_user_api_requires_authentication(self):
        client = APIClient()
        response = client.get('/accounts/api/users/me', format='json')
        self.assertEqual(response.status_code, 403)

    @override_settings(MAX_COMPOSITIONS_PER_USER=3)
    def test_get_user_api_returns_current_user_information(self):
        client = APIClient()
        client.login(username='alice', password='alicepassword')
        response = client.get('/accounts/api/users/me', format='json')
        data = response.json()
        self.assertEqual(data['username'], 'alice')
        self.assertTrue(data['is_authenticated'])
        self.assertFalse(data['is_staff'])
        self.assertEqual(data['max_compositions'], 3)
        self.assertEqual(data['url_admin'], '/admin/')
        self.assertEqual(data['url_logout'], '/accounts/logout/')
        self.assertEqual(data['url_profile'], '/accounts/profile/')

    def test_get_user_api_returns_superuser_information(self):
        client = APIClient()
        client.login(
            username='accountsadmin', password='accountsadminpassword'
        )
        response = client.get('/accounts/api/users/me', format='json')
        data = response.json()
        self.assertEqual(data['username'], 'accountsadmin')
        self.assertTrue(data['is_authenticated'])
        self.assertTrue(data['is_staff'])
        self.assertEqual(data['max_compositions'], -1)
