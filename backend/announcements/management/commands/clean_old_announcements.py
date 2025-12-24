"""
Management command to clean up old announcements that don't have Generic FK links.

For announcements without content_type/object_id (created before the FK system),
this will deactivate:
- Lost/Found announcements older than 7 days
- Event announcements older than 30 days

Usage:
    python manage.py clean_old_announcements
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from announcements.models import Announcement


class Command(BaseCommand):
    help = 'Clean up old announcements without Generic FK links'

    def handle(self, *args, **options):
        now = timezone.now()

        # Get announcements without Generic FK links
        unlinked = Announcement.objects.filter(
            content_type__isnull=True,
            is_active=True
        )

        self.stdout.write(f'Found {unlinked.count()} active unlinked announcements')

        deactivated_count = 0

        for announcement in unlinked:
            title = announcement.title
            should_deactivate = False
            reason = ""

            # Deactivate Lost/Found announcements older than 7 days
            if any(keyword in title for keyword in ['LOST:', 'FOUND:', 'Lost:', 'Found:']):
                if announcement.created_at < now - timedelta(days=7):
                    should_deactivate = True
                    reason = "Lost/Found older than 7 days"

            # Deactivate Event announcements older than 30 days
            elif 'New Event:' in title:
                if announcement.created_at < now - timedelta(days=30):
                    should_deactivate = True
                    reason = "Event older than 30 days"

            # Deactivate generic announcements older than 60 days
            elif announcement.created_at < now - timedelta(days=60):
                should_deactivate = True
                reason = "Generic announcement older than 60 days"

            if should_deactivate:
                announcement.is_active = False
                announcement.save()
                self.stdout.write(f'  [DEACTIVATED] "{title[:50]}" - {reason}')
                deactivated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'\nDone! Deactivated {deactivated_count} old announcement(s).'
            )
        )
