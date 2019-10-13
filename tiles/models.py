import uuid
from pathlib import Path

from django.contrib.postgres.fields import ArrayField
from django.db import models


def image_upload_to(instance: 'Image', filename: str) -> str:
    suffix = Path(filename).suffix
    name = str(uuid.uuid4())
    path = (Path('images') / name).with_suffix(suffix)
    return str(path)


class Image(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now=True)
    image = models.ImageField(upload_to=image_upload_to, unique=True)
    connections = ArrayField(models.PositiveSmallIntegerField())

    def __str__(self):
        return str(self.id)


class Tile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now=True)
    image = models.ForeignKey(
        Image, on_delete=models.CASCADE, related_name='tiles'
    )
    rotation = models.PositiveSmallIntegerField()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['image', 'rotation'], name='unique_image_and_rotation'
            )
        ]

    def __str__(self):
        return str(self.id)


class Composition(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now=True)
    width = models.PositiveSmallIntegerField()
    height = models.PositiveSmallIntegerField()
    tiles = models.ManyToManyField(Tile, related_name='compositions')

    def __str__(self):
        return str(self.id)
