from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ElectionViewSet, PositionViewSet, CandidateViewSet, VoteViewSet

# Create a router and register viewsets
router = DefaultRouter()
router.register(r'elections', ElectionViewSet, basename='elections')
router.register(r'positions', PositionViewSet, basename='position')
router.register(r'candidates', CandidateViewSet, basename='candidate')
router.register(r'votes', VoteViewSet, basename='vote')

urlpatterns = [
    path('', include(router.urls)),
]
