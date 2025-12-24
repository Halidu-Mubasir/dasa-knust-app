from rest_framework import serializers
from .models import WelfareReport


class WelfareReportSerializer(serializers.ModelSerializer):
    """
    Serializer for WelfareReport model.
    Handles anonymous submissions and provides reporter details when not anonymous.
    """
    reporter_details = serializers.SerializerMethodField()

    class Meta:
        model = WelfareReport
        fields = [
            'id',
            'category',
            'description',
            'location',
            'is_anonymous',
            'contact_info',
            'reporter_details',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_reporter_details(self, obj):
        """
        Returns nested reporter details ONLY if report is not anonymous.
        Returns None if anonymous or reporter is not set.
        """
        if obj.is_anonymous or not obj.reporter:
            return None

        return {
            'id': obj.reporter.id,
            'username': obj.reporter.username,
            'email': obj.reporter.email,
            'first_name': obj.reporter.first_name,
            'last_name': obj.reporter.last_name,
            'full_name': f"{obj.reporter.first_name} {obj.reporter.last_name}" if obj.reporter.first_name and obj.reporter.last_name else obj.reporter.username,
            'avatar': obj.reporter.profile.profile_picture.url if hasattr(obj.reporter, 'profile') and obj.reporter.profile.profile_picture else None,
        }

    def create(self, validated_data):
        """
        Custom create method to handle anonymous submissions.
        If is_anonymous is True, reporter remains null.
        Otherwise, set reporter to current user if authenticated.
        """
        request = self.context.get('request')
        is_anonymous = validated_data.get('is_anonymous', False)

        if not is_anonymous and request and request.user.is_authenticated:
            validated_data['reporter'] = request.user
        else:
            validated_data['reporter'] = None

        # Clear contact_info if anonymous
        if is_anonymous:
            validated_data['contact_info'] = None

        return super().create(validated_data)
