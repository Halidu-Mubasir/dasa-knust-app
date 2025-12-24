from django.contrib import admin
from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """
    Admin interface for marketplace products.
    """
    list_display = ('title', 'seller', 'price', 'category', 'condition', 'is_sold', 'created_at')
    list_filter = ('category', 'condition', 'is_sold', 'created_at')
    search_fields = ('title', 'description', 'seller__username')
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        ('Product Info', {
            'fields': ('seller', 'title', 'price', 'category', 'condition')
        }),
        ('Details', {
            'fields': ('description', 'image', 'whatsapp_number')
        }),
        ('Status', {
            'fields': ('is_sold',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
