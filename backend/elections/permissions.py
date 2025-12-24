from rest_framework import permissions


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to allow:
    - Authenticated users to perform safe methods (GET, HEAD, OPTIONS)
    - Only admin/staff users to perform unsafe methods (POST, PUT, PATCH, DELETE)

    Use this for resources that students should be able to view,
    but only administrators should be able to create, modify, or delete.

    Examples:
    - Students can view elections, positions, and candidates
    - Only admins can create/edit/delete elections, positions, and candidates
    """

    def has_permission(self, request, view):
        """
        Check if the user has permission to perform the requested action.
        """
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False

        # SAFE_METHODS = GET, HEAD, OPTIONS
        # Allow all authenticated users to read
        if request.method in permissions.SAFE_METHODS:
            return True

        # For unsafe methods (POST, PUT, PATCH, DELETE), require admin/staff
        return request.user.is_staff or request.user.is_superuser
