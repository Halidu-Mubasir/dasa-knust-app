from django.db import models


class GalleryItem(models.Model):
    """
    Model representing media items (images/videos) in the DASA gallery.

    Supports categorization and different media types with appropriate thumbnails.
    """

    CATEGORY_CHOICES = [
        ('General', 'General'),
        ('Sports', 'Sports'),
        ('Cultural', 'Cultural'),
        ('Politics', 'Politics'),
        ('Excursion', 'Excursion'),
    ]

    MEDIA_TYPE_CHOICES = [
        ('Image', 'Image'),
        ('Video', 'Video'),
    ]

    title = models.CharField(
        max_length=200,
        blank=True,
        help_text="Optional title/caption for the media"
    )

    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default='General',
        help_text="Category of the media item"
    )

    media_type = models.CharField(
        max_length=10,
        choices=MEDIA_TYPE_CHOICES,
        default='Image',
        help_text="Type of media (Image or Video)"
    )

    # Image field (for photos)
    image = models.ImageField(
        upload_to='gallery/images/',
        blank=True,
        null=True,
        help_text="Upload image file (for Image media type)"
    )

    # Video field (for videos)
    video = models.FileField(
        upload_to='gallery/videos/',
        blank=True,
        null=True,
        help_text="Upload video file (for Video media type)"
    )

    # Video thumbnail (manual upload for video previews)
    video_thumbnail = models.ImageField(
        upload_to='gallery/thumbnails/',
        blank=True,
        null=True,
        help_text="Thumbnail image for video preview"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Gallery Item'
        verbose_name_plural = 'Gallery Items'

    def __str__(self):
        if self.title:
            return f"{self.title} ({self.category})"
        return f"{self.media_type} - {self.category} - {self.created_at.strftime('%Y-%m-%d')}"

    def get_thumbnail_url(self):
        """
        Returns the appropriate thumbnail URL based on media type.
        For images: returns the image itself
        For videos: returns the video_thumbnail if available
        """
        if self.media_type == 'Image' and self.image:
            return self.image.url
        elif self.media_type == 'Video' and self.video_thumbnail:
            return self.video_thumbnail.url
        return None

    def clean(self):
        """Validate that the appropriate media field is filled based on media_type"""
        from django.core.exceptions import ValidationError

        if self.media_type == 'Image' and not self.image:
            raise ValidationError({'image': 'Image field is required for Image media type'})

        if self.media_type == 'Video' and not self.video:
            raise ValidationError({'video': 'Video field is required for Video media type'})
