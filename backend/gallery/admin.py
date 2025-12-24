from django.contrib import admin
from .models import GalleryItem


@admin.register(GalleryItem)
class GalleryItemAdmin(admin.ModelAdmin):
    """
    Admin interface for managing DASA gallery media items.
    """

    list_display = ('get_title_display', 'category', 'media_type', 'created_at')
    list_filter = ('category', 'media_type', 'created_at')
    search_fields = ('title', 'category')
    ordering = ('-created_at',)

    fieldsets = (
        ('Media Information', {
            'fields': ('title', 'category', 'media_type')
        }),
        ('Image Upload', {
            'fields': ('image',),
            'description': 'Upload image file (for Image media type)'
        }),
        ('Video Upload', {
            'fields': ('video', 'video_thumbnail'),
            'description': 'Upload video file and thumbnail (for Video media type)'
        }),
    )

    def get_title_display(self, obj):
        """Display title or media type if title is empty"""
        return obj.title if obj.title else f"({obj.media_type})"
    get_title_display.short_description = 'Title'
    get_title_display.admin_order_field = 'title'
