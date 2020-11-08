from django.conf import settings
from rest_framework import permissions

from tessellation.models import Composition


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.method != 'POST'
            or request.user.is_superuser
            or Composition.objects.filter(owner=request.user).count()
            < settings.MAX_COMPOSITIONS_PER_USER
        )

    def has_object_permission(self, request, view, obj):
        return (
            request.method in permissions.SAFE_METHODS
            or obj.owner == request.user
        )
