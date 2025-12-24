from django.db import models


class Chapter(models.Model):
    """
    Represents a chapter in the DASA Constitution.
    """
    number = models.IntegerField(unique=True, help_text="Chapter number")
    title = models.CharField(max_length=200, help_text="Chapter title")

    class Meta:
        ordering = ['number']
        verbose_name = 'Chapter'
        verbose_name_plural = 'Chapters'

    def __str__(self):
        return f"Chapter {self.number}: {self.title}"


class Article(models.Model):
    """
    Represents an article within a chapter of the Constitution.
    """
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, related_name='articles')
    article_number = models.CharField(max_length=20, help_text="Article number (e.g., '14', '14.1')")
    title = models.CharField(max_length=200, help_text="Article title")
    content = models.TextField(help_text="The actual law text")

    class Meta:
        ordering = ['chapter__number', 'article_number']
        verbose_name = 'Article'
        verbose_name_plural = 'Articles'

    def __str__(self):
        return f"Article {self.article_number}: {self.title}"
