from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from tiles import views

router = DefaultRouter()
router.register('compositions', views.CompositionAPIViewSet)

urlpatterns = [
    path('', views.IndexView.as_view(), name='index'),
    path('', include(router.urls)),
    path('new/', views.CompositionCreateView.as_view(), name='create'),
    path('<str:pk>/', views.CompositionDetailView.as_view(), name='detail'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
