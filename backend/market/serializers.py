from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    """
    Serializer for marketplace products.
    """
    seller_name = serializers.CharField(source='seller.username', read_only=True)
    seller_details = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    contact_phone = serializers.SerializerMethodField()
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    condition_display = serializers.CharField(source='get_condition_display', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'seller',
            'seller_name',
            'seller_details',
            'title',
            'price',
            'category',
            'category_display',
            'condition',
            'condition_display',
            'image',
            'image_url',
            'description',
            'whatsapp_number',
            'contact_phone',
            'is_sold',
            'created_at',
        ]
        read_only_fields = ['seller', 'created_at']

    def get_seller_details(self, obj):
        """Return nested seller details with avatar"""
        if not obj.seller:
            return None

        return {
            'id': obj.seller.id,
            'username': obj.seller.username,
            'email': obj.seller.email,
            'full_name': f"{obj.seller.first_name} {obj.seller.last_name}" if obj.seller.first_name and obj.seller.last_name else obj.seller.username,
            'avatar': obj.seller.profile.profile_picture.url if hasattr(obj.seller, 'profile') and obj.seller.profile.profile_picture else None,
        }

    def get_image_url(self, obj):
        """Return full URL for the image"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def get_contact_phone(self, obj):
        """Return specific whatsapp number or fallback to user profile number"""
        if obj.whatsapp_number:
            return obj.whatsapp_number
        # Fallback to seller's registered phone number
        if obj.seller and obj.seller.phone_number:
            return obj.seller.phone_number
        return None

    def create(self, validated_data):
        """Set seller to current user"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['seller'] = request.user
        return super().create(validated_data)
