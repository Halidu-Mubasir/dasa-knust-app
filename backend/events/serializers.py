from rest_framework import serializers
from .models import Event


class EventSerializer(serializers.ModelSerializer):
    """
    Serializer for Event model with computed fields.

    Includes:
    - time_display: Formatted time range string
    - is_upcoming: Boolean indicating if event is in future
    - event_image_url: Absolute URL for event image
    """

    time_display = serializers.ReadOnlyField()
    is_upcoming = serializers.ReadOnlyField()
    event_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id',
            'title',
            'description',
            'date',
            'start_time',
            'end_time',
            'time_display',
            'location',
            'event_image',
            'event_image_url',
            'is_featured',
            'registration_required',
            'registration_link',
            'is_upcoming',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'time_display', 'is_upcoming']

    def get_event_image_url(self, obj):
        """Returns absolute URL for event image if available"""
        if obj.event_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.event_image.url)
            return obj.event_image.url
        return None
