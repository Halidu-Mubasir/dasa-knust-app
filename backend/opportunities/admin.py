from django.contrib import admin
from .models import Opportunity

@admin.register(Opportunity)
class OpportunityAdmin(admin.ModelAdmin):
    list_display = ['title', 'organization', 'type', 'location', 'deadline', 'is_active']
    list_filter = ['type', 'is_active', 'posted_at']
    search_fields = ['title', 'organization', 'location']
    date_hierarchy = 'deadline'
