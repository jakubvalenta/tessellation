# Generated by Django 2.2.6 on 2019-10-22 20:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tiles', '0002_composition_public'),
    ]

    operations = [
        migrations.AddField(
            model_name='composition',
            name='name',
            field=models.CharField(max_length=128, null=True),
        ),
    ]
