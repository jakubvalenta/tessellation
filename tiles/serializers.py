from django.db import transaction
from drf_base64.fields import Base64ImageField
from rest_framework import serializers

from tiles.models import Composition, Image, Tile


class ImageSerializer(serializers.ModelSerializer):
    imgId = serializers.CharField(source='pk', read_only=True)
    imgRef = serializers.IntegerField(write_only=True)
    url = serializers.FileField(source='image', read_only=True, use_url=True)
    image = Base64ImageField(write_only=True)

    class Meta:
        model = Image
        fields = ['imgId', 'imgRef', 'url', 'image', 'connections']


class TileSerializer(serializers.ModelSerializer):
    imgId = serializers.CharField(source='image.pk', read_only=True)
    imgRef = serializers.IntegerField(write_only=True)

    class Meta:
        model = Tile
        fields = ['imgId', 'imgRef', 'rotation']


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
            image_data['imgRef']: Image.objects.create(
                image=image_data['image'],
                connections=image_data['connections'],
            )
            for image_data in validated_data['images']
        }
        tiles = {
            Tile.objects.create(
                image=images[tile_data['imgRef']],
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
