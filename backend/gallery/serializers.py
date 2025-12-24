from rest_framework import serializers
from .models import GalleryItem


class GalleryItemSerializer(serializers.ModelSerializer):
    """
    Serializer for GalleryItem with smart thumbnail URL logic.

    Returns thumbnail_url based on media type:
    - For images: returns the image URL
    - For videos: returns the video_thumbnail URL
    """

    thumbnail_url = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    video_url = serializers.SerializerMethodField()

    class Meta:
        model = GalleryItem
        fields = [
            'id',
            'title',
            'category',
            'media_type',
            'image',
            'video',
            'video_thumbnail',
            'thumbnail_url',
            'image_url',
            'video_url',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def get_thumbnail_url(self, obj):
        """
        Smart thumbnail URL resolver.

        Returns:
        - For images: the image URL
        - For videos: the video_thumbnail URL if available
        - None if no appropriate media is available
        """
        request = self.context.get('request')

        if obj.media_type == 'Image' and obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url

        elif obj.media_type == 'Video' and obj.video_thumbnail:
            if request:
                return request.build_absolute_uri(obj.video_thumbnail.url)
            return obj.video_thumbnail.url

        return None

    def get_image_url(self, obj):
        """Returns the full image URL if media_type is Image"""
        if obj.media_type == 'Image' and obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def get_video_url(self, obj):
        """Returns the full video URL if media_type is Video"""
        if obj.media_type == 'Video' and obj.video:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.video.url)
            return obj.video.url
        return None
