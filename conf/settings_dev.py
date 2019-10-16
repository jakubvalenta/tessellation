from conf.settings_base import *  # noqa: F401, F403
from conf.settings_base import INSTALLED_APPS, MIDDLEWARE

SECRET_KEY = 'lrtp%mw(ep03k_o94g@eq9b2nfj+xp_%c2ltj158q!$vuvekgm'
DEBUG = True
INSTALLED_APPS += ['debug_toolbar']
MIDDLEWARE = ['debug_toolbar.middleware.DebugToolbarMiddleware'] + MIDDLEWARE
