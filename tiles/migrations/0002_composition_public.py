import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [('tiles', '0001_initial')]

    operations = [
        migrations.AlterField(
            model_name='composition',
            name='owner',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='compositions',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name='composition',
            name='public',
            field=models.BooleanField(default=False),
        ),
    ]
