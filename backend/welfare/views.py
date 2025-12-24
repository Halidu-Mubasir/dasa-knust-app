from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import WelfareReport
from .serializers import WelfareReportSerializer


class WelfareViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing welfare reports.
    """
    queryset = WelfareReport.objects.all()
    serializer_class = WelfareReportSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['category', 'description', 'status']
    ordering_fields = ['created_at', 'status']

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'create':
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        """
        If the user is authenticated and not anonymous, save the user.
        If is_anonymous is True, we don't save the user even if authenticated.
        """
        user = self.request.user
        if user.is_authenticated and not serializer.validated_data.get('is_anonymous', False):
            serializer.save(reporter=user)
        else:
            serializer.save(reporter=None)
