from rest_framework import serializers
from .models import AcademicResource


class AcademicResourceSerializer(serializers.ModelSerializer):
    """
    Serializer for AcademicResource model.
    """

    file_url = serializers.SerializerMethodField()
    college_display = serializers.CharField(source='get_college_display', read_only=True)
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    semester_display = serializers.CharField(source='get_semester_display', read_only=True)

    class Meta:
        model = AcademicResource
        fields = [
            'id',
            'title',
            'course_code',
            'file',
            'file_url',
            'college',
            'college_display',
            'level',
            'level_display',
            'semester',
            'semester_display',
            'uploaded_at',
            'downloads',
        ]
        read_only_fields = ['uploaded_at', 'downloads']

    def get_file_url(self, obj):
        """Return full URL for the file"""
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None
