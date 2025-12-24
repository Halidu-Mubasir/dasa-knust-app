from rest_framework import viewsets, permissions
from .models import Announcement
from .serializers import AnnouncementSerializer


class AnnouncementViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing announcements.

    Features:
    - Public (or Authenticated) can view active announcements
    - Admins can create, update, and delete
    - Returns only active announcements for non-admins
    """

    serializer_class = AnnouncementSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """
        Return active announcements for users, all for admins.
        Automatically deactivates announcements for:
        - Past events (date < today)
        - Resolved lost & found items

        This uses Generic Foreign Keys to check the actual related objects
        and UPDATES the database to set is_active=False.
        """
        from django.utils import timezone
        from django.contrib.contenttypes.models import ContentType
        from django.db.models import Q
        from events.models import Event
        from lost_found.models import LostItem

        queryset = Announcement.objects.all().order_by('-created_at')

        # If user is admin, return everything (so they can manage them)
        if self.request.user.is_staff:
            return queryset

        now = timezone.now()

        # Get ContentTypes
        event_type = ContentType.objects.get_for_model(Event)
        lost_item_type = ContentType.objects.get_for_model(LostItem)

        # Get IDs of past events
        past_event_ids = Event.objects.filter(date__lt=now.date()).values_list('id', flat=True)

        # Get IDs of resolved lost items
        resolved_item_ids = LostItem.objects.filter(is_resolved=True).values_list('id', flat=True)

        # Build filter for announcements that should be deactivated
        deactivate_filters = Q()

        # Deactivate announcements linked to past events
        if past_event_ids:
            deactivate_filters |= Q(
                content_type=event_type,
                object_id__in=past_event_ids
            )

        # Deactivate announcements linked to resolved lost items
        if resolved_item_ids:
            deactivate_filters |= Q(
                content_type=lost_item_type,
                object_id__in=resolved_item_ids
            )

        # IMPORTANT: Actually update the database to set is_active=False
        if deactivate_filters:
            Announcement.objects.filter(
                deactivate_filters,
                is_active=True  # Only update those that are currently active
            ).update(is_active=False)

        # Now return only active announcements
        return queryset.filter(is_active=True)
