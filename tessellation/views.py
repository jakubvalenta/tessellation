from django.conf import settings
from django.db.models import Q
from django.views import generic
from rest_framework import generics, permissions

from tessellation import __description__, __title__
from tessellation.models import Composition
from tessellation.permissions import IsOwnerOrReadOnly
from tessellation.serializers import CompositionSerializer


class IndexView(generic.base.TemplateView):
    template_name = 'index.html'

    def get_context_data(self) -> dict:
        oldest_sample_composition = (
            Composition.objects.get_sample_compositions()
            .prefetch_related('tiles__image')
            .last()
        )
        return {
            'title': __title__,
            'description': __description__,
            'email': settings.CONTACT_EMAIL,
            'composition': oldest_sample_composition,
        }


class CompositionMixin:
    def get_serializer(self, *args, **kwargs):
        return CompositionSerializer(
            *args, **kwargs, context={'request': self.request}
        )


class SampleList(CompositionMixin, generics.ListAPIView):
    queryset = Composition.objects.filter(
        owner__is_superuser=True, public=True
    ).prefetch_related('tiles__image')


class CompositionList(CompositionMixin, generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Composition.objects.none()
        return Composition.objects.filter(
            owner=self.request.user
        ).prefetch_related('tiles__image')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class CompositionDetail(CompositionMixin, generics.RetrieveDestroyAPIView):
    permission_classes = [IsOwnerOrReadOnly]
    lookup_field = 'slug'

    def get_queryset(self):
        if self.request.method == 'GET':
            qs = Q(owner__is_superuser=True, public=True)
            if self.request.user.is_authenticated:
                qs = qs | Q(owner=self.request.user)
            return Composition.objects.filter(qs)
        return Composition.objects.all()
