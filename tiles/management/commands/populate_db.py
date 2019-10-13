import logging
from pathlib import Path

from django.core.files.images import ImageFile
from django.core.management.base import BaseCommand
from django.db import transaction

from tiles.models import Composition, Image, Tile

logger = logging.getLogger(__name__)

images_path = Path(__file__).parents[2] / 'fixtures' / 'images'
data_images = [
    {'name': 'tile-1.png', 'connections': [1, 2, 3, 1]},
    {'name': 'tile-2.png', 'connections': [2, 1, 3, 3]},
    {'name': 'tile-3.png', 'connections': [3, 1, 2, 2]},
]
data_tiles = [
    {'imgId': 1, 'rotation': 1},
    {'imgId': 1, 'rotation': 2},
    {'imgId': 2, 'rotation': 0},
    {'imgId': 2, 'rotation': 3},
    {'imgId': 3, 'rotation': 3},
    {'imgId': 1, 'rotation': 3},
    {'imgId': 2, 'rotation': 2},
    {'imgId': 3, 'rotation': 1},
    {'imgId': 1, 'rotation': 0},
    {'imgId': 3, 'rotation': 2},
    {'imgId': 3, 'rotation': 0},
    {'imgId': 2, 'rotation': 1},
]


class Command(BaseCommand):
    help = 'Populate database with fixtures'

    @transaction.atomic
    def handle(self, *args, **options):
        images = []
        for row in data_images:
            image_name = row['name']
            logger.info('Creating Image %s %s', image_name, row['connections'])
            image = Image.objects.create(connections=row['connections'])
            image_f = (images_path / image_name).open('rb')
            image.image.save(image_name, ImageFile(image_f))
            image.save()
            images.append(image)
        tiles = []
        for row in data_tiles:
            tile = Tile.objects.create(
                image=images[row['imgId'] - 1], rotation=row['rotation']
            )
            tile.save()
            tiles.append(tile)
        composition = Composition.objects.create(width=5, height=5)
        composition.tiles.set(tiles)
        composition.save()
