from django.db import transaction
from drf_base64.fields import Base64ImageField
from rest_framework import serializers

from tiles.models import Composition, Image, Tile


class ImageSerializer(serializers.ModelSerializer):
    ref = serializers.CharField(source='pk')
    url = serializers.FileField(source='image', read_only=True, use_url=True)
    data = Base64ImageField(write_only=True)

    class Meta:
        model = Image
        fields = ['ref', 'url', 'data', 'connections']


class TileSerializer(serializers.ModelSerializer):
    imgRef = serializers.CharField(source='image.pk')

    class Meta:
        model = Tile
        fields = ['imgRef', 'rotation']


class SizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Composition
        fields = ['width', 'height']


class CompositionSerializer(serializers.ModelSerializer):
    size = SizeSerializer()
    images = ImageSerializer(many=True)
    tiles = TileSerializer(many=True)

    class Meta:
        model = Composition
        fields = ['id', 'size', 'images', 'tiles']

    @transaction.atomic
    def create(self, validated_data: dict) -> Composition:
        images = {
            image_data['pk']: Image.objects.create(
                image=image_data['data'], connections=image_data['connections']
            )
            for image_data in validated_data['images']
        }
        tiles = {
            Tile.objects.create(
                image=images[tile_data['image']['pk']],
                rotation=tile_data['rotation'],
            )
            for tile_data in validated_data['tiles']
        }
        composition = Composition.objects.create(
            width=validated_data['size']['width'],
            height=validated_data['size']['height'],
        )
        composition.tiles.set(tiles)
        return composition