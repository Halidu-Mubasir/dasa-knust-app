from rest_framework import serializers
from .models import Announcement


class AnnouncementSerializer(serializers.ModelSerializer):
    """
    Serializer for Announcement model.

    Returns all active announcements with priority and related links.
    """

    class Meta:
        model = Announcement
        fields = [
            'id',
            'title',
            'message',
            'priority',
            'related_link',
            'is_active',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']
