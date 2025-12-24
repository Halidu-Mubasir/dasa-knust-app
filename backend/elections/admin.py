from django.contrib import admin
from .models import Election, Position, Candidate, Vote


@admin.register(Election)
class ElectionAdmin(admin.ModelAdmin):
    list_display = ['title', 'start_date', 'end_date', 'is_active', 'is_open']
    list_filter = ['is_active', 'start_date', 'end_date']
    search_fields = ['title']
    date_hierarchy = 'start_date'


@admin.register(Position)
class PositionAdmin(admin.ModelAdmin):
    list_display = ['name', 'election', 'rank', 'max_votes_per_user']
    list_filter = ['election']
    search_fields = ['name']
    ordering = ['election', 'rank']


@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = ['user', 'position', 'get_election']
    list_filter = ['position__election', 'position']
    search_fields = ['user__username', 'user__first_name', 'user__last_name']

    def get_election(self, obj):
        return obj.position.election.title
    get_election.short_description = 'Election'


@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ['voter', 'position', 'candidate', 'timestamp']
    list_filter = ['position__election', 'position', 'timestamp']
    search_fields = ['voter__username']
    readonly_fields = ['voter', 'position', 'candidate', 'timestamp']
    date_hierarchy = 'timestamp'

    def has_add_permission(self, request):
        # Prevent manual vote creation via admin
        return False

    def has_change_permission(self, request, obj=None):
        # Prevent vote modification
        return False
