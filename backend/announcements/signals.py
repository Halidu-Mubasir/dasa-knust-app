from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from events.models import Event
from lost_found.models import LostItem
from .models import Announcement


@receiver(post_save, sender=Event)
def create_event_announcement(sender, instance, created, **kwargs):
    """
    Automatically create an announcement when a new event is created.

    This signal listens to Event creation and generates a corresponding
    announcement to notify users about the new event.
    """
    if created:
        # Create announcement for the new event with Generic Foreign Key
        event_type = ContentType.objects.get_for_model(Event)
        Announcement.objects.create(
            title=f"New Event: {instance.title}",
            message=f"A new event has been scheduled at {instance.location} on {instance.date.strftime('%B %d, %Y')} at {instance.start_time.strftime('%I:%M %p')}. {instance.description[:100]}{'...' if len(instance.description) > 100 else ''}",
            priority='High' if instance.is_featured else 'Normal',
            related_link='/events',
            is_active=True,
            content_type=event_type,
            object_id=instance.id
        )


@receiver(post_save, sender=LostItem)
def handle_lost_item_announcement(sender, instance, created, **kwargs):
    """
    Handle Lost & Found item announcements.
    - Create announcement when item is posted
    - Deactivate announcement when item is resolved
    """
    lost_item_type = ContentType.objects.get_for_model(LostItem)

    if created:
        # Create announcement for new lost/found item
        item_type = "Lost" if instance.type == "Lost" else "Found"
        Announcement.objects.create(
            title=f"{item_type}: {instance.get_category_display()}",
            message=f"A {instance.get_category_display()} has been reported as {item_type.lower()}. {instance.description[:100]}{'...' if len(instance.description) > 100 else ''}",
            priority='Normal',
            related_link='/lost-found',
            is_active=True,
            content_type=lost_item_type,
            object_id=instance.id
        )
    else:
        # If item is resolved, deactivate its announcement
        if instance.is_resolved:
            Announcement.objects.filter(
                content_type=lost_item_type,
                object_id=instance.id
            ).update(is_active=False)
