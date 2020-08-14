import json
import logging
from base64 import b64encode
from pathlib import Path

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.db import transaction

from tessellation.serializers import CompositionSerializer

logger = logging.getLogger(__name__)

fixtures_path = Path(__file__).parents[2] / 'fixtures'


def create_base64_data_url(path: Path):
    data = b64encode(path.read_bytes()).decode()
    suffix = path.suffix[1:]
    return f'data:text/{suffix};base64,{data}'


def create_user_if_not_exists(username: str, *args):
    if not User.objects.filter(username=username).exists():
        user = User.objects.create_user(username, *args)
        user.save()


def load_fixture(fixture_path: Path, user: User):
    logger.info('Loading fixture %s', fixture_path)
    with fixture_path.open() as f:
        data = json.load(f)
    name = data.pop('name')
    public = data.pop('public')
    featured = data.pop('featured')
    for image_data in data['images']:
        image_path = fixture_path.parent / image_data['url']
        image_data['data'] = create_base64_data_url(image_path)
    serializer = CompositionSerializer(data=data)
    if not serializer.is_valid():
        logger.error(serializer.errors)
        return
    composition = serializer.save(owner=user)
    composition.name = name
    composition.public = public
    composition.featured = featured
    composition.save()


class Command(BaseCommand):
    help = 'Populate database with fixtures'

    @transaction.atomic
    def handle(self, *args, **options):
        superuser = User.objects.filter(is_superuser=True).first()
        if not superuser:
            raise Exception('You must create the superuser first')
        for fixture_path in fixtures_path.glob('**/data.json'):
            load_fixture(fixture_path, superuser)
