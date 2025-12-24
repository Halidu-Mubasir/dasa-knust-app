"""
Management command to fix existing announcements that don't have Generic FK links.

This will try to match announcements to their related Event or LostItem objects
and set the content_type and object_id fields.

Usage:
    python manage.py fix_announcement_links
"""

from django.core.management.base import BaseCommand
from django.contrib.contenttypes.models import ContentType
from announcements.models import Announcement
from events.models import Event
from lost_found.models import LostItem


class Command(BaseCommand):
    help = 'Fix existing announcements by linking them to their related objects'

    def handle(self, *args, **options):
        event_type = ContentType.objects.get_for_model(Event)
        lost_item_type = ContentType.objects.get_for_model(LostItem)

        # Get announcements without Generic FK links
        unlinked = Announcement.objects.filter(content_type__isnull=True)

        self.stdout.write(f'Found {unlinked.count()} unlinked announcements')

        fixed_count = 0
        deactivated_count = 0

        for announcement in unlinked:
            title = announcement.title

            # Try to match Event announcements
            if title.startswith('New Event:'):
                event_title = title.replace('New Event: ', '').strip()
                try:
                    # Try to find matching event by title
                    event = Event.objects.filter(title__icontains=event_title[:20]).first()
                    if event:
                        announcement.content_type = event_type
                        announcement.object_id = event.id
                        announcement.save()
                        self.stdout.write(f'  [OK] Linked "{title[:40]}" to Event #{event.id}')
                        fixed_count += 1
                    else:
                        self.stdout.write(f'  [SKIP] Could not find event for "{title[:40]}"')
                except Exception as e:
                    self.stdout.write(f'  [ERROR] Error linking event: {e}')

            # Try to match Lost/Found announcements
            elif title.startswith('LOST:') or title.startswith('FOUND:') or title.startswith('Lost:') or title.startswith('Found:'):
                # For Lost/Found items, we can't easily match them without more info
                # So we'll just deactivate old ones that are likely resolved
                self.stdout.write(f'  [INFO] Cannot auto-link Lost/Found item: "{title[:40]}"')
                # Optionally deactivate very old announcements (older than 30 days)
                from django.utils import timezone
                from datetime import timedelta
                if announcement.created_at < timezone.now() - timedelta(days=30):
                    announcement.is_active = False
                    announcement.save()
                    self.stdout.write(f'    [OK] Deactivated old announcement')
                    deactivated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'\nDone! Fixed {fixed_count} announcement(s), deactivated {deactivated_count} old announcement(s).'
            )
        )
