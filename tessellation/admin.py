from django.contrib import admin

from tessellation.models import Composition, Image, Tile


@admin.register(Image)
class ImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'image', 'connections', 'created_at')


@admin.register(Tile)
class TileAdmin(admin.ModelAdmin):
    list_display = ('id', 'image', 'rotation', 'created_at')


@admin.register(Composition)
class CompositionAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'slug',
        'owner',
        'public',
        'featured',
        'featured_requested_at',
        'created_at',
    )
    list_filter = (
        'owner__username',
        'public',
        'featured',
        'featured_requested_at',
    )
    exclude = ['featured_requested_at']
