from django.contrib import admin
from .models import Chapter, Article


class ArticleInline(admin.TabularInline):
    model = Article
    extra = 1
    fields = ('article_number', 'title', 'content')


@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    """
    Admin interface for Constitution Chapters.
    """
    list_display = ('number', 'title', 'article_count')
    search_fields = ('title',)
    ordering = ('number',)
    inlines = [ArticleInline]

    def article_count(self, obj):
        return obj.articles.count()
    article_count.short_description = 'Articles'


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    """
    Admin interface for Constitution Articles.
    """
    list_display = ('article_number', 'title', 'chapter')
    list_filter = ('chapter',)
    search_fields = ('title', 'content', 'article_number')
    ordering = ('chapter__number', 'article_number')

    fieldsets = (
        ('Article Info', {
            'fields': ('chapter', 'article_number', 'title')
        }),
        ('Content', {
            'fields': ('content',)
        }),
    )
