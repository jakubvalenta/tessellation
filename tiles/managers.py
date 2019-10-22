from django.db import models


class CompositionManager(models.Manager):
    def slug_doesnt_exist(self, slug: str) -> bool:
        return not self.filter(slug=slug).exists()

    def get_sample_compositions(self):
        return self.filter(owner__is_superuser=True, public=True)
