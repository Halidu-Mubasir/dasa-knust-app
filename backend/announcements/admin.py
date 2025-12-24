from django.contrib import admin
from .models import Announcement


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    """
    Admin interface for managing announcements.
    """

    list_display = ('title', 'priority', 'is_active', 'created_at')
    list_filter = ('priority', 'is_active', 'created_at')
    search_fields = ('title', 'message')
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Announcement Details', {
            'fields': ('title', 'message', 'priority')
        }),
        ('Settings', {
            'fields': ('related_link', 'is_active')
        }),
    )
