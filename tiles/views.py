from django.views import generic
from rest_framework import viewsets

from tiles.models import Composition
from tiles.serializers import CompositionSerializer


class IndexView(generic.ListView):
    template_name = 'index.html'
    queryset = Composition.objects.order_by('-created_at')
    paginate_by = 10


class CompositionDetailView(generic.DetailView):
    model = Composition
    template_name = 'detail.html'

    def get_context_data(self, **kwargs) -> dict:
        context = super().get_context_data(**kwargs)
        serializer = CompositionSerializer(self.object)
        context['data'] = serializer.data
        return context


class CompositionCreateView(generic.base.TemplateView):
    template_name = 'create.html'

    def get_context_data(self) -> dict:
        first_composition = Composition.objects.order_by('created_at').first()
        serializer = CompositionSerializer(first_composition)
        return {
            'data': serializer.data,
            'composition_list': Composition.objects.order_by('created_at'),
        }


class CompositionAPIViewSet(viewsets.ModelViewSet):
    queryset = Composition.objects.all()
    serializer_class = CompositionSerializer
