# Generated by Django 3.1.3 on 2020-11-08 14:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tessellation', '0009_composition_render_image'),
    ]

    operations = [
        migrations.AlterField(
            model_name='composition',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True),
        ),
    ]