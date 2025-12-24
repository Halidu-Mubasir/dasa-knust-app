from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChapterViewSet, ArticleViewSet

router = DefaultRouter()
router.register(r'chapters', ChapterViewSet, basename='chapters')
router.register(r'articles', ArticleViewSet, basename='articles')

urlpatterns = [
    path('', include(router.urls)),
]
