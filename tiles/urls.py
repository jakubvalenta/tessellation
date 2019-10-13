from django.conf import settings
from django.conf.urls.static import static
from django.urls import path

from tiles import views

urlpatterns = [
    path('', views.IndexView.as_view(), name='index'),
    path('new/', views.NewView.as_view(), name='new'),
    path('compositions/<str:pk>/', views.DetailAPIView.as_view()),
    path('<str:pk>/', views.DetailView.as_view(), name='detail'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
