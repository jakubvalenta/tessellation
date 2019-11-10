from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from tessellation import views

router = DefaultRouter()
router.register(
    'api/compositions', views.CompositionAPIViewSet, basename='composition'
)
router.register('api/samples', views.SampleAPIViewSet, basename='sample')

urlpatterns = [
    path('', views.IndexView.as_view(), name='index'),
    path('', include(router.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
