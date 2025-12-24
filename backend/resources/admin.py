from django.contrib import admin
from .models import AcademicResource


@admin.register(AcademicResource)
class AcademicResourceAdmin(admin.ModelAdmin):
    """
    Admin interface for managing academic resources.
    """

    list_display = ('course_code', 'title', 'college', 'level', 'semester', 'downloads', 'uploaded_at')
    list_filter = ('college', 'level', 'semester', 'uploaded_at')
    search_fields = ('title', 'course_code')
    ordering = ('-uploaded_at',)
    date_hierarchy = 'uploaded_at'
    readonly_fields = ('downloads', 'uploaded_at')

    fieldsets = (
        ('Resource Details', {
            'fields': ('title', 'course_code', 'file')
        }),
        ('Academic Info', {
            'fields': ('college', 'level', 'semester')
        }),
        ('Statistics', {
            'fields': ('downloads', 'uploaded_at'),
            'classes': ('collapse',)
        }),
    )
