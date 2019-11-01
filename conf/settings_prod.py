import os
from pathlib import Path

from conf.settings_base import *  # noqa: F401, F403
from conf.settings_base import DATABASES, TEMPLATES, WEBPACK_LOADER

ALLOWED_HOSTS = [os.environ['ALLOWED_HOST']]
DEBUG = os.environ.get('DEBUG', False)
SECRET_KEY = (
    Path(
        os.environ.get('SECRET_KEY_FILE', '/run/keys/tessellation-secret-key')
    )
    .read_text()
    .strip()
)
TEMPLATES[0]['OPTIONS']['loaders'] = [
    (
        'django.template.loaders.cached.Loader',
        ['django.template.loaders.app_directories.Loader'],
    )
]
DATABASES['default']['USER'] = 'robot'
DATABASES['default']['CONN_MAX_AGE'] = 300
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'
WEBPACK_LOADER['DEFAULT']['CACHE'] = True
