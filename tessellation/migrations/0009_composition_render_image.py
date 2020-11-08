import logging

from django.db import migrations

from tessellation.models import Composition, CompositionError

logger = logging.getLogger(__name__)


def render_images(apps, schema_editor):
    for item in Composition.objects.filter(image=None):
        images = item.images
        tiles = list(item.tiles.all())
        logger.info('Migrating %s', item.slug)
        try:
            item.render(images, tiles)
        except CompositionError as e:
            logger.info('Failed to migrate %s: %s', item.slug, e)


class Migration(migrations.Migration):

    dependencies = [
        ('tessellation', '0008_composition_image'),
    ]

    operations = [
        migrations.RunPython(render_images),
    ]
