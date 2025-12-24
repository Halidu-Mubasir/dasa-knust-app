from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import LostItem
from announcements.models import Announcement


@receiver(post_save, sender=LostItem)
def create_lost_found_announcement(sender, instance, created, **kwargs):
    """
    Automatically create an announcement when a lost/found item is posted.
    High priority for critical items (Student ID, Keys, Wallet).
    """
    if created:
        # Determine prefix based on type
        prefix = "FOUND" if instance.type == 'Found' else "LOST"

        # Determine priority based on category
        high_priority_categories = ['Student ID', 'Keys', 'Wallet']
        priority = 'High' if instance.category in high_priority_categories else 'Normal'

        # Build title with student name if available
        if instance.student_name and instance.category == 'Student ID':
            title = f"{prefix}: Student ID - {instance.student_name}"
        else:
            title = f"{prefix}: {instance.get_category_display()}"

        # Build message with truncated description
        description_preview = instance.description[:100]
        if len(instance.description) > 100:
            description_preview += "..."

        message = f"{description_preview} Contact: {instance.contact_info}"

        # Create the announcement with generic relation link
        Announcement.objects.create(
            title=title,
            message=message,
            priority=priority,
            related_link='/lost-and-found',
            is_active=True,
            content_object=instance
        )


@receiver(post_save, sender=LostItem)
def deactivate_resolved_announcement(sender, instance, created, **kwargs):
    """
    Deactivate announcement when a lost item is marked as resolved.
    """
    if instance.is_resolved:
        from django.contrib.contenttypes.models import ContentType
        
        # Find related announcements
        ctype = ContentType.objects.get_for_model(LostItem)
        announcements = Announcement.objects.filter(
            content_type=ctype,
            object_id=instance.id,
            is_active=True
        )
        
        # Deactivate them
        for announcement in announcements:
            announcement.is_active = False
            announcement.save()
