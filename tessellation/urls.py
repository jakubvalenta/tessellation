from django.conf import settings
from django.conf.urls.static import static
from django.urls import path

from tessellation import views

urlpatterns = [
    path('', views.IndexView.as_view(), name='index'),
    path('api/samples/', views.SampleList.as_view()),
    path('api/compositions/', views.CompositionList.as_view()),
    path('api/compositions/<slug>', views.CompositionDetail.as_view()),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
