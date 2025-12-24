'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Product } from '@/types';
import api from '@/lib/axios';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { MessageCircle, ShoppingBag, User, Loader2, ZoomIn, Phone } from 'lucide-react';
import { Trash2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
    // ...
} from "@/components/ui/alert-dialog"

// Helper to format phone numbers for WhatsApp API (International format)
const formatPhoneNumber = (phone: string): string => {
    let clean = phone.replace(/\D/g, ''); // Remove non-numeric
    if (clean.startsWith('0')) {
        clean = '233' + clean.substring(1); // Convert 02x to 2332x
    }
    return clean;
};



export default function MarketProductPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (params.id) {
            fetchProduct(params.id as string);
        }
    }, [params.id]);

    const fetchProduct = async (id: string) => {
        try {
            setLoading(true);
            const { data } = await api.get<Product>(`/market/products/${id}/`);
            setProduct(data);
        } catch (err: any) {
            console.error('Error fetching product:', err);
            setError(err.response?.data?.detail || 'Failed to load product details');
            toast.error('Failed to load product');
        } finally {
            setLoading(false);
        }
    };

    const isOwner = isAuthenticated && product?.seller === user?.id;

    const handleToggleStatus = async () => {
        if (!product) return;
        try {
            const newStatus = !product.is_sold;
            await api.patch(`/market/products/${product.id}/`, { is_sold: newStatus });
            setProduct({ ...product, is_sold: newStatus });
            toast.success(newStatus ? 'Marked as Sold' : 'Marked as Available');
        } catch (err) {
            console.error('Error updating status:', err);
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async () => {
        if (!product) return;
        try {
            await api.delete(`/market/products/${product.id}/`);
            toast.success('Listing deleted');
            router.push('/market');
        } catch (err) {
            console.error('Error deleting product:', err);
            toast.error('Failed to delete listing');
        }
    };



    if (loading) {
        return (
            <div className="min-h-screen py-16 flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen py-16 bg-background">
                <div className="container mx-auto px-4">
                    <PageHeader title="Product Not Found" />
                    <div className="text-center py-12">
                        <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h2 className="text-2xl font-bold mb-2">Item Unavailable</h2>
                        <p className="text-muted-foreground mb-4">{error || "This item may have been removed or sold."}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 bg-background">
            <div className="container mx-auto px-4">
                <PageHeader title="Product Details" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    {/* Visuals Column */}
                    <div className="space-y-4">
                        <Dialog>
                            <DialogTrigger asChild>
                                <div className="group relative aspect-square bg-muted rounded-xl overflow-hidden cursor-zoom-in border shadow-sm">
                                    {product.image_url ? (
                                        <>
                                            {/* Layer 1: Background Ambience */}
                                            <img
                                                src={product.image_url}
                                                alt={product.title}
                                                className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-60 brightness-75"
                                            />
                                            {/* Layer 2: Sharp Subject */}
                                            <img
                                                src={product.image_url}
                                                alt={product.title}
                                                className="absolute inset-0 w-full h-full object-scale-down z-10 drop-shadow-md transition-transform duration-500 group-hover:scale-105"
                                            />
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ShoppingBag className="h-20 w-20 text-muted-foreground opacity-30" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <div className="bg-background/80 p-2 rounded-full backdrop-blur-sm">
                                            <ZoomIn className="w-6 h-6 text-foreground" />
                                        </div>
                                    </div>
                                </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-transparent border-none shadow-none">
                                <div className="relative w-full aspect-square md:aspect-video bg-black/90 rounded-lg overflow-hidden flex items-center justify-center">
                                    {product.image_url && (
                                        <img
                                            src={product.image_url}
                                            alt={product.title}
                                            className="w-full h-full object-contain"
                                        />
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Info Column */}
                    <div className="flex flex-col">
                        <div className="mb-6">
                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-foreground">
                                {product.title}
                            </h1>
                            <p className="text-3xl font-bold text-primary">
                                GHS {product.price}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3 mb-8">
                            <Badge variant="secondary" className="text-sm px-3 py-1">
                                {product.category_display}
                            </Badge>
                            <Badge variant="outline" className="text-sm px-3 py-1 border-primary/20 bg-primary/5 text-primary">
                                {product.condition_display}
                            </Badge>
                            {product.is_sold && (
                                <Badge variant="destructive" className="text-sm px-3 py-1">
                                    Sold
                                </Badge>
                            )}
                        </div>

                        {/* Seller Controls */}
                        {isOwner && (
                            <Card className="mb-6 border-2 border-primary/20 bg-primary/5">
                                <CardContent className="p-4">
                                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Seller Controls
                                    </h3>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <Button
                                            variant={product.is_sold ? "outline" : "default"}
                                            className="flex-1"
                                            onClick={handleToggleStatus}
                                        >
                                            <RotateCcw className="w-4 h-4 mr-2" />
                                            {product.is_sold ? 'Mark as Available' : 'Mark as Sold'}
                                        </Button>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" className="flex-1">
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete Listing
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete your listing from the marketplace.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Seller Card */}
                        <div className="p-4 flex items-center gap-4">
                            <div className="bg-primary/20 p-3 rounded-full">
                                <User className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground font-medium">Sold by</p>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-lg">{product.seller_name}</span>
                                    <Badge variant="secondary" className="text-[10px] h-5 bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-200">
                                        Verified Student
                                    </Badge>
                                </div>
                                {(product.contact_phone || product.whatsapp_number) && (
                                    <div className="flex items-center gap-2 text-muted-foreground select-all">
                                        <Phone className="w-4 h-4" />
                                        <span className="font-mono text-sm font-medium">{product.contact_phone || product.whatsapp_number}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="prose prose-sm dark:prose-invert max-w-none mb-8 flex-grow">
                            <h3 className="text-lg font-semibold mb-2">Description</h3>
                            <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        {/* Action - Sticky on mobile effectively via placement, but strict sticky is okay too */}
                        {/* Action Buttons */}
                        <div className="mt-auto pt-6 border-t flex flex-col gap-3">
                            <div className="flex gap-3">
                                {/* WhatsApp Button (Primary) */}
                                <Button
                                    size="lg"
                                    className="flex-1 h-14 text-lg font-bold bg-green-600 hover:bg-green-700 text-white shadow-md transition-all"
                                    asChild
                                    disabled={product.is_sold}
                                >
                                    {product.is_sold ? (
                                        <span><MessageCircle className="w-5 h-5 mr-2" /> Item Sold</span>
                                    ) : (
                                        <a
                                            href={`https://wa.me/${formatPhoneNumber(product.contact_phone || product.whatsapp_number || '')}?text=${encodeURIComponent(`Hi, I saw your listing for "${product.title}" on DASA Mart. Is it still available?`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <MessageCircle className="w-5 h-5 mr-2" />
                                            WhatsApp
                                        </a>
                                    )}
                                </Button>

                                {/* Call Button (Secondary) */}
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="h-14 px-6 border-2 text-lg font-semibold"
                                    asChild
                                >
                                    <a href={`tel:${product.contact_phone || product.whatsapp_number}`}>
                                        <Phone className="w-5 h-5 mr-2" />
                                        Call
                                    </a>
                                </Button>
                            </div>

                            <p className="text-xs text-center text-muted-foreground">
                                Always meet in a safe, public place on campus.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
