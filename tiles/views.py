from django.views import generic
from rest_framework import generics

from tiles.models import Composition
from tiles.serializers import CompositionSerializer


class IndexView(generic.ListView):
    template_name = 'index.html'

    def get_queryset(self):
        return Composition.objects.order_by('-created_at')[:5]


class DetailView(generic.DetailView):
    model = Composition
    template_name = 'detail.html'


class NewView(generic.base.TemplateView):
    template_name = 'new.html'

    def get_context_data(self):
        first_composition = Composition.objects.order_by('created_at').first()
        return {'composition': first_composition}


class DetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Composition.objects.all()
    serializer_class = CompositionSerializer
