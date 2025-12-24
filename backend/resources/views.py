from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import AcademicResource
from .serializers import AcademicResourceSerializer


class AcademicResourceViewSet(viewsets.ModelViewSet):
    """
    API endpoint for viewing and downloading academic resources.

    Features:
    - Public can view (AllowAny)
    - Only admins can create/edit/delete (IsAdminUser)
    - Filtering by college, level, course_code
    - Search by title or course_code
    - Custom download action that increments download count

    Endpoints:
    - GET /api/resources/ - List all resources (with filters)
    - GET /api/resources/{id}/ - Get specific resource
    - POST /api/resources/ - Create resource (Admin only)
    - PUT/PATCH /api/resources/{id}/ - Update resource (Admin only)
    - DELETE /api/resources/{id}/ - Delete resource (Admin only)
    - POST /api/resources/{id}/download/ - Download resource and increment count
    """

    queryset = AcademicResource.objects.all()
    serializer_class = AcademicResourceSerializer
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly] # Old
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'download']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['college', 'level', 'semester', 'course_code']
    search_fields = ['title', 'course_code']
    ordering_fields = ['uploaded_at', 'downloads', 'title']
    ordering = ['-uploaded_at']

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticatedOrReadOnly])
    def download(self, request, pk=None):
        """
        Custom action to increment download count.
        POST /api/resources/{id}/download/
        """
        resource = self.get_object()
        resource.increment_downloads()

        return Response({
            'message': 'Download count incremented',
            'downloads': resource.downloads,
            'file_url': request.build_absolute_uri(resource.file.url) if resource.file else None
        }, status=status.HTTP_200_OK)
