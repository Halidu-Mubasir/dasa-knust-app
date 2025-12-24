from rest_framework import viewsets, permissions
from .models import Executive
from .serializers import ExecutiveSerializer


class ExecutiveViewSet(viewsets.ModelViewSet):
    """
    API endpoint for viewing and managing DASA KNUST Executive Council members.

    - Public: View list and details
    - Admin: Create, Update, Delete
    """

    queryset = Executive.objects.filter(is_current=True).select_related('user', 'user__profile').order_by('rank')
    serializer_class = ExecutiveSerializer
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """
        Optionally filter by academic year.
        Use query parameter ?year=2024/2025 to get specific year's executives.
        """
        queryset = super().get_queryset()
        academic_year = self.request.query_params.get('year', None)

        if academic_year:
            queryset = queryset.filter(academic_year=academic_year)

        return queryset
