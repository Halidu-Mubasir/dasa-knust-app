from rest_framework import viewsets, permissions
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Product
from .serializers import ProductSerializer


class IsOwnerOrAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to allow owners and admins to edit objects.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are allowed to admins
        if request.user and request.user.is_staff:
            return True

        # Write permissions are also allowed to the owner
        return obj.seller == request.user


class ProductViewSet(viewsets.ModelViewSet):
    """
    API endpoint for marketplace products.

    Features:
    - Authenticated users can create products
    - Filter by category and sold status
    - Search by title or description
    - Order by price or date

    Endpoints:
    - GET /api/market/products/ - List all products
    - POST /api/market/products/ - Create new product (auth required)
    - GET /api/market/products/{id}/ - Get specific product
    - PATCH /api/market/products/{id}/ - Update product (owner only)
    - DELETE /api/market/products/{id}/ - Delete product (owner only)
    """
    queryset = Product.objects.select_related('seller').all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'is_sold', 'condition']
    search_fields = ['title', 'description']
    ordering_fields = ['price', 'created_at']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        """Automatically set the seller to current user"""
        serializer.save(seller=self.request.user)

    def get_queryset(self):
        """Optionally filter to show only available items"""
        queryset = super().get_queryset()

        if self.request.user.is_staff:
            return queryset
        
        # Check for user specific listings (showing sold ones too)
        mode = self.request.query_params.get('mode', None)
        if mode == 'my_listings' and self.request.user.is_authenticated:
            return queryset.filter(seller=self.request.user)

        available_only = self.request.query_params.get('available', None)
        if available_only == 'true':
            queryset = queryset.filter(is_sold=False)
        return queryset
