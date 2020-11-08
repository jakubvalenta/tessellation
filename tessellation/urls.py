from django.conf import settings
from django.conf.urls.static import static
from django.urls import path

from tessellation import views

urlpatterns = [
    path('', views.IndexView.as_view(), name='index'),
    path('explore/', views.CompositionListView.as_view(), name='list'),
    path(
        'explore/<slug:slug>/',
        views.CompositionDetailView.as_view(),
        name='detail',
    ),
    path(
        'create/<slug:slug>/',
        views.CompositionEditView.as_view(),
        name='edit',
    ),
    path(
        'create/',
        views.CompositionCreateView.as_view(),
        name='create',
    ),
    path('api/samples/', views.SampleListAPIView.as_view()),
    path('api/compositions/', views.CompositionListAPIView.as_view()),
    path(
        'api/compositions/<slug:slug>',
        views.CompositionDetailAPIView.as_view(),
    ),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
