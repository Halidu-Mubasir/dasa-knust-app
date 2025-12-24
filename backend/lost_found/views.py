from rest_framework import viewsets, permissions
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import LostItem
from .serializers import LostItemSerializer


class LostItemViewSet(viewsets.ModelViewSet):
    """
    API endpoint for lost and found items.
    Automatically creates announcements when items are posted.

    Features:
    - Authenticated users can post items
    - Filter by type (Lost/Found) and category
    - Search by description
    - Automatically generates announcements

    Endpoints:
    - GET /api/lost-found/items/ - List all items
    - POST /api/lost-found/items/ - Create new item (auth required)
    - GET /api/lost-found/items/{id}/ - Get specific item
    - PATCH /api/lost-found/items/{id}/ - Update item (owner only)
    - DELETE /api/lost-found/items/{id}/ - Delete item (owner only)
    """
    queryset = LostItem.objects.select_related('reporter').all()
    serializer_class = LostItemSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['type', 'category', 'is_resolved']
    search_fields = ['description', 'student_name']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        """Automatically set the reporter to current user"""
        serializer.save(reporter=self.request.user)

    def get_queryset(self):
        """
        Filter queryset based on mode and visibility.
        - Admins: See all items (Resolved & Unresolved)
        - mode='my_posts': Returns current user's items (Resolved & Unresolved).
        - Default: Returns only Unresolved items for public feed.
        """
        queryset = super().get_queryset()

        # Admins see everything
        if self.request.user.is_staff:
            return queryset

        mode = self.request.query_params.get('mode', None)

        # My Posts
        if mode == 'my_posts' and self.request.user.is_authenticated:
            return queryset.filter(reporter=self.request.user)

        # Public Feed (Unresolved only)
        return queryset.filter(is_resolved=False)

    def perform_update(self, serializer):
        """Allow owner or admin to update"""
        item = serializer.instance
        if item.reporter != self.request.user and not self.request.user.is_staff:
            raise permissions.PermissionDenied("You can only edit your own items.")
        serializer.save()

    def perform_destroy(self, instance):
        """Allow owner or admin to delete"""
        if instance.reporter != self.request.user and not self.request.user.is_staff:
            raise permissions.PermissionDenied("You cannot delete this item.")
        instance.delete()
