from django.conf import settings
from django.views import generic
from rest_framework import permissions, viewsets

from tessellation import __description__, __title__
from tessellation.models import Composition
from tessellation.permissions import IsOwnerOrReadOnly
from tessellation.serializers import CompositionSerializer


def add_basic_context(context: dict):
    context.update(
        {
            'title': __title__,
            'description': __description__,
            'email': settings.CONTACT_EMAIL,
        }
    )


class IndexView(generic.base.TemplateView):
    template_name = 'index.html'

    def get_context_data(self) -> dict:
        context = {}
        add_basic_context(context)
        oldest_sample_composition = (
            Composition.objects.get_sample_compositions()
            .prefetch_related('tiles__image')
            .last()
        )
        serializer = CompositionSerializer(
            oldest_sample_composition, context={'request': self.request}
        )
        context['data'] = serializer.data
        return context


class CompositionDetailView(generic.DetailView):
    model = Composition
    template_name = 'detail.html'
    queryset = Composition.objects.filter(public=True).prefetch_related(
        'tiles__image'
    )

    def get_context_data(self, **kwargs) -> dict:
        context = super().get_context_data(**kwargs)
        add_basic_context(context)
        serializer = CompositionSerializer(
            self.object, context={'request': self.request}
        )
        context['heading'] = self.object.title
        context['data'] = serializer.data
        return context


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
