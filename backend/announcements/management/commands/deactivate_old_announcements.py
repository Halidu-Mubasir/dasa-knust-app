"""
Management command to deactivate announcements for past events.

This can be run as a cron job daily to automatically clean up old announcements.

Usage:
    python manage.py deactivate_old_announcements
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.contenttypes.models import ContentType
from events.models import Event
from announcements.models import Announcement


class Command(BaseCommand):
    help = 'Deactivate announcements for past events'

    def handle(self, *args, **options):
        now = timezone.now()
        event_type = ContentType.objects.get_for_model(Event)

        # Get past events
        past_events = Event.objects.filter(date__lt=now.date())
        past_event_ids = list(past_events.values_list('id', flat=True))

        if not past_event_ids:
            self.stdout.write(self.style.SUCCESS('No past events found.'))
            return

        # Deactivate announcements for past events
        updated_count = Announcement.objects.filter(
            content_type=event_type,
            object_id__in=past_event_ids,
            is_active=True
        ).update(is_active=False)

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully deactivated {updated_count} announcement(s) for {len(past_event_ids)} past event(s).'
            )
        )
