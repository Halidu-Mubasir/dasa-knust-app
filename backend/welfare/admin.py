from django.contrib import admin
from .models import WelfareReport


@admin.register(WelfareReport)
class WelfareReportAdmin(admin.ModelAdmin):
    """
    Admin interface for Welfare Reports.
    """
    list_display = ('id', 'category', 'status', 'is_anonymous', 'reporter_display', 'created_at')
    list_filter = ('category', 'status', 'is_anonymous', 'created_at')
    search_fields = ('description', 'location', 'contact_info')
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        ('Report Details', {
            'fields': ('category', 'description', 'location')
        }),
        ('Reporter Information', {
            'fields': ('is_anonymous', 'reporter', 'contact_info')
        }),
        ('Status', {
            'fields': ('status',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def reporter_display(self, obj):
        if obj.is_anonymous:
            return "Anonymous"
        return obj.reporter.username if obj.reporter else "Unknown"
    reporter_display.short_description = 'Reporter'
