from django.contrib import admin
from .models import Event


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    """
    Admin interface for managing DASA events.
    """

    list_display = ('title', 'date', 'start_time', 'location', 'is_featured', 'is_upcoming')
    list_filter = ('is_featured', 'date', 'registration_required')
    search_fields = ('title', 'description', 'location')
    ordering = ('date', 'start_time')
    date_hierarchy = 'date'

    fieldsets = (
        ('Event Information', {
            'fields': ('title', 'description', 'event_image')
        }),
        ('Schedule', {
            'fields': ('date', 'start_time', 'end_time', 'location')
        }),
        ('Settings', {
            'fields': ('is_featured', 'registration_required', 'registration_link')
        }),
    )

    def is_upcoming(self, obj):
        """Display if event is upcoming"""
        return obj.is_upcoming
    is_upcoming.boolean = True
    is_upcoming.short_description = 'Upcoming'
