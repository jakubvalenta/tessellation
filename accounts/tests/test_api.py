from django.contrib.auth.models import User
from django.test import TestCase, override_settings
from rest_framework.test import APIClient


class TestUserAPI(TestCase):
    @classmethod
    def setUpTestData(cls):
        User.objects.create_user("alice", "alice@example.com", "alicepassword")
        User.objects.create_superuser(
            "accountsadmin",
            "accountsadmin@example.com",
            "accountsadminpassword",
        )

    def test_get_user_api_requires_authentication(self):
        client = APIClient()
        response = client.get("/accounts/api/users/me", format="json")
        assert response.status_code == 403

    @override_settings(MAX_COMPOSITIONS_PER_USER=3)
    def test_get_user_api_returns_current_user_information(self):
        client = APIClient()
        client.login(username="alice", password="alicepassword")
        response = client.get("/accounts/api/users/me", format="json")
        data = response.json()
        assert data["username"] == "alice"
        assert data["is_authenticated"]
        assert not data["is_staff"]
        assert data["max_compositions"] == 3
        assert data["url_admin"] == "/admin/"
        assert data["url_logout"] == "/accounts/logout/"
        assert data["url_profile"] == "/accounts/profile/"

    def test_get_user_api_returns_superuser_information(self):
        client = APIClient()
        client.login(username="accountsadmin", password="accountsadminpassword")
        response = client.get("/accounts/api/users/me", format="json")
        data = response.json()
        assert data["username"] == "accountsadmin"
        assert data["is_authenticated"]
        assert data["is_staff"]
        assert data["max_compositions"] == -1
