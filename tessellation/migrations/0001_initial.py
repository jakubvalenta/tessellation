import uuid

import django.contrib.postgres.fields
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models

import tessellation.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [migrations.swappable_dependency(settings.AUTH_USER_MODEL)]

    operations = [
        migrations.CreateModel(
            name='Image',
            fields=[
                (
                    'id',
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ('created_at', models.DateTimeField(auto_now=True)),
                (
                    'image',
                    models.FileField(
                        unique=True,
                        upload_to=tessellation.models.image_upload_to,
                    ),
                ),
                (
                    'connections',
                    django.contrib.postgres.fields.ArrayField(
                        base_field=models.PositiveSmallIntegerField(),
                        size=None,
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name='Tile',
            fields=[
                (
                    'id',
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ('created_at', models.DateTimeField(auto_now=True)),
                ('rotation', models.PositiveSmallIntegerField()),
                (
                    'image',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='tiles',
                        to='tessellation.Image',
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name='Composition',
            fields=[
                (
                    'id',
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ('created_at', models.DateTimeField(auto_now=True)),
                ('width', models.PositiveSmallIntegerField()),
                ('height', models.PositiveSmallIntegerField()),
                ('slug', models.SlugField()),
                (
                    'owner',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='snippets',
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    'tiles',
                    models.ManyToManyField(
                        related_name='compositions', to='tessellation.Tile'
                    ),
                ),
            ],
            options={'ordering': ['-created_at']},
        ),
        migrations.AddConstraint(
            model_name='tile',
            constraint=models.UniqueConstraint(
                fields=('image', 'rotation'), name='unique_image_and_rotation'
            ),
        ),
    ]
