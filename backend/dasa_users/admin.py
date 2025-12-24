from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Profile, SystemConfig


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom UserAdmin to ensure password hashing works correctly"""
    list_display = ['username', 'email', 'first_name', 'last_name', 'is_student', 'is_alumni', 'is_staff']
    list_filter = ['is_student', 'is_alumni', 'is_staff', 'is_active']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('is_student', 'is_alumni', 'phone_number')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Additional Info', {'fields': ('is_student', 'is_alumni', 'phone_number')}),
    )


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['student_id', 'user', 'college', 'program_of_study', 'year_group', 'hall_of_residence']
    list_filter = ['college', 'hall_of_residence', 'year_group', 'gender']
    search_fields = ['student_id', 'user__username', 'user__email', 'hometown']
    readonly_fields = ['user']


@admin.register(SystemConfig)
class SystemConfigAdmin(admin.ModelAdmin):
    """Admin interface for SystemConfig singleton model"""
    list_display = ['current_academic_year', 'current_semester', 'maintenance_mode', 'allow_registration', 'updated_at']
    fieldsets = (
        ('Academic Context', {
            'fields': ('current_academic_year', 'current_semester')
        }),
        ('System Controls', {
            'fields': ('maintenance_mode', 'allow_registration')
        }),
        ('Metadata', {
            'fields': ('updated_at',),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ['updated_at']

    def has_add_permission(self, request):
        """Prevent adding multiple instances (singleton pattern)"""
        return not SystemConfig.objects.exists()

    def has_delete_permission(self, request, obj=None):
        """Prevent deletion of the singleton instance"""
        return False
