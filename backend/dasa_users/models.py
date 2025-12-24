# Create your models here.
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    """Custom user model to handle simplified login/auth"""
    is_student = models.BooleanField(default=True)
    is_alumni = models.BooleanField(default=False)
    phone_number = models.CharField(max_length=15, unique=True, null=True)

    def __str__(self):
        return self.username

class Profile(models.Model):
    # KNUST Context Enums
    HALLS = [
        ('Katanga', 'University Hall (Katanga)'),
        ('Conti', 'Unity Hall (Conti)'),
        ('Indece', 'Independence Hall'),
        ('Republic', 'Republic Hall'),
        ('Queens', 'Queen Elizabeth II Hall'),
        ('Africa', 'Africa Hall'),
        ('Off-Campus', 'Off-Campus/Hostel'),
    ]
    
    COLLEGES = [
        ('CoS', 'College of Science'),
        ('CoE', 'College of Engineering'),
        ('CoHS', 'College of Health Sciences'),
        ('CABE', 'College of Art and Built Environment'),
        ('CoHSS', 'College of Humanities and Social Sciences'),
        ('CANR', 'College of Agriculture and Natural Resources'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    student_id = models.CharField(max_length=10, unique=True, help_text="KNUST Student ID")
    
    # Personal Info
    other_names = models.CharField(max_length=100, blank=True)
    gender = models.CharField(max_length=10, choices=[('M', 'Male'), ('F', 'Female')])
    
    # Academic Info
    college = models.CharField(max_length=10, choices=COLLEGES)
    program_of_study = models.CharField(max_length=100) # e.g., BSc. Computer Science
    hall_of_residence = models.CharField(max_length=20, choices=HALLS)
    year_group = models.IntegerField(null=True,)
    
    # DASA Specific
    hometown = models.CharField(max_length=100)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.student_id}"


class SystemConfig(models.Model):
    """
    Singleton model for global system configuration.
    Only one instance of this model should exist (ID=1).
    """
    maintenance_mode = models.BooleanField(
        default=False,
        help_text="Enable maintenance mode to restrict user access"
    )
    allow_registration = models.BooleanField(
        default=True,
        help_text="Allow new users to register"
    )
    current_academic_year = models.CharField(
        max_length=20,
        default="2024/2025",
        help_text="Current academic year (e.g., 2024/2025)"
    )
    current_semester = models.IntegerField(
        default=1,
        choices=[(1, 'Semester 1'), (2, 'Semester 2')],
        help_text="Current semester"
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "System Configuration"
        verbose_name_plural = "System Configuration"

    def save(self, *args, **kwargs):
        """Override save to ensure singleton pattern (only one instance exists)"""
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        """Prevent deletion of the singleton instance"""
        pass

    @classmethod
    def load(cls):
        """Load the singleton instance, creating it if it doesn't exist"""
        obj, created = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return f"System Config - {self.current_academic_year}"