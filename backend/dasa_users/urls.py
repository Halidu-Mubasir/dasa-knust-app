from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, ProfileViewSet, CurrentUserView, AdminDashboardStatsView, AdminActivityView, SystemConfigView, UserExportView

# Create a router and register viewsets
router = DefaultRouter()
router.register(r'', UserViewSet, basename='user')
router.register(r'profiles', ProfileViewSet, basename='profile')

urlpatterns = [
    # Admin Stats
    path('admin/stats/', AdminDashboardStatsView.as_view(), name='admin-stats'),
    # Admin Activity
    path('admin/activity/', AdminActivityView.as_view(), name='admin-activity'),
    # System Configuration
    path('system-config/', SystemConfigView.as_view(), name='system-config'),
    # Data Exports
    path('export/users/', UserExportView.as_view(), name='export-users'),
    # Dedicated user context endpoint
    path('me/', CurrentUserView.as_view(), name='current-user'),
    # Router URLs
    path('', include(router.urls)),
]
