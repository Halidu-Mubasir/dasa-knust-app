# Create your models here.
from django.db import models
from django.conf import settings
from django.utils import timezone

class Election(models.Model):
    title = models.CharField(max_length=200) # e.g., "2024/2025 General Elections"
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=False)
    is_published = models.BooleanField(default=False)
    
    def __str__(self):
        return self.title

    @property
    def is_open(self):
        now = timezone.now()
        return self.start_date <= now <= self.end_date and self.is_active

class Position(models.Model):
    election = models.ForeignKey(Election, on_delete=models.CASCADE, related_name='positions')
    name = models.CharField(max_length=100) # e.g., "President", "General Secretary"
    rank = models.IntegerField(default=0) # To order them on the page (President first)
    max_votes_per_user = models.IntegerField(default=1) # Usually 1, but maybe 2 for committee members

    def __str__(self):
        return f"{self.name} ({self.election.title})"

class Candidate(models.Model):
    position = models.ForeignKey(Position, on_delete=models.CASCADE, related_name='candidates')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    manifesto = models.TextField()
    photo = models.ImageField(upload_to='candidates/')
    
    def __str__(self):
        return f"{self.user.get_full_name()} for {self.position.name}"

class Vote(models.Model):
    voter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    position = models.ForeignKey(Position, on_delete=models.CASCADE)
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Ensures a student can only vote ONCE per position
        unique_together = ('voter', 'position') 

    def __str__(self):
        return f"Vote by {self.voter} for {self.position}"