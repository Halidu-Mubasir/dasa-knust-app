from rest_framework import serializers
from .models import Chapter, Article


class ArticleSerializer(serializers.ModelSerializer):
    """
    Serializer for Article model.
    """
    class Meta:
        model = Article
        fields = ['id', 'article_number', 'title', 'content', 'chapter']


class ChapterSerializer(serializers.ModelSerializer):
    """
    Serializer for Chapter model with nested articles.
    """
    articles = ArticleSerializer(many=True, read_only=True)
    article_count = serializers.SerializerMethodField()

    class Meta:
        model = Chapter
        fields = ['id', 'number', 'title', 'articles', 'article_count']

    def get_article_count(self, obj):
        return obj.articles.count()
