from django.db import models


class Event(models.Model):
    """
    Model representing DASA events and activities.

    Stores all event information including scheduling, location, and descriptions.
    """

    title = models.CharField(
        max_length=200,
        help_text="Event title/name"
    )

    description = models.TextField(
        help_text="Detailed description of the event"
    )

    date = models.DateField(
        help_text="Date of the event"
    )

    start_time = models.TimeField(
        help_text="Event start time"
    )

    end_time = models.TimeField(
        help_text="Event end time"
    )

    location = models.CharField(
        max_length=200,
        help_text="Event venue/location"
    )

    event_image = models.ImageField(
        upload_to='events/images/',
        blank=True,
        null=True,
        help_text="Optional event banner/poster image"
    )

    is_featured = models.BooleanField(
        default=False,
        help_text="Mark as featured event (shows on homepage)"
    )

    registration_required = models.BooleanField(
        default=False,
        help_text="Whether event requires registration"
    )

    registration_link = models.URLField(
        blank=True,
        null=True,
        help_text="External registration link (optional)"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['date', 'start_time']
        verbose_name = 'Event'
        verbose_name_plural = 'Events'

    def __str__(self):
        return f"{self.title} - {self.date}"

    @property
    def time_display(self):
        """Returns formatted time range string"""
        return f"{self.start_time.strftime('%I:%M %p')} - {self.end_time.strftime('%I:%M %p')}"

    @property
    def is_upcoming(self):
        """Check if event is in the future"""
        from django.utils import timezone
        return self.date >= timezone.now().date()
