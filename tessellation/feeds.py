from typing import List

from django.contrib.syndication.views import Feed
from django.urls import reverse

from tessellation.models import Composition


class LatestFeaturedCompositions(Feed):
    title = "Tessellation"
    link = "/explore/"
    description = "Featured compositions."
    description_template = "feeds/compositions.html"

    def items(self) -> List[Composition]:
        return Composition.objects.filter(public=True, featured=True)[:10]

    def item_title(self, item: Composition) -> str:
        return f'Composition {item.name or item.id}'

    def item_link(self, item: Composition) -> str:
        return reverse('detail', args=[item.slug])

    def item_author_name(self, item: Composition) -> str:
        return item.owner.username
