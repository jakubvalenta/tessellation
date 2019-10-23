from django.conf import settings
from rest_framework import permissions

from tiles.models import Composition


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.method != 'POST'
            or request.user.is_superuser
            or Composition.objects.filter(owner=request.user).count()
            < settings.MAX_COMPOSITIONS_PER_USER
        )

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user
