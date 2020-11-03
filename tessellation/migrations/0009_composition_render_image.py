import io

from django.core.files import File
from django.db import migrations

from tessellation.models import Composition


def render_images(apps, schema_editor):
    for item in Composition.objects.filter(image=None):
        images = item.images
        tiles = list(item.tiles.all())
        item.render(images, tiles)


class Migration(migrations.Migration):

    dependencies = [
        ('tessellation', '0008_composition_image'),
    ]

    operations = [
        migrations.RunPython(render_images),
    ]
