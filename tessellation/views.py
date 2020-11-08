from django.conf import settings
from django.db.models import Q
from django.shortcuts import render
from django.views import generic
from rest_framework import generics
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from tessellation import __description__, __title__
from tessellation.models import Composition
from tessellation.permissions import IsOwnerOrReadOnly
from tessellation.serializers import CompositionSerializer


class CommonContextMixin(generic.base.ContextMixin):
    def get_context_data(self, **kwargs) -> dict:
        context = super().get_context_data(**kwargs)
        context.update(
            {
                'title': __title__,
                'description': __description__,
                'email': settings.CONTACT_EMAIL,
            }
        )
        return context


class IndexView(CommonContextMixin, generic.base.TemplateView):
    template_name = 'index.html'


def not_found_view(request, exception):
    return render(
        request,
        '404.html',
        {
            'heading': 'Page not found',
            'title': __title__,
            'description': __description__,
            'email': settings.CONTACT_EMAIL,
        },
        status=404,
    )


class CompositionListView(CommonContextMixin, generic.ListView):
    queryset = Composition.objects.filter(featured=True)
    context_object_name = 'compositions'
    template_name = 'list.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['serialized_compositions'] = CompositionSerializer(
            context['compositions'], many=True
        ).data
        return context


class CompositionDetailView(CommonContextMixin, generic.DetailView):
    model = Composition
    context_object_name = 'composition'
    template_name = 'detail.html'

    def get_queryset(self):
        qs = Q(public=True)
        if self.request.user.is_authenticated:
            qs = qs | Q(owner=self.request.user)
        return Composition.objects.filter(qs).prefetch_related('tiles__image')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['serialized_composition'] = CompositionSerializer(
            context['composition']
        ).data
        return context


class CompositionEditView(CompositionDetailView):
    template_name = 'edit.html'


class CompositionCreateView(CompositionEditView):
    def get_object(self, **kwargs):
        return (
            Composition.objects.get_sample_compositions()
            .prefetch_related('tiles__image')
            .last()
        )


class CompositionAPIMixin:
    def get_serializer(self, *args, **kwargs):
        return CompositionSerializer(
            *args, **kwargs, context={'request': self.request}
        )


class SampleListAPIView(CompositionAPIMixin, generics.ListAPIView):
    queryset = Composition.objects.filter(
        public=True, featured=True
    ).prefetch_related('tiles__image')


class CompositionListAPIView(CompositionAPIMixin, generics.ListCreateAPIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Composition.objects.none()
        return Composition.objects.filter(
            owner=self.request.user
        ).prefetch_related('tiles__image')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class CompositionDetailAPIView(
    CompositionAPIMixin, generics.RetrieveUpdateDestroyAPIView
):
    permission_classes = [IsOwnerOrReadOnly]
    lookup_field = 'slug'

    def get_queryset(self):
        if self.request.method == 'GET':
            qs = Q(public=True)
            if self.request.user.is_authenticated:
                qs = qs | Q(owner=self.request.user)
            return Composition.objects.filter(qs)
        return Composition.objects.all()
