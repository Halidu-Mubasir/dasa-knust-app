from rest_framework import viewsets, permissions
from django.utils import timezone
from .models import Event
from .serializers import EventSerializer


class EventViewSet(viewsets.ModelViewSet):
    """
    API endpoint for DASA events.

    Features:
    - Public can view
    - Admins can create, update, delete
    - Supports filtering: upcoming events, featured events
    """

    serializer_class = EventSerializer
    
    def get_permissions(self):
        """
        Allow public to read, but only admins to modify.
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """
        Optionally filter events.

        Query parameters:
        - all=true: Include past events
        - featured=true: Only featured events
        - Default: Only upcoming events (for public users)

        Note: Admins always see all events for management purposes.
        """
        queryset = Event.objects.all()

        # Admins should see all events regardless of date (for management)
        if self.request.user.is_staff:
            return queryset

        # Filter by featured
        if self.request.query_params.get('featured', None):
            queryset = queryset.filter(is_featured=True)

        # Filter by upcoming (default behavior unless 'all' is specified)
        if not self.request.query_params.get('all', None):
            today = timezone.now().date()
            queryset = queryset.filter(date__gte=today)

        return queryset
