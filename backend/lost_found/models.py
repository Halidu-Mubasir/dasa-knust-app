from django.db import models
from django.conf import settings


class LostItem(models.Model):
    """
    Model for lost and found items.
    Automatically creates announcements when items are posted.
    """

    TYPE_CHOICES = [
        ('Lost', 'Lost'),
        ('Found', 'Found'),
    ]

    CATEGORY_CHOICES = [
        ('Student ID', 'Student ID'),
        ('Keys', 'Keys'),
        ('Wallet', 'Wallet'),
        ('Gadget', 'Gadget'),
        ('Other', 'Other'),
    ]

    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='lost_items',
        help_text="User who reported the item"
    )
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, help_text="Lost or Found")
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    student_name = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        help_text="For Student IDs - name on the ID"
    )
    image = models.ImageField(
        upload_to='lost_found/',
        blank=True,
        null=True,
        help_text="Optional image of the item"
    )
    description = models.TextField(help_text="Description and location details")
    contact_info = models.CharField(max_length=100, help_text="Phone/WhatsApp for contact")
    is_resolved = models.BooleanField(default=False, help_text="Mark as resolved")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Lost/Found Item'
        verbose_name_plural = 'Lost/Found Items'

    def __str__(self):
        return f"{self.type}: {self.get_category_display()}"
