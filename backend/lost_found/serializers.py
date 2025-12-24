from rest_framework import serializers
from .models import LostItem


class LostItemSerializer(serializers.ModelSerializer):
    """
    Serializer for lost and found items.
    """
    reporter_name = serializers.CharField(source='reporter.username', read_only=True)
    reporter_details = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = LostItem
        fields = [
            'id',
            'reporter',
            'reporter_name',
            'reporter_details',
            'type',
            'type_display',
            'category',
            'category_display',
            'student_name',
            'image',
            'image_url',
            'description',
            'contact_info',
            'is_resolved',
            'created_at',
        ]
        read_only_fields = ['reporter', 'created_at']

    def get_reporter_details(self, obj):
        """Return nested reporter details with avatar"""
        if not obj.reporter:
            return None

        return {
            'id': obj.reporter.id,
            'username': obj.reporter.username,
            'email': obj.reporter.email,
            'full_name': f"{obj.reporter.first_name} {obj.reporter.last_name}" if obj.reporter.first_name and obj.reporter.last_name else obj.reporter.username,
            'avatar': obj.reporter.profile.profile_picture.url if hasattr(obj.reporter, 'profile') and obj.reporter.profile.profile_picture else None,
        }

    def get_image_url(self, obj):
        """Return full URL for the image"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def create(self, validated_data):
        """Set reporter to current user"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['reporter'] = request.user
        return super().create(validated_data)
