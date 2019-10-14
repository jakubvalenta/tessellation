import json
import logging
from base64 import b64encode
from pathlib import Path

from django.core.management.base import BaseCommand
from django.db import transaction

from tiles.serializers import CompositionSerializer

logger = logging.getLogger(__name__)

fixtures_path = Path(__file__).parents[2] / 'fixtures'


def create_base64_data_url(path: Path):
    data = b64encode(path.read_bytes()).decode()
    suffix = path.suffix[1:]
    return f'data:text/{suffix};base64,{data}'


def load_fixture(fixture_path: str):
    logger.info('Loading fixture %s', fixture_path)
    with fixture_path.open() as f:
        data = json.load(f)
    for image_data in data['images']:
        image_path = fixtures_path / 'images' / image_data['url']
        image_data['data'] = create_base64_data_url(image_path)
    serializer = CompositionSerializer(data=data)
    if not serializer.is_valid():
        logger.error(serializer.errors)
        return
    serializer.save()


class Command(BaseCommand):
    help = 'Populate database with fixtures'

    @transaction.atomic
    def handle(self, *args, **options):
        for fixture_path in fixtures_path.glob('*.json'):
            load_fixture(fixture_path)
