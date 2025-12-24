'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LostItem } from '@/types';
import api from '@/lib/axios';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
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
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    MessageCircle,
    User,
    Loader2,
    ZoomIn,
    Phone,
    MapPin,
    Calendar,
    AlertTriangle,
    ShieldCheck,
    CheckCircle2,
    Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';

// Helper for phone format
const formatPhoneNumber = (phone: string): string => {
    let clean = phone.replace(/\D/g, '');
    if (clean.startsWith('0')) {
        clean = '233' + clean.substring(1);
    }
    return clean;
};

export default function LostFoundDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [item, setItem] = useState<LostItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (params.id) {
            fetchItem(params.id as string);
        }
    }, [params.id]);

    const fetchItem = async (id: string) => {
        try {
            setLoading(true);
            const { data } = await api.get<LostItem>(`/lost-found/items/${id}/`);
            setItem(data);
        } catch (err: any) {
            console.error('Error fetching item:', err);
            setError(err.response?.data?.detail || 'Failed to load item details');
            toast.error('Failed to load item');
        } finally {
            setLoading(false);
        }
    };

    const isOwner = isAuthenticated && item?.reporter === user?.id; // Assuming user.id exists, need to check type
    // Actually LostItem.reporter is usually ID. 
    // Wait, in serializer `reporter` is usually valid.
    // Let's assume standard checks.

    const handleResolve = async () => {
        if (!item) return;
        try {
            const newStatus = !item.is_resolved;
            await api.patch(`/lost-found/items/${item.id}/`, { is_resolved: newStatus });
            setItem({ ...item, is_resolved: newStatus });
            toast.success(newStatus ? 'Marked as Resolved' : 'Marked as Unresolved');
        } catch (err) {
            console.error('Error updating status:', err);
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async () => {
        if (!item) return;
        try {
            await api.delete(`/lost-found/items/${item.id}/`);
            toast.success('Post deleted');
            router.push('/lost-and-found');
        } catch (err) {
            console.error('Error deleting item:', err);
            toast.error('Failed to delete post');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen py-16 flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="min-h-screen py-16 bg-background">
                <div className="container mx-auto px-4">
                    <PageHeader title="Item Not Found" />
                    <div className="text-center py-12">
                        <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h2 className="text-2xl font-bold mb-2">Item Unavailable</h2>
                        <p className="text-muted-foreground mb-4">{error || "This post may have been deleted."}</p>
                        <Button onClick={() => router.push('/lost-and-found')}>Back to List</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 bg-background">
            <div className="container mx-auto px-4">
                <PageHeader title="Item Details" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    {/* Visuals Column */}
                    <div className="space-y-4">
                        <div className="group relative aspect-square bg-muted rounded-xl overflow-hidden border shadow-sm flex items-center justify-center">
                            {item.image_url ? (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <div className="w-full h-full cursor-zoom-in relative">
                                            {/* Layer 1: Background Ambience */}
                                            <img
                                                src={item.image_url}
                                                alt={item.category_display}
                                                className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-60 brightness-75"
                                            />
                                            {/* Layer 2: Main Image */}
                                            <img
                                                src={item.image_url}
                                                alt={item.category_display}
                                                className="absolute inset-0 w-full h-full object-scale-down z-10 drop-shadow-md transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 z-20">
                                                <div className="bg-background/80 p-2 rounded-full backdrop-blur-sm">
                                                    <ZoomIn className="w-6 h-6 text-foreground" />
                                                </div>
                                            </div>
                                        </div>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-transparent border-none shadow-none">
                                        <div className="relative w-full aspect-square md:aspect-video bg-black/90 rounded-lg overflow-hidden flex items-center justify-center">
                                            <img
                                                src={item.image_url}
                                                alt={item.category_display}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            ) : (
                                <div className="text-center p-6">
                                    <AlertTriangle className="h-20 w-20 text-muted-foreground opacity-30 mx-auto mb-2" />
                                    <p className="text-muted-foreground text-sm">No image provided</p>
                                </div>
                            )}
                        </div>

                        {/* Safety Box for Found Items */}
                        {item.type === 'Found' && !item.is_resolved && (
                            <Alert className="bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400">
                                <ShieldCheck className="h-4 w-4" />
                                <AlertTitle>Safety Tip</AlertTitle>
                                <AlertDescription>
                                    If this is a valuable item, please verify the owner's identity carefully.
                                    We recommend handing it over to the DASA Office or Hall Porter's Lodge for safekeeping.
                                </AlertDescription>
                            </Alert>
                        )}

                        {item.is_resolved && (
                            <Alert className="bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400">
                                <CheckCircle2 className="h-4 w-4" />
                                <AlertTitle>Resolved</AlertTitle>
                                <AlertDescription>
                                    This item has been returned or found.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    {/* Info Column */}
                    <div className="flex flex-col">
                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-2">
                                <Badge variant={item.type === 'Lost' ? 'destructive' : 'default'} className="md:text-lg px-4 py-1">
                                    {item.type_display}
                                </Badge>
                                <Badge variant="outline" className="text-sm">
                                    {item.category_display}
                                </Badge>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2 text-foreground">
                                {item.category_display} {item.student_name ? `- ${item.student_name}` : ''}
                            </h1>
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <Calendar className="w-4 h-4" />
                                <span>Posted on {new Date(item.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                            </div>
                        </div>

                        {/* Owner Controls */}
                        {(isOwner || user?.is_staff) && (
                            <Card className="mb-6 border-2 border-primary/20 bg-primary/5">
                                <CardContent className="p-4">
                                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Your Post Controls
                                    </h3>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <Button
                                            variant={item.is_resolved ? "outline" : "default"}
                                            className="flex-1"
                                            onClick={handleResolve}
                                        >
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                            {item.is_resolved ? 'Mark as Unresolved' : 'Mark as Resolved'}
                                        </Button>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" className="flex-1">
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete Post
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone.
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

                        <div className="prose prose-sm dark:prose-invert max-w-none mb-8 flex-grow">
                            <h3 className="text-lg font-semibold mb-2">Description</h3>
                            <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                                {item.description}
                            </p>
                        </div>

                        {/* Contact Card */}
                        <Card className="mb-8 bg-muted/30 border-none shadow-sm">
                            <div className="p-4 flex items-center gap-4">
                                <div className="bg-primary/20 p-3 rounded-full">
                                    <User className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground font-medium">Repoted by</p>
                                    <p className="font-bold text-lg mb-1">{item.reporter_name}</p>
                                    {item.contact_info && (
                                        <div className="flex items-center gap-2 text-muted-foreground select-all">
                                            <Phone className="w-4 h-4" />
                                            <span className="font-mono text-sm font-medium">{item.contact_info}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* Action Buttons */}
                        <div className="mt-auto pt-6 border-t flex flex-col gap-3">
                            <div className="flex gap-3">
                                <Button
                                    size="lg"
                                    className="flex-1 h-14 text-lg font-bold bg-green-600 hover:bg-green-700 text-white shadow-md transition-all"
                                    asChild
                                >
                                    <a
                                        href={`https://wa.me/${formatPhoneNumber(item.contact_info)}?text=${encodeURIComponent(`Hi, I saw your ${item.type} post regarding "${item.category_display}" on DASA. `)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <MessageCircle className="w-5 h-5 mr-2" />
                                        WhatsApp
                                    </a>
                                </Button>

                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="h-14 px-6 border-2 text-lg font-semibold"
                                    asChild
                                >
                                    <a href={`tel:${item.contact_info}`}>
                                        <Phone className="w-5 h-5 mr-2" />
                                        Call
                                    </a>
                                </Button>
                            </div>

                            <p className="text-xs text-center text-muted-foreground">
                                DASA is not responsible for lost items. Please handle exchanges safely.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
