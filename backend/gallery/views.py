from rest_framework import viewsets, permissions
from .models import GalleryItem
from .serializers import GalleryItemSerializer


class GalleryViewSet(viewsets.ModelViewSet):
    """
    API endpoint for DASA gallery media items.

    Features:
    - Public can view
    - Admins can create, update, delete
    - Supports filtering by category via query parameter
    """

    queryset = GalleryItem.objects.all().order_by('-created_at')
    serializer_class = GalleryItemSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """
        Optionally filter by category.
        Use query parameter ?category=Sports to get category-specific items.
        """
        queryset = super().get_queryset()
        category = self.request.query_params.get('category', None)

        if category:
            queryset = queryset.filter(category=category)

        return queryset
