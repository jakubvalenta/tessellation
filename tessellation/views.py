from django.conf import settings
from django.views import generic
from rest_framework import permissions, viewsets

from tessellation.models import Composition
from tessellation.permissions import IsOwnerOrReadOnly
from tessellation.serializers import CompositionSerializer


class CompositionDetailView(generic.DetailView):
    model = Composition
    template_name = 'detail.html'
    queryset = Composition.objects.filter(public=True).prefetch_related(
        'tiles__image'
    )

    def get_context_data(self, **kwargs) -> dict:
        context = super().get_context_data(**kwargs)
        serializer = CompositionSerializer(
            self.object, context={'request': self.request}
        )
        context['data'] = serializer.data
        return context


class CompositionCreateView(generic.base.TemplateView):
    template_name = 'create.html'

    def get_context_data(self) -> dict:
        oldest_sample_composition = (
            Composition.objects.get_sample_compositions()
            .prefetch_related('tiles__image')
            .last()
        )
        serializer = CompositionSerializer(
            oldest_sample_composition, context={'request': self.request}
        )
        return {'data': serializer.data, 'email': settings.CONTACT_EMAIL}


class CompositionAPIViewSet(viewsets.ModelViewSet):
    permission_classes = [
        permissions.IsAuthenticatedOrReadOnly,
        IsOwnerOrReadOnly,
    ]

    def get_serializer(self, *args, **kwargs):
        return CompositionSerializer(
            *args, **kwargs, context={'request': self.request}
        )

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Composition.objects.none()
        return Composition.objects.filter(
            owner=self.request.user
        ).prefetch_related('tiles__image')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class SampleAPIViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Composition.objects.filter(
        owner__is_superuser=True, public=True
    ).prefetch_related('tiles__image')

    def get_serializer(self, *args, **kwargs):
        return CompositionSerializer(
            *args, **kwargs, context={'request': self.request}
        )
