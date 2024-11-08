import base64

import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient

from tessellation.models import Composition


@pytest.fixture(autouse=True, scope="module")
def user_alice(django_db_blocker):
    with django_db_blocker.unblock():
        user = User.objects.create_user("alice", "alice@example.com", "alicepassword")
        Composition.objects.create(
            owner=user,
            name="Alice's composition",
            slug="alice-composition",
            width=10,
            height=10,
            public=True,
        )
        return user


@pytest.fixture(autouse=True, scope="module")
def user_bob(django_db_blocker):
    with django_db_blocker.unblock():
        user = User.objects.create_user("bob", "bob@example.com", "bobpassword")
        Composition.objects.create(
            owner=user,
            name="Bob's composition",
            slug="bob-composition",
            width=10,
            height=10,
            public=True,
        )
        return user


def test_list_compositions_api_requires_authentication():
    client = APIClient()
    response = client.get("/api/compositions/", format="json")
    assert response.status_code == 403


def test_list_compositions_api_returns_all_users_compositions():
    client = APIClient()
    client.login(username="alice", password="alicepassword")
    response = client.get("/api/compositions/", format="json")
    data = response.json()
    assert len(data) == 1
    assert data[0]["slug"] == "alice-composition"


def test_create_composition_api_requires_authentication():
    client = APIClient()
    response = client.post("/api/compositions/", format="json")
    assert response.status_code == 403


def test_create_composition_api_creates_composition():
    image_data = "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAwIiBoZWlnaHQ9IjEwMDAiPjxwYXRoIGQ9Ik0wIDBsMTAwMCAxMDAwVjBIMCIvPjwvc3ZnPg=="  # noqa: E501
    client = APIClient()
    client.login(username="alice", password="alicepassword")
    client.post(
        "/api/compositions/",
        {
            "images": [
                {
                    "connections": [1, 2, 2, 1],
                    "data": f"data:image/svg+xml;base64,{image_data}",
                    "ref": "myimageref",
                }
            ],
            "name": "Alice's new composition",
            "public": True,
            "size": {"height": 4, "width": 5},
            "tiles": [
                {
                    "imgRef": "myimageref",
                    "rotation": 0,
                },
                {
                    "imgRef": "myimageref",
                    "rotation": 1,
                },
                {
                    "imgRef": "myimageref",
                    "rotation": 2,
                },
                {
                    "imgRef": "myimageref",
                    "rotation": 3,
                },
            ],
        },
        format="json",
    )
    new_composition = Composition.objects.get(name="Alice's new composition")
    assert new_composition.public
    assert new_composition.width == 5
    assert new_composition.height == 4
    assert len(new_composition.images) == 1
    new_image = new_composition.images[0]
    with new_image.image.open("rb") as f:
        new_image_data = base64.b64encode(f.read()).decode()
        assert new_image_data == image_data
    assert new_image.pk != "myimageref"
    new_tiles = list(new_composition.tiles.all())
    assert len(new_tiles) == 4
    assert new_tiles[0].rotation == 0
    assert new_tiles[0].image == new_image
    assert new_tiles[1].rotation == 1
    assert new_tiles[1].image == new_image
    assert new_tiles[2].rotation == 2
    assert new_tiles[2].image == new_image
    assert new_tiles[3].rotation == 3
    assert new_tiles[3].image == new_image


def test_create_composition_api_limits_maximum_upload_size(settings):
    settings.MAX_UPLOAD_SIZE_BYTES = 10
    image_data = "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAwIiBoZWlnaHQ9IjEwMDAiPjxwYXRoIGQ9Ik0wIDBsMTAwMCAxMDAwVjBIMCIvPjwvc3ZnPg=="  # noqa: E501
    client = APIClient()
    client.login(username="alice", password="alicepassword")
    response = client.post(
        "/api/compositions/",
        {
            "images": [
                {
                    "connections": [1, 2, 2, 1],
                    "data": f"data:image/svg+xml;base64,{image_data}",
                    "ref": "myimageref",
                }
            ],
            "name": "Alice's new composition",
            "public": True,
            "size": {"height": 4, "width": 5},
            "tiles": [
                {
                    "imgRef": "myimageref",
                    "rotation": 0,
                },
                {
                    "imgRef": "myimageref",
                    "rotation": 1,
                },
                {
                    "imgRef": "myimageref",
                    "rotation": 2,
                },
                {
                    "imgRef": "myimageref",
                    "rotation": 3,
                },
            ],
        },
        format="json",
    )
    assert response.status_code == 400


