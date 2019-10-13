from rest_framework import serializers

from tiles.models import Composition, Image, Tile


class ImageSerializer(serializers.ModelSerializer):
    imgId = serializers.CharField(source='pk', read_only=True)
    url = serializers.FileField(source='image', read_only=True, use_url=True)

    class Meta:
        model = Image
        fields = ['imgId', 'url', 'connections']


class TileSerializer(serializers.ModelSerializer):
    imgId = serializers.CharField(source='image.pk', read_only=True)

    class Meta:
        model = Tile
        fields = ['imgId', 'rotation']


class CompositionSerializer(serializers.ModelSerializer):
    images = ImageSerializer(many=True, read_only=True)
    tiles = TileSerializer(many=True, read_only=True)

    class Meta:
        model = Composition
        fields = ['id', 'size', 'images', 'tiles']
