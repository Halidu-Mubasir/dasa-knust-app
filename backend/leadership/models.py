from django.db import models
from django.conf import settings


class Executive(models.Model):
    """
    Model representing DASA KNUST Executive Council members.

    Tracks current and historical leadership with portfolios, photos,
    and biographical information. Supports multiple academic years.
    """

    # Link to the student holding this executive position
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='executive_positions',
        help_text="The student holding this executive position"
    )

    # Position details
    title = models.CharField(
        max_length=100,
        help_text="Executive position title (e.g., 'President', 'General Secretary')"
    )

    rank = models.IntegerField(
        help_text="Sorting order (1 for President, 2 for Vice President, etc.)"
    )

    bio = models.TextField(
        help_text="Short quote or manifesto snippet",
        blank=True
    )

    # Academic year tracking
    academic_year = models.CharField(
        max_length=20,
        help_text="Academic year (e.g., '2024/2025')"
    )

    is_current = models.BooleanField(
        default=True,
        help_text="Whether this is the current executive council"
    )

    # Official executive photo (separate from profile picture)
    official_photo = models.ImageField(
        upload_to='executives/',
        blank=True,
        null=True,
        help_text="Official executive portrait. Falls back to user's profile picture if empty."
    )

    # Social media links (JSON field for flexibility)
    social_links = models.JSONField(
        default=dict,
        blank=True,
        help_text="Social media links: {'linkedin': 'url', 'twitter': 'url', 'instagram': 'url'}"
    )

    # Legacy fields - kept for backward compatibility, can be migrated to social_links
    facebook_url = models.URLField(blank=True, null=True)
    twitter_url = models.URLField(blank=True, null=True)
    instagram_url = models.URLField(blank=True, null=True)
    linkedin_url = models.URLField(blank=True, null=True)

    class Meta:
        ordering = ['rank']
        verbose_name = 'Executive'
        verbose_name_plural = 'Executives'
        # Ensure one person can only hold one position per academic year
        unique_together = ['user', 'academic_year']

    def __str__(self):
        return f"{self.title} - {self.user.get_full_name() or self.user.username} ({self.academic_year})"

    def get_display_photo(self):
        """
        Returns the best available photo URL.
        Priority: official_photo > user.profile.profile_picture > None
        """
        if self.official_photo:
            return self.official_photo.url
        if hasattr(self.user, 'profile') and self.user.profile.profile_picture:
            return self.user.profile.profile_picture.url
        return None
