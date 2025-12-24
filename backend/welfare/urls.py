from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WelfareViewSet

router = DefaultRouter()
router.register(r'reports', WelfareViewSet, basename='reports')

urlpatterns = [
    path('', include(router.urls)),
]
