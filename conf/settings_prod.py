import os
from pathlib import Path

from conf.settings_base import *  # noqa: F401, F403
from conf.settings_base import DATABASES, TEMPLATES

DEBUG = False
SECRET_KEY = Path(os.environ['DJANGO_SECRET_KEY_FILE']).read_text().strip()
DATABASES['default']['CONN_MAX_AGE'] = 300
TEMPLATES[0]['OPTIONS']['loaders'] = [
    (
        'django.template.loaders.cached.Loader',
        [
            'django.template.loaders.filesystem.Loader',
            'django.template.loaders.app_directories.Loader',
        ],
    )
]
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'
