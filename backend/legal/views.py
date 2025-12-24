from rest_framework import viewsets, permissions
from rest_framework.filters import SearchFilter
from .models import Chapter, Article
from .serializers import ChapterSerializer, ArticleSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to allow read access to anyone,
    but only allow write access to admins.
    """
    def has_permission(self, request, view):
        # Allow GET, HEAD, OPTIONS requests for everyone
        if request.method in permissions.SAFE_METHODS:
            return True
        # Allow POST, PUT, PATCH, DELETE only for admin users
        return request.user and request.user.is_staff


class ChapterViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing constitution chapters with articles.

    Features:
    - Public read access
    - Admin-only write access (create, update, delete)
    - Returns chapters with nested articles
    - Search by chapter title

    Endpoints:
    - GET /api/constitution/chapters/ - List all chapters with articles
    - GET /api/constitution/chapters/{id}/ - Get specific chapter
    - POST /api/constitution/chapters/ - Create chapter (admin only)
    - PUT/PATCH /api/constitution/chapters/{id}/ - Update chapter (admin only)
    - DELETE /api/constitution/chapters/{id}/ - Delete chapter (admin only)
    """
    queryset = Chapter.objects.prefetch_related('articles').all()
    serializer_class = ChapterSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [SearchFilter]
    search_fields = ['title', 'articles__title', 'articles__content']


class ArticleViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing articles.

    Features:
    - Public read access
    - Admin-only write access (create, update, delete)
    - Search by article title or content
    - Filter by chapter

    Endpoints:
    - GET /api/constitution/articles/ - List all articles
    - GET /api/constitution/articles/?search=election - Search articles
    - POST /api/constitution/articles/ - Create article (admin only)
    - PUT/PATCH /api/constitution/articles/{id}/ - Update article (admin only)
    - DELETE /api/constitution/articles/{id}/ - Delete article (admin only)
    """
    queryset = Article.objects.select_related('chapter').all()
    serializer_class = ArticleSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [SearchFilter]
    search_fields = ['title', 'content', 'article_number']
    filterset_fields = ['chapter']
