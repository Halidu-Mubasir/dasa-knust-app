from rest_framework import viewsets, permissions, generics, status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import User, Profile, SystemConfig
from .serializers import UserSerializer, ProfileSerializer, UserRegistrationSerializer, UserUpdateSerializer, AdminUserUpdateSerializer, SystemConfigSerializer, AdminUserCreationSerializer
from rest_framework import status, parsers
from rest_framework.response import Response
from django.http import HttpResponse
import csv
from resources.models import AcademicResource
from opportunities.models import Opportunity
from events.models import Event

class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for User model providing CRUD operations
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_serializer_class(self):
        if self.action in ['update', 'partial_update'] and self.request.user.is_staff:
            return AdminUserUpdateSerializer
        return UserSerializer

    def get_permissions(self):
        """
        Allow anyone to create a user (registration)
        Require Admin privileges to list all users
        Require Admin privileges to update/delete other users
        Require authentication for retrieval
        """
        if self.action == 'create':
            permission_classes = [permissions.AllowAny]
        elif self.action in ['list', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        """
        Custom endpoint to get the current authenticated user's data
        Accessible at: /api/users/me/
        """
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def create_user(self, request):
        """
        Admin endpoint to create a new user without KNUST domain restrictions.
        Accessible at: POST /api/users/create_user/

        Required fields:
        - username: Unique username
        - email: Unique email (no domain restriction for admin)
        - password: Min 8 characters

        Optional fields:
        - first_name, last_name, phone_number, is_student, is_alumni
        """
        serializer = AdminUserCreationSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {
                    'message': 'User created successfully',
                    'user': UserSerializer(user).data
                },
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def bulk_delete(self, request):
        """
        Admin endpoint to delete multiple users at once.
        Accessible at: POST /api/users/bulk_delete/

        Expected payload:
        {
            "user_ids": [1, 2, 3, 4]
        }

        Returns count of deleted users.
        """
        user_ids = request.data.get('user_ids', [])

        if not user_ids or not isinstance(user_ids, list):
            return Response(
                {'error': 'user_ids must be a non-empty list'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Prevent admin from deleting themselves
        if request.user.id in user_ids:
            return Response(
                {'error': 'You cannot delete your own account'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Delete users and get count
        deleted_count, _ = User.objects.filter(id__in=user_ids).delete()

        return Response(
            {
                'message': f'{deleted_count} user(s) deleted successfully',
                'deleted_count': deleted_count
            },
            status=status.HTTP_200_OK
        )


class ProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Profile model providing CRUD operations
    """
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Filter profiles - users can only see their own profile unless they're staff
        """
        if self.request.user.is_staff:
            return Profile.objects.all()
        return Profile.objects.filter(user=self.request.user)


class CurrentUserView(APIView):
    """
    API endpoint to retrieve and update the current authenticated user's data.
    This provides a clean, dedicated endpoint for getting and updating user context,
    including nested profile information.

    Endpoints:
    - GET /api/users/me/
    - PUT /api/users/me/
    - PATCH /api/users/me/

    Permission: IsAuthenticated
    Returns:
    - 200 OK: User data with nested profile
    - 401 Unauthorized: User not authenticated

    FormData Structure:
    Frontend sends FormData with profile fields prefixed with 'profile.':
    - first_name, last_name, phone_number (User fields)
    - profile.other_names, profile.hometown, etc. (Profile fields)
    - profile.profile_picture (File upload)
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get(self, request):
        """
        Return the current authenticated user's data with profile.
        """
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)

    def _process_request_data(self, request_data):
        """
        Process FormData to extract User and Profile fields.
        Frontend sends profile fields prefixed with 'profile.'
        This method restructures the data for the serializer.
        """
        user_data = {}
        profile_data = {}

        # Iterate through all data fields
        for key, value in request_data.items():
            if key.startswith('profile.'):
                # Extract profile field name (remove 'profile.' prefix)
                profile_key = key.replace('profile.', '')
                profile_data[profile_key] = value
            else:
                # User model field
                user_data[key] = value

        # Add nested profile data if any profile fields were found
        if profile_data:
            user_data['profile'] = profile_data

        return user_data

    def put(self, request):
        """
        Update the current authenticated user's data and profile.
        Handles both User model fields and nested Profile fields.
        Accepts FormData with 'profile.' prefixed fields.
        """
        user = request.user

        # Process FormData to restructure for serializer
        processed_data = self._process_request_data(request.data)

        # Use UserUpdateSerializer with partial=True (since username/email are not provided)
        serializer = UserUpdateSerializer(user, data=processed_data, partial=True)

        if serializer.is_valid():
            serializer.save()
            # Return full user data using UserSerializer
            return Response(UserSerializer(user, context={'request': request}).data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        """
        Partially update the current authenticated user's data and profile.
        Handles both User model fields and nested Profile fields.
        Accepts FormData with 'profile.' prefixed fields.
        """
        user = request.user

        # Process FormData to restructure for serializer
        processed_data = self._process_request_data(request.data)

        # Use UserUpdateSerializer with partial=True
        serializer = UserUpdateSerializer(user, data=processed_data, partial=True)

        if serializer.is_valid():
            serializer.save()
            # Return full user data using UserSerializer
            return Response(UserSerializer(user, context={'request': request}).data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class RegisterView(generics.CreateAPIView):
    """
    Public registration endpoint for KNUST students.

    Allows unauthenticated users to register with a KNUST student email.
    Email domain validation is enforced in the UserRegistrationSerializer.

    Endpoint: POST /api/auth/register/
    Permission: AllowAny (public)

    Required fields:
    - username: User's chosen username (can be student ID)
    - email: Must end with @st.knust.edu.gh
    - password: User's password
    - password_confirm: Password confirmation (must match password)

    Optional fields:
    - first_name: User's first name
    - last_name: User's last name

    Returns:
    - 201 Created: User successfully registered
    - 400 Bad Request: Validation errors (invalid domain, passwords don't match, etc.)
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        """
        Override create to return custom success message with user data.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Return user data without password
        user_data = UserSerializer(user).data

        return Response(
            {
                'message': 'Registration successful. You can now login.',
                'user': user_data
            },
            status=status.HTTP_201_CREATED
        )


class AdminDashboardStatsView(APIView):
    """
    API endpoint for Admin Dashboard statistics.
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from elections.models import Election
        from announcements.models import Announcement
        from django.utils import timezone

        # Count only ongoing/active elections (not ended)
        now = timezone.now()
        active_elections = Election.objects.filter(
            is_active=True,
            end_date__gte=now
        ).count()

        total_users = User.objects.count()
        total_announcements = Announcement.objects.count()

        # New counts with proper filtering
        from resources.models import AcademicResource
        from opportunities.models import Opportunity
        from events.models import Event

        total_resources = AcademicResource.objects.count()

        # Count only active opportunities (not expired)
        active_opportunities = Opportunity.objects.filter(
            is_active=True,
            deadline__gte=now
        ).count()

        # Count only upcoming events (not past events)
        today = timezone.now().date()
        upcoming_events = Event.objects.filter(date__gte=today).count()

        try:
            from market.models import Product
            pending_market = Product.objects.filter(is_sold=False).count()
        except (ImportError, Exception):
            pending_market = 0

        try:
             from welfare.models import WelfareReport
             pending_welfare = WelfareReport.objects.filter(status='Pending').count()
        except (ImportError, Exception):
             pending_welfare = 0

        data = {
            "total_users": total_users,
            "active_elections": active_elections,
            "pending_market_items": pending_market,
            "pending_welfare": pending_welfare,
            "total_announcements": total_announcements,
            "total_resources": total_resources,
            "total_opportunities": active_opportunities,
            "total_events": upcoming_events,
        }
        return Response(data)


class AdminActivityView(APIView):
    """
    API endpoint for Admin Dashboard recent activity.
    Returns merged activity from Users, Products, WelfareReports, and Lost & Found items.

    Activity types:
    - user: New user registrations
    - market: New products listed
    - welfare: New welfare reports
    - lost_found: New lost/found items reported
    - lost_found_resolved: Lost/found items resolved
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from market.models import Product
        from welfare.models import WelfareReport
        from lost_found.models import LostItem
        from django.utils import timezone

        activities = []

        # Fetch recent users (last 5)
        recent_users = User.objects.order_by('-date_joined')[:5]
        for user in recent_users:
            activities.append({
                'type': 'user',
                'message': f"New user registered: {user.username}",
                'time': user.date_joined.isoformat(),
                'timestamp': user.date_joined
            })

        # Fetch recent market products (last 5)
        try:
            recent_products = Product.objects.order_by('-created_at')[:5]
            for product in recent_products:
                activities.append({
                    'type': 'market',
                    'message': f"New product listed: {product.title}",
                    'time': product.created_at.isoformat(),
                    'timestamp': product.created_at
                })
        except Exception:
            pass

        # Fetch recent welfare reports (last 5)
        try:
            recent_welfare = WelfareReport.objects.order_by('-created_at')[:5]
            for report in recent_welfare:
                activities.append({
                    'type': 'welfare',
                    'message': f"New welfare report: {report.category}",
                    'time': report.created_at.isoformat(),
                    'timestamp': report.created_at
                })
        except Exception:
            pass

        # Fetch recent lost & found items (last 5)
        try:
            recent_lost_found = LostItem.objects.order_by('-created_at')[:5]
            for item in recent_lost_found:
                item_type = "Lost" if item.type == "Lost" else "Found"
                activities.append({
                    'type': 'lost_found',
                    'message': f"{item_type} item reported: {item.get_category_display()}",
                    'time': item.created_at.isoformat(),
                    'timestamp': item.created_at
                })
        except Exception:
            pass

        # Fetch recently resolved lost & found items (last 5)
        try:
            recently_resolved = LostItem.objects.filter(
                is_resolved=True
            ).order_by('-updated_at')[:5]
            for item in recently_resolved:
                item_type = "Lost" if item.type == "Lost" else "Found"
                activities.append({
                    'type': 'lost_found_resolved',
                    'message': f"{item_type} item resolved: {item.get_category_display()}",
                    'time': item.updated_at.isoformat(),
                    'timestamp': item.updated_at
                })
        except Exception:
            pass

        # Sort all activities by timestamp (newest first) and limit to 10
        activities.sort(key=lambda x: x['timestamp'], reverse=True)
        activities = activities[:10]

        # Remove timestamp field before returning (used only for sorting)
        for activity in activities:
            del activity['timestamp']

        return Response({'activities': activities})


class SystemConfigView(APIView):
    """
    API endpoint for retrieving and updating system configuration.
    Singleton pattern - only one instance exists (ID=1).

    GET /api/system-config/ - Retrieve current system config
    PATCH /api/system-config/ - Update system config

    Permission: IsAdminUser (only admins can access)

    TODO: Implement middleware to check maintenance_mode and restrict user access
    TODO: Implement registration guard to check allow_registration before signup
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        """
        Retrieve the singleton SystemConfig instance.
        Creates it if it doesn't exist.
        """
        config = SystemConfig.load()
        serializer = SystemConfigSerializer(config)
        return Response(serializer.data)

    def patch(self, request):
        """
        Update the singleton SystemConfig instance.
        """
        config = SystemConfig.load()
        serializer = SystemConfigSerializer(config, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserExportView(APIView):
    """
    API endpoint for exporting user data as CSV.
    Returns a CSV file with student information.

    GET /api/export/users/ - Download CSV with all users

    Permission: IsAdminUser (only admins can export data)

    CSV Columns: Student Name, Student ID, Hall, Phone
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        """
        Generate and return CSV file with user data.
        """
        # Create HttpResponse with CSV content type
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="users_export.csv"'

        # Create CSV writer
        writer = csv.writer(response)

        # Write header row
        writer.writerow(['Student Name', 'Student ID', 'Hall', 'Phone'])

        # Fetch all users with profiles
        users = User.objects.select_related('profile').all()

        # Write data rows
        for user in users:
            # Construct full name
            full_name = f"{user.first_name} {user.last_name}".strip() or user.username

            # Get profile data if exists
            student_id = user.profile.student_id if hasattr(user, 'profile') and user.profile.student_id else 'N/A'
            hall = user.profile.hall_of_residence if hasattr(user, 'profile') and user.profile.hall_of_residence else 'N/A'
            phone = user.phone_number or 'N/A'

            writer.writerow([full_name, student_id, hall, phone])

        return response


class ChangePasswordView(APIView):
    """
    View for changing user password.
    Requires authentication and validates old password before setting new one.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """
        Change password for the authenticated user.

        Expected payload:
        {
            "old_password": "current password",
            "new_password": "new password",
            "confirm_password": "new password confirmation"
        }
        """
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')

        # Validate all fields are present
        if not all([old_password, new_password, confirm_password]):
            return Response({
                'error': 'All fields are required (old_password, new_password, confirm_password)'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Verify old password
        if not user.check_password(old_password):
            return Response({
                'error': 'Current password is incorrect'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Verify new passwords match
        if new_password != confirm_password:
            return Response({
                'error': 'New passwords do not match'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Verify new password is different from old
        if old_password == new_password:
            return Response({
                'error': 'New password must be different from current password'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate password length
        if len(new_password) < 8:
            return Response({
                'error': 'Password must be at least 8 characters long'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Set new password
        user.set_password(new_password)
        user.save()

        return Response({
            'message': 'Password changed successfully'
        }, status=status.HTTP_200_OK)
