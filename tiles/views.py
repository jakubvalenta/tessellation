from django.views import generic
from rest_framework import permissions, viewsets

from tiles.models import Composition
from tiles.permissions import IsOwnerOrReadOnly
from tiles.serializers import CompositionSerializer


class IndexView(generic.ListView):
    model = Composition
    template_name = 'index.html'
    paginate_by = 10


class CompositionDetailView(generic.DetailView):
    model = Composition
    template_name = 'detail.html'
    queryset = Composition.objects.prefetch_related('tiles__image')

    def get_context_data(self, **kwargs) -> dict:
        context = super().get_context_data(**kwargs)
        serializer = CompositionSerializer(self.object)
        context['data'] = serializer.data
        return context


class CompositionCreateView(generic.base.TemplateView):
    template_name = 'create.html'

    def get_context_data(self) -> dict:
        oldest_composition = Composition.objects.prefetch_related(
            'tiles__image'
        ).last()
        serializer = CompositionSerializer(oldest_composition)
        return {'data': serializer.data}


class CompositionAPIViewSet(viewsets.ModelViewSet):
    serializer_class = CompositionSerializer
    permission_classes = [
        permissions.IsAuthenticatedOrReadOnly,
        IsOwnerOrReadOnly,
    ]

    def get_queryset(self):
        return Composition.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
