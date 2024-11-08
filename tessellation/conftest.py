import pytest


@pytest.fixture(autouse=True)
def _use_tmp_media_root(settings, tmp_path):
    settings.MEDIA_ROOT = tmp_path


@pytest.fixture(autouse=True)
def _enable_db_access(db):
    pass
