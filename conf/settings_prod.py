import os
from pathlib import Path

from conf.settings_base import *  # noqa: F401, F403
from conf.settings_base import DATABASES

DEBUG = False
SECRET_KEY = Path(os.environ['DJANGO_SECRET_KEY_FILE']).read_bytes()
DATABASES['default']['CONN_MAX_AGE'] = 300
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'