def test_create_composition_api_requires_size():
    client = APIClient()
    client.login(username="alice", password="alicepassword")
    response = client.post(
        "/api/compositions/",
        {
            "images": [],
            "tiles": [],
        },
        format="json",
    )
    assert response.status_code == 400


def test_create_composition_api_creates_composition_with_defaults():
    client = APIClient()
    client.login(username="alice", password="alicepassword")
    response = client.post(
        "/api/compositions/",
        {
            "images": [],
            "size": {"height": 4, "width": 5},
            "tiles": [],
        },
        format="json",
    )
    new_slug = response.json()["slug"]
    new_composition = Composition.objects.get(slug=new_slug)
    assert not new_composition.public
    assert not new_composition.featured
    assert new_composition.width == 5
    assert new_composition.height == 4
    assert len(new_composition.images) == 0
    assert new_composition.tiles.count() == 0


def test_get_composition_api_requires_authentication():
    client = APIClient()
    response = client.get("/api/compositions/alice-composition", format="json")
    assert response.status_code == 403


def test_get_composition_api_requires_ownership():
    client = APIClient()
    client.login(username="bob", password="bobpassword")
    response = client.get("/api/compositions/alice-composition", format="json")
    assert response.status_code == 404


def test_get_composition_api_returns_owners_composition():
    client = APIClient()
    client.login(username="alice", password="alicepassword")
    response = client.get("/api/compositions/alice-composition", format="json")
    data = response.json()
    assert data["name"] == "Alice's composition"


def test_update_composition_api_requires_authentication():
    client = APIClient()
    response = client.put("/api/compositions/bob-composition", {}, format="json")
    assert response.status_code == 403


def test_update_composition_api_requires_ownership():
    client = APIClient()
    response = client.put("/api/compositions/bob-composition", {}, format="json")
    assert response.status_code == 403


def test_update_composition_api_doesnt_allow_updating_images_or_tiles(user_alice):
    Composition.objects.create(
        owner=user_alice,
        name="Alice's old composition",
        slug="alice-old-composition",
        width=10,
        height=10,
    )
    client = APIClient()
    client.login(username="alice", password="alicepassword")
    response = client.put(
        "/api/compositions/alice-old-composition",
        {
            "images": [],
            "name": "Alice's updated composition",
            "size": {"height": 4, "width": 4},
            "tiles": [],
        },
        format="json",
    )
    response = client.patch(
        "/api/compositions/alice-old-composition",
        {
            "images": [],
        },
        format="json",
    )
    assert response.status_code == 400
    response = client.patch(
        "/api/compositions/alice-old-composition",
        {
            "tiles": [],
        },
        format="json",
    )
    assert response.status_code == 400


def test_update_composition_api_updates_owners_composition(user_bob):
    Composition.objects.create(
        owner=user_bob,
        name="Bob's old composition",
        slug="bob-old-composition",
        width=10,
        height=10,
    )
    client = APIClient()
    client.login(username="bob", password="bobpassword")
    client.patch(
        "/api/compositions/bob-old-composition",
        {
            "name": "Bob's updated composition",
        },
        format="json",
    )
    updated_composition = Composition.objects.get(slug="bob-old-composition")
    assert updated_composition.name == "Bob's updated composition"


def test_delete_composition_api_requires_authentication():
    client = APIClient()
    response = client.delete("/api/compositions/bob-composition", format="json")
    assert response.status_code == 403


def test_delete_composition_api_requires_ownership():
    client = APIClient()
    response = client.delete("/api/compositions/bob-composition", format="json")
    assert response.status_code == 403


def test_delete_composition_api_updates_owners_composition(user_bob):
    Composition.objects.create(
        owner=user_bob,
        name="Bob's old composition",
        slug="bob-composition-to-delete",
        width=10,
        height=10,
    )
    client = APIClient()
    client.login(username="bob", password="bobpassword")
    client.delete("/api/compositions/bob-composition-to-delete", format="json")
    with pytest.raises(Composition.DoesNotExist):
        Composition.objects.get(slug="bob-old-composition")
