'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Product } from '@/types';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingBag, Plus, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';

const CATEGORIES = [
    { value: 'all', label: 'All Items' },
    { value: 'Electronics', label: 'Electronics' },
    { value: 'Hostel Essentials', label: 'Hostel Essentials' },
    { value: 'Books', label: 'Books' },
    { value: 'Fashion', label: 'Fashion' },
    { value: 'Other', label: 'Other' },
];

const CONDITIONS = [
    { value: 'New', label: 'New' },
    { value: 'Used - Like New', label: 'Used - Like New' },
    { value: 'Used - Good', label: 'Used - Good' },
];

export default function MarketPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [viewMode, setViewMode] = useState<'public' | 'my_listings'>('public');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        category: 'Other',
        condition: 'Used - Good',
        description: '',
        whatsapp_number: '',
        image: null as File | null,
    });

    useEffect(() => {
        fetchProducts();
    }, [selectedCategory, viewMode]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params: any = {};

            if (viewMode === 'my_listings') {
                params.mode = 'my_listings';
            } else {
                params.available = 'true';
            }

            if (selectedCategory !== 'all') {
                params.category = selectedCategory;
            }
            const { data } = await api.get<Product[]>('/market/products/', { params });
            setProducts(data);
        } catch (err) {
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isAuthenticated) {
            toast.error('Please login to sell items');
            return;
        }

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('condition', formData.condition);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('whatsapp_number', formData.whatsapp_number);
            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }

            await api.post('/market/products/', formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            toast.success('Product listed successfully!');
            setDialogOpen(false);
            setFormData({
                title: '',
                price: '',
                category: 'Other',
                condition: 'Used - Good',
                description: '',
                whatsapp_number: '',
                image: null,
            });
            fetchProducts();
        } catch (err: any) {
            console.error('Error creating product:', err);
            toast.error('Failed to list product');
        }
    };

    const handleSellItemClick = () => {
        if (!isAuthenticated) {
            toast.error('Please login to sell items');
            router.push('/auth/login?next=/market');
            return;
        }
        setDialogOpen(true);
    };

    const handleWhatsAppContact = (product: Product) => {
        if (!isAuthenticated) {
            toast.error('Please login to contact sellers');
            router.push('/auth/login?next=/market');
            return;
        }
        const message = `Hi! I'm interested in your ${product.title} listed on DASA Mart for GHS ${product.price}`;
        const url = `https://wa.me/${product.whatsapp_number}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="container mx-auto py-8 px-4">
            {/* Header */}
            <PageHeader
                title="DASA Mart"
                description="Buy and sell items with fellow students"
            />

            <div className="flex justify-end mb-8">
                {/* Sell Button */}
                <Button size="lg" onClick={handleSellItemClick} className="cursor-pointer">
                    <Plus className="h-5 w-5 mr-2" />
                    Sell an Item
                </Button>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>List an Item for Sale</DialogTitle>
                        <DialogDescription>
                            Fill in the details below to list your item on DASA Mart
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price (GHS) *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="whatsapp">WhatsApp Number *</Label>
                                <Input
                                    id="whatsapp"
                                    value={formData.whatsapp_number}
                                    onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                                    placeholder="0501234567"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category *</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.filter(c => c.value !== 'all').map((cat) => (
                                            <SelectItem key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="condition">Condition *</Label>
                                <Select
                                    value={formData.condition}
                                    onValueChange={(value: any) => setFormData({ ...formData, condition: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CONDITIONS.map((cond) => (
                                            <SelectItem key={cond.value} value={cond.value}>
                                                {cond.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="image">Product Image *</Label>
                            <Input
                                id="image"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full">
                            List Item
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Category Filters */}
            <div className="mb-8 space-y-4">
                {isAuthenticated && (
                    <div className="flex gap-2">
                        <Button
                            variant={viewMode === 'public' ? 'default' : 'outline'}
                            onClick={() => setViewMode('public')}
                            className="flex-1 sm:flex-none cursor-pointer"
                        >
                            All Items
                        </Button>
                        <Button
                            variant={viewMode === 'my_listings' ? 'default' : 'outline'}
                            onClick={() => setViewMode('my_listings')}
                            className="flex-1 sm:flex-none cursor-pointer"
                        >
                            My Listings
                        </Button>
                    </div>
                )}

                <div className="flex gap-2 overflow-x-auto pb-2">
                    {CATEGORIES.map((cat) => (
                        <Button
                            key={cat.value}
                            variant={selectedCategory === cat.value ? 'default' : 'outline'}
                            onClick={() => setSelectedCategory(cat.value)}
                            className="whitespace-nowrap cursor-pointer border"
                        >
                            {cat.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Products Grid */}
            {
                loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading products...</p>
                    </div>
                ) : products.length === 0 ? (
                    <Card className="p-12 text-center">
                        <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">No items found</h3>
                        <p className="text-muted-foreground mb-4">
                            Be the first to list an item in this category!
                        </p>
                        <Button onClick={handleSellItemClick} className="cursor-pointer">
                            <Plus className="h-4 w-4 mr-2" />
                            Sell an Item
                        </Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow relative group">
                                {/* Full Card Link Overlay - Increased Z-Index */}
                                <div
                                    className="absolute inset-0 z-10 cursor-pointer"
                                    onClick={() => router.push(`/market/${product.id}`)}
                                >
                                    <span className="sr-only">View {product.title}</span>
                                </div>

                                <CardHeader className="p-0 relative z-0">
                                    <div className="relative aspect-square">
                                        {product.image_url ? (
                                            <img
                                                src={product.image_url}
                                                alt={product.title}
                                                className={cn(
                                                    "w-full h-full object-cover transition-all",
                                                    product.is_sold && "grayscale opacity-60"
                                                )}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-muted flex items-center justify-center">
                                                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                                            </div>
                                        )}
                                        {product.is_sold && (
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className="bg-black/50 text-white text-xl font-bold px-4 py-2 border-2 border-white transform -rotate-12">
                                                    SOLD
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 relative z-0">
                                    <CardTitle className="text-lg mb-2 line-clamp-1">{product.title}</CardTitle>
                                    <p className="text-2xl font-bold text-primary mb-2">GHS {product.price}</p>
                                    <div className="flex gap-2 mb-2">
                                        <Badge variant="secondary">{product.category_display}</Badge>
                                        <Badge variant="outline">{product.condition_display}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {product.description}
                                    </p>
                                </CardContent>
                                <CardFooter className="p-4 pt-0 relative z-20">
                                    <Button
                                        className="w-full cursor-pointer hover:scale-105 transition-transform"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent card click
                                            handleWhatsAppContact(product);
                                        }}
                                    >
                                        <MessageCircle className="h-4 w-4 mr-2" />
                                        Chat Seller
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )
            }
        </div >
    );
}
