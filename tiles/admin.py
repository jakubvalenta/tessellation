from django.contrib import admin

from tiles.models import Composition, Image, Tile


@admin.register(Image)
class ImageAdmin(admin.ModelAdmin):
    pass


@admin.register(Tile)
class TileAdmin(admin.ModelAdmin):
    pass


@admin.register(Composition)
class CompositionAdmin(admin.ModelAdmin):
    list_display = ('id', 'slug', 'created_at')
