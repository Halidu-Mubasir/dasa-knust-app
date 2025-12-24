from django.db import models


class AcademicResource(models.Model):
    """
    Model for storing academic resources (PDFs, past questions, slides).
    """

    LEVEL_CHOICES = [
        (100, '100'),
        (200, '200'),
        (300, '300'),
        (400, '400'),
        (500, '500'),
        (600, '600'),
    ]

    SEMESTER_CHOICES = [
        (1, 'Semester 1'),
        (2, 'Semester 2'),
    ]

    COLLEGE_CHOICES = [
        ('CoS', 'College of Science'),
        ('CoE', 'College of Engineering'),
        ('CoHS', 'College of Health Sciences'),
        ('CABE', 'College of Art and Built Environment'),
        ('CoHSS', 'College of Humanities and Social Sciences'),
        ('CANR', 'College of Agriculture and Natural Resources'),
    ]

    title = models.CharField(max_length=200, help_text="Resource title (e.g., 'Calculus I Past Questions 2023')")
    course_code = models.CharField(max_length=20, help_text="Course code (e.g., 'MATH 122')")
    file = models.FileField(upload_to='resources/pasco/', help_text="Upload PDF file")
    college = models.CharField(max_length=10, choices=COLLEGE_CHOICES)
    level = models.IntegerField(choices=LEVEL_CHOICES)
    semester = models.IntegerField(choices=SEMESTER_CHOICES)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    downloads = models.IntegerField(default=0, editable=False)

    class Meta:
        ordering = ['-uploaded_at']
        verbose_name = 'Academic Resource'
        verbose_name_plural = 'Academic Resources'

    def __str__(self):
        return f"{self.course_code} - {self.title}"

    def increment_downloads(self):
        """Increment download count"""
        self.downloads += 1
        self.save(update_fields=['downloads'])
