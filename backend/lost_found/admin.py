from django.contrib import admin
from .models import LostItem


@admin.register(LostItem)
class LostItemAdmin(admin.ModelAdmin):
    """
    Admin interface for lost and found items.
    """
    list_display = ('type', 'category', 'student_name_display', 'reporter', 'is_resolved', 'created_at')
    list_filter = ('type', 'category', 'is_resolved', 'created_at')
    search_fields = ('description', 'student_name', 'reporter__username')
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        ('Item Info', {
            'fields': ('reporter', 'type', 'category', 'student_name')
        }),
        ('Details', {
            'fields': ('description', 'image', 'contact_info')
        }),
        ('Status', {
            'fields': ('is_resolved',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def student_name_display(self, obj):
        return obj.student_name if obj.student_name else '-'
    student_name_display.short_description = 'Student Name'
