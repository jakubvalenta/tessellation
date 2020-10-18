from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import User
from django.views.generic import TemplateView
from rest_framework import generics, permissions

from accounts.serializers import UserSerializer


class ProfileView(LoginRequiredMixin, TemplateView):
    template_name = 'profile.html'


class CurrentUser(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
