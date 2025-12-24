from django.contrib import admin
from .models import Executive


@admin.register(Executive)
class ExecutiveAdmin(admin.ModelAdmin):
    """
    Admin interface for managing DASA KNUST Executive Council members.
    """

    list_display = ('title', 'get_full_name', 'rank', 'academic_year', 'is_current')
    list_filter = ('is_current', 'academic_year', 'title')
    search_fields = ('title', 'user__username', 'user__first_name', 'user__last_name', 'bio')
    ordering = ('academic_year', 'rank')

    fieldsets = (
        ('Executive Information', {
            'fields': ('user', 'title', 'rank', 'bio')
        }),
        ('Academic Year', {
            'fields': ('academic_year', 'is_current')
        }),
        ('Photos', {
            'fields': ('official_photo',)
        }),
        ('Social Media', {
            'fields': ('facebook_url', 'twitter_url', 'instagram_url', 'linkedin_url'),
            'classes': ('collapse',)
        }),
    )

    def get_full_name(self, obj):
        """Display the executive's full name in the admin list"""
        if obj.user.first_name and obj.user.last_name:
            return f"{obj.user.first_name} {obj.user.last_name}"
        return obj.user.username
    get_full_name.short_description = 'Name'
    get_full_name.admin_order_field = 'user__first_name'
