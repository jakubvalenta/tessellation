import logging

from django.conf import settings
from django.core.files.base import ContentFile
from django.db import transaction
from drf_base64.fields import Base64FileField
from rest_framework import serializers

from tessellation.models import Composition, Image, Tile

logger = logging.getLogger(__name__)


def validate_upload_size(value: ContentFile):
    if value.size > settings.MAX_UPLOAD_SIZE_BYTES:
        raise serializers.ValidationError('Maximum upload size exceeded')


class ImageSerializer(serializers.ModelSerializer):
    ref = serializers.CharField(source='pk')
    url = serializers.FileField(source='image', read_only=True, use_url=True)
    data = Base64FileField(write_only=True, validators=[validate_upload_size])

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


class CompositionSerializer(serializers.HyperlinkedModelSerializer):
    url = serializers.HyperlinkedIdentityField(
        view_name='detail', lookup_field='slug'
    )
    name = serializers.CharField(read_only=True)
    size = SizeSerializer()
    images = ImageSerializer(many=True)
    tiles = TileSerializer(many=True)
    public = serializers.BooleanField(read_only=True)

    class Meta:
        model = Composition
        fields = [
            'id',
            'url',
            'created_at',
            'name',
            'size',
            'images',
            'tiles',
            'public',
        ]

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
            owner=validated_data['owner'],
            width=validated_data['size']['width'],
            height=validated_data['size']['height'],
        )
        composition.tiles.set(tiles)
        return composition
