import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'conf.settings_prod')
os.environ.setdefault('DJANGO_SECRET_KEY_FILE', '/run/keys/tiles-secret-key')
application = get_wsgi_application()
