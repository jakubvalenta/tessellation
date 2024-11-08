import pytest
from django.contrib.auth.models import User

from tessellation.models import Composition


@pytest.fixture(autouse=True, scope="module")
def user_charlie(django_db_blocker):
    with django_db_blocker.unblock():
        return User.objects.create_user("charlie", "charlie@example.com", "charliepassword")


@pytest.fixture(autouse=True, scope="module")
def user_mallory(django_db_blocker):
    with django_db_blocker.unblock():
        return User.objects.create_user("mallory", "mallory@example.com", "mallorypassword")


@pytest.fixture(autouse=True, scope="module")
def public_composition(django_db_blocker, user_charlie):
    with django_db_blocker.unblock():
        return Composition.objects.create(
            owner=user_charlie,
            name="Charlie's public composition",
            slug="charlie-public-composition",
            width=10,
            height=10,
            public=True,
        )


@pytest.fixture(autouse=True, scope="module")
def private_composition(django_db_blocker, user_charlie):
    with django_db_blocker.unblock():
        return Composition.objects.create(
            owner=user_charlie,
            name="Charlie's private composition",
            slug="charlie-private-composition",
            width=10,
            height=10,
            public=False,
        )


@pytest.fixture(autouse=True, scope="module")
def featured_composition(django_db_blocker, user_charlie):
    with django_db_blocker.unblock():
        return Composition.objects.create(
            owner=user_charlie,
            name="Charlie's featured composition",
            slug="charlie-featured-composition",
            width=10,
            height=10,
            public=True,
            featured=True,
        )


@pytest.fixture(autouse=True, scope="module")
def newer_featured_composition(django_db_blocker, user_charlie):
    with django_db_blocker.unblock():
        return Composition.objects.create(
            owner=user_charlie,
            name="Charlie's newer featured composition",
            slug="charlie-newer-featured-composition",
            width=10,
            height=10,
            public=True,
            featured=True,
        )


@pytest.fixture(autouse=True, scope="module")
def featured_private_composition(django_db_blocker, user_charlie):
    with django_db_blocker.unblock():
        return Composition.objects.create(
            owner=user_charlie,
            name="Charlie's featured private composition",
            slug="charlie-featured-private-composition",
            width=10,
            height=10,
            public=False,
            featured=True,
        )


def test_composition_list_view_shows_all_featured_compositions(
    client, featured_composition, newer_featured_composition
):
    response = client.get("/explore/")
    context_compositions = response.context["compositions"]
    assert len(context_compositions) == 2
    assert context_compositions[0] == newer_featured_composition
    assert context_compositions[1] == featured_composition


def test_composition_detail_view_returns_public_composition(client, public_composition):
    response = client.get("/explore/charlie-public-composition/")
    context_composition = response.context["composition"]
    assert context_composition == public_composition


def test_composition_detail_view_returns_featured_composition(client, featured_composition):
    response = client.get("/explore/charlie-featured-composition/")
    context_composition = response.context["composition"]
    assert context_composition == featured_composition


def test_composition_detail_view_returns_owners_private_composition(client, private_composition):
    client.login(username="charlie", password="charliepassword")
    response = client.get("/explore/charlie-private-composition/")
    context_composition = response.context["composition"]
    assert context_composition == private_composition


def test_composition_detail_view_returns_owners_featured_private_composition(
    client,
    featured_private_composition,
):
    client.login(username="charlie", password="charliepassword")
    response = client.get("/explore/charlie-featured-private-composition/")
    context_composition = response.context["composition"]
    assert context_composition == featured_private_composition


def test_composition_detail_view_doesnt_return_private_composition(client):
    response = client.get("/explore/charlie-private-composition/")
    assert response.status_code == 404


def test_composition_detail_view_doesnt_return_private_featured_composition(client):
    response = client.get("/explore/charlie-featured-private-composition/")
    assert response.status_code == 404


def test_composition_detail_view_doesnt_return_another_owners_private_composition(client):
    client.login(username="mallory", password="mallorypassword")
    response = client.get("/explore/charlie-private-composition/")
    assert response.status_code == 404


def test_composition_edit_view_returns_public_composition(client, public_composition):
    response = client.get("/create/charlie-public-composition/")
    context_composition = response.context["composition"]
    assert context_composition == public_composition


def test_composition_edit_view_returns_featured_composition(client, featured_composition):
    response = client.get("/create/charlie-featured-composition/")
    context_composition = response.context["composition"]
    assert context_composition == featured_composition


def test_composition_edit_view_returns_owners_private_composition(client, private_composition):
    client.login(username="charlie", password="charliepassword")
    response = client.get("/create/charlie-private-composition/")
    context_composition = response.context["composition"]
    assert context_composition == private_composition


def test_composition_edit_view_returns_owners_featured_private_composition(
    client,
    featured_private_composition,
):
    client.login(username="charlie", password="charliepassword")
    response = client.get("/create/charlie-featured-private-composition/")
    context_composition = response.context["composition"]
    assert context_composition == featured_private_composition


def test_composition_edit_view_doesnt_return_private_composition(client):
    response = client.get("/create/charlie-private-composition/")
    assert response.status_code == 404


def test_composition_edit_view_doesnt_return_private_featured_composition(client):
    response = client.get("/create/charlie-featured-private-composition/")
    assert response.status_code == 404


def test_composition_edit_view_doesnt_return_another_owners_private_composition(client):
    client.login(username="mallory", password="mallorypassword")
    response = client.get("/create/charlie-private-composition/")
    assert response.status_code == 404


def test_composition_create_view_returns_oldest_public_featured_composition(
    client, featured_composition
):
    response = client.get("/create/")
    context_composition = response.context["composition"]
    assert context_composition == featured_composition
