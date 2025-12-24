from django.db import models

class Opportunity(models.Model):
    TYPE_CHOICES = [
        ('Job', 'Job'),
        ('Internship', 'Internship'),
        ('NSS', 'NSS'),
        ('Research', 'Research'),
        ('Undergarduate', 'Undergarduate'),
        ('Postgraduate', 'Postgraduate'),
        ('Masters', 'Masters'),
        ('PhD', 'PhD'),
        ('Workshop', 'Workshop'),
        ('Conference', 'Conference'),
        ('Scholarship', 'Scholarship'),
        ('Other', 'Other'),
    ]
    
    title = models.CharField(max_length=200)
    organization = models.CharField(max_length=200)
    location = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    description = models.TextField()
    application_link = models.URLField()
    deadline = models.DateTimeField()
    posted_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['deadline']
        verbose_name_plural = 'Opportunities'
    
    def __str__(self):
        return f"{self.title} - {self.organization}"
