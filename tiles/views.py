from django.views import generic
from rest_framework import generics

from tiles.models import Composition
from tiles.serializers import CompositionSerializer


class IndexView(generic.ListView):
    template_name = 'index.html'
    queryset = Composition.objects.order_by('-created_at')
    paginate_by = 10


class DetailView(generic.DetailView):
    model = Composition
    template_name = 'detail.html'

    def get_context_data(self, **kwargs) -> dict:
        context = super().get_context_data(**kwargs)
        serializer = CompositionSerializer(self.object)
        context['data'] = serializer.data
        return context


class NewView(generic.base.TemplateView):
    template_name = 'new.html'

    def get_context_data(self) -> dict:
        first_composition = Composition.objects.order_by('created_at').first()
        serializer = CompositionSerializer(first_composition)
        return {'data': serializer.data}


class DetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Composition.objects.all()
    serializer_class = CompositionSerializer
