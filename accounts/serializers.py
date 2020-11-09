from django.conf import settings
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    max_compositions = serializers.SerializerMethodField()
    url_admin = serializers.SerializerMethodField()
    url_logout = serializers.SerializerMethodField()
    url_profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'username',
            'is_authenticated',
            'is_staff',
            'max_compositions',
            'url_admin',
            'url_logout',
            'url_profile',
        ]

    def get_max_compositions(self, obj):
        if obj.is_superuser:
            return -1
        return settings.MAX_COMPOSITIONS_PER_USER

    def get_url_admin(self, obj):
        return reverse('admin:index')

    def get_url_logout(self, obj):
        return reverse('accounts:logout')

    def get_url_profile(self, obj):
        return reverse('accounts:profile')
