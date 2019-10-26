from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [('tessellation', '0002_composition_public')]

    operations = [
        migrations.AddField(
            model_name='composition',
            name='name',
            field=models.CharField(blank=True, max_length=128, null=True),
        )
    ]
