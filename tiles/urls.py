from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from tiles import views

router = DefaultRouter()
router.register(
    'api/compositions', views.CompositionAPIViewSet, basename='composition'
)

urlpatterns = [
    path('', views.CompositionCreateView.as_view(), name='index'),
    path(
        'compositions/<str:pk>/',
        views.CompositionDetailView.as_view(),
        name='detail',
    ),
    path('', include(router.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
