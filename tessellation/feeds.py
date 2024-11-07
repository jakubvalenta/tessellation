import datetime

from django.contrib.syndication.views import Feed
from django.db.models import QuerySet

from tessellation.models import Composition


class LatestFeaturedCompositions(Feed):
    title = "Tessellation"
    link = "/explore/"
    description = "Featured compositions."
    description_template = "feeds/compositions.html"

    def items(self) -> QuerySet[Composition, Composition]:
        return Composition.objects.filter(public=True, featured=True)[:10]

    def item_title(self, item: Composition) -> str:
        return f"Composition {item.name or item.id}"

    def item_author_name(self, item: Composition) -> str:
        return item.owner.username

    def item_pubdate(self, item: Composition) -> datetime.datetime:
        return item.created_at
