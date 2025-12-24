from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AcademicResourceViewSet

router = DefaultRouter()
router.register(r'', AcademicResourceViewSet, basename='resources')

urlpatterns = [
    path('', include(router.urls)),
]
