# Generated by Django 2.2.7 on 2019-11-25 17:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tessellation', '0003_composition_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='composition',
            name='public_requested_at',
            field=models.DateTimeField(null=True),
        ),
    ]
