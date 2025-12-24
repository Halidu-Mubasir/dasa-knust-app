from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Event
from announcements.models import Announcement

@receiver(post_save, sender=Event)
def create_event_announcement(sender, instance, created, **kwargs):
    """
    Automatically create an announcement when a new event is created.
    """
    if created:
        # Determine priority - Featured events get high priority
        priority = 'High' if instance.is_featured else 'Normal'

        title = f"Upcoming Event: {instance.title}"
        
        # Build message with date and time
        message = f"Join us on {instance.date.strftime('%B %d, %Y')} at {instance.location}. {instance.time_display}"
        
        # Create the announcement with generic relation link
        Announcement.objects.create(
            title=title,
            message=message,
            priority=priority,
            related_link='/events',
            is_active=True,
            content_object=instance
        )
