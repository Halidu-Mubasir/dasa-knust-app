from django.db import models
from django.conf import settings


class Product(models.Model):
    """
    Model for marketplace products listed by students.
    """

    CATEGORY_CHOICES = [
        ('Electronics', 'Electronics'),
        ('Hostel Essentials', 'Hostel Essentials'),
        ('Books', 'Books'),
        ('Fashion', 'Fashion'),
        ('Other', 'Other'),
    ]

    CONDITION_CHOICES = [
        ('New', 'New'),
        ('Used - Like New', 'Used - Like New'),
        ('Used - Good', 'Used - Good'),
    ]

    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='products'
    )
    title = models.CharField(max_length=200, help_text="Product title")
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Price in GHS")
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES)
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES)
    image = models.ImageField(upload_to='market/', help_text="Product image")
    description = models.TextField(help_text="Product description")
    whatsapp_number = models.CharField(max_length=20, help_text="WhatsApp number for contact")
    is_sold = models.BooleanField(default=False, help_text="Mark as sold")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Product'
        verbose_name_plural = 'Products'

    def __str__(self):
        return f"{self.title} - GHS {self.price}"
