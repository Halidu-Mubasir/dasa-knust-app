from django.db import models
from django.conf import settings


class WelfareReport(models.Model):
    """
    Model for welfare reports submitted by students.
    Supports anonymous submissions.
    """

    CATEGORY_CHOICES = [
        ('Harassment', 'Harassment'),
        ('Academic', 'Academic'),
        ('Accommodation', 'Accommodation'),
        ('Financial', 'Financial'),
        ('Other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Investigating', 'Investigating'),
        ('Resolved', 'Resolved'),
    ]

    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    description = models.TextField(help_text="Detailed description of the issue")
    location = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        help_text="Optional location (e.g., 'Katanga Block B')"
    )
    is_anonymous = models.BooleanField(default=False, help_text="Submit anonymously")
    contact_info = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        help_text="Optional contact information for follow-up"
    )
    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='welfare_reports',
        help_text="User who submitted the report (null if anonymous)"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Welfare Report'
        verbose_name_plural = 'Welfare Reports'

    def __str__(self):
        if self.is_anonymous:
            return f"Anonymous Report - {self.category} ({self.created_at.strftime('%Y-%m-%d')})"
        return f"Report by {self.reporter.username if self.reporter else 'Unknown'} - {self.category}"
