from rest_framework import serializers
from .models import Executive
from dasa_users.models import User


class ExecutiveSerializer(serializers.ModelSerializer):
    """
    Serializer for Executive model with nested user data and smart image handling.

    Returns the executive's information along with their full name and profile picture.
    Implements fallback logic: official_photo > user.profile.profile_picture > null

    - `user` field accepts User ID for write operations
    - `user_details` provides nested user info for read operations
    """

    # Write field: accepts User ID
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=False
    )

    # Read field: nested user details
    user_details = serializers.SerializerMethodField()

    # Nested user data (backward compatibility)
    full_name = serializers.SerializerMethodField()
    profile_picture = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    # User basic info
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Executive
        fields = [
            'id',
            'user',
            'user_details',
            'title',
            'rank',
            'bio',
            'academic_year',
            'is_current',
            'official_photo',
            'image_url',
            'full_name',
            'profile_picture',
            'username',
            'email',
            'social_links',
            'facebook_url',
            'twitter_url',
            'instagram_url',
            'linkedin_url',
        ]
        read_only_fields = ['id']

    def get_user_details(self, obj):
        """
        Returns nested user details for UI display.
        """
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'email': obj.user.email,
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name,
            'full_name': f"{obj.user.first_name} {obj.user.last_name}" if obj.user.first_name and obj.user.last_name else obj.user.username,
            'avatar': obj.user.profile.profile_picture.url if hasattr(obj.user, 'profile') and obj.user.profile.profile_picture else None,
        }

    def get_full_name(self, obj):
        """
        Returns the full name of the executive.
        Falls back to username if first_name and last_name are empty.
        """
        if obj.user.first_name and obj.user.last_name:
            return f"{obj.user.first_name} {obj.user.last_name}"
        return obj.user.username

    def get_profile_picture(self, obj):
        """
        Returns the URL of the user's profile picture.
        Returns None if no profile picture exists.
        """
        if hasattr(obj.user, 'profile') and obj.user.profile.profile_picture:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.user.profile.profile_picture.url)
            return obj.user.profile.profile_picture.url
        return None

    def get_image_url(self, obj):
        """
        Smart image URL resolver with fallback logic.

        Priority:
        1. Official executive photo (if uploaded)
        2. User's profile picture (from their profile)
        3. None (frontend will handle avatar fallback with initials)

        Returns: Absolute URL string or None
        """
        request = self.context.get('request')

        # Priority 1: Official photo
        if obj.official_photo:
            if request:
                return request.build_absolute_uri(obj.official_photo.url)
            return obj.official_photo.url

        # Priority 2: User's profile picture
        if hasattr(obj.user, 'profile') and obj.user.profile.profile_picture:
            if request:
                return request.build_absolute_uri(obj.user.profile.profile_picture.url)
            return obj.user.profile.profile_picture.url

        # Priority 3: No image available
        return None
