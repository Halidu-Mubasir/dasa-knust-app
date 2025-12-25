'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

import { LostItem } from '@/types';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Phone, AlertTriangle, CheckCircle2, User, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { format } from 'date-fns';
import { getProxiedImageUrl } from '@/lib/imageProxy';

const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
        return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
        return 'Invalid Date';
    }
};

const CATEGORIES = [
    { value: 'Student ID', label: 'Student ID' },
    { value: 'Keys', label: 'Keys' },
    { value: 'Wallet', label: 'Wallet' },
    { value: 'Gadget', label: 'Gadget' },
    { value: 'Other', label: 'Other' },
];

export default function LostAndFoundPage() {
    const { isAuthenticated } = useAuthStore();
    const [items, setItems] = useState<LostItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('lost');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState<LostItem>({
        type: 'Lost',
        category: 'Other',
        student_name: '',
        description: '',
        contact_info: '',
        image: undefined,
    });

    useEffect(() => {
        fetchItems();
    }, [activeTab]);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const type = (activeTab === 'lost' || activeTab === 'found')
                ? (activeTab === 'lost' ? 'Lost' : 'Found')
                : undefined;
            const mode = activeTab === 'my_posts' ? 'my_posts' : undefined;

            // Only filter by unresolved if NOT in "My Posts" mode
            const unresolved = activeTab === 'my_posts' ? undefined : 'true';

            const { data } = await api.get('/lost-found/items/', {
                params: { type, mode, unresolved },
            });
            setItems(Array.isArray(data) ? data : (data.results || []));
        } catch (err) {
            console.error('Error fetching items:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isAuthenticated) {
            toast.error('Please login to post items');
            return;
        }

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('type', formData.type);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('contact_info', formData.contact_info);

            if (formData.student_name) {
                formDataToSend.append('student_name', formData.student_name);
            }

            if (formData.image && formData.image instanceof File) {
                formDataToSend.append('image', formData.image);
            }

            await api.post('/lost-found/items/', formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            toast.success('Item posted successfully!', {
                description: 'An announcement has been created automatically.',
            });

            setDialogOpen(false);
            setFormData({
                type: 'Lost',
                category: 'Other',
                student_name: '',
                description: '',
                contact_info: '',
                image: undefined,
            });
            fetchItems();
        } catch (err: any) {
            console.error('Error posting item:', err);
            toast.error('Failed to post item');
        }
    };

    const handleContact = (item: LostItem) => {
        const message = `Hi! I saw your ${item.type_display} item post on DASA Lost & Found`;
        const url = `https://wa.me/${item.contact_info}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    // State for Edit/Delete
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<LostItem | null>(null);
    const [itemToDelete, setItemToDelete] = useState<LostItem | null>(null);

    // Edit Form State
    const [editForm, setEditForm] = useState({
        description: '',
        is_resolved: false,
    });

    const handleEditClick = (e: React.MouseEvent, item: LostItem) => {
        e.preventDefault();
        e.stopPropagation();
        setItemToEdit(item);
        setEditForm({
            description: item.description,
            is_resolved: item.is_resolved ?? false,
        });
        setEditDialogOpen(true);
    };

    const handleDeleteClick = (e: React.MouseEvent, item: LostItem) => {
        e.preventDefault();
        e.stopPropagation();
        setItemToDelete(item);
        setDeleteDialogOpen(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!itemToEdit) return;

        try {
            await api.patch(`/lost-found/items/${itemToEdit.id}/`, editForm);
            toast.success('Post updated');
            setEditDialogOpen(false);
            fetchItems();
        } catch (err) {
            console.error(err);
            toast.error('Failed to update post');
        }
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await api.delete(`/lost-found/items/${itemToDelete.id}/`);
            toast.success('Post deleted');
            setDeleteDialogOpen(false);
            fetchItems();
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete post');
        }
    };

    return (
        <div className="container mx-auto py-8 px-4">
            {/* Header */}
            <PageHeader
                title="Lost & Found"
                description="Help reunite lost items with their owners"
            />

            {/* Post Button */}
            <div className="flex justify-end mb-8">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="lg" className="cursor-pointer">
                            <Plus className="h-5 w-5 mr-2" />
                            Post Item
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Post a Lost or Found Item</DialogTitle>
                            <DialogDescription>
                                Fill in the details to help locate or return items
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="type">Type *</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Lost">I Lost Something</SelectItem>
                                        <SelectItem value="Found">I Found Something</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

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
                                        {CATEGORIES.map((cat) => (
                                            <SelectItem key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Student Name field - only for Student ID category */}
                            {formData.category === 'Student ID' && (
                                <div className="space-y-2">
                                    <Label htmlFor="student_name">Student Name (on ID)</Label>
                                    <Input
                                        id="student_name"
                                        value={formData.student_name}
                                        onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                                        placeholder="Name as it appears on the ID"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        This helps identify the owner quickly
                                    </p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="description">Description *</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                    placeholder={
                                        formData.type === 'Lost'
                                            ? 'Where did you lose it? When? Any identifying features?'
                                            : 'Where did you find it? When? Any identifying features?'
                                    }
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="contact">Contact Info (Phone/WhatsApp) *</Label>
                                <Input
                                    id="contact"
                                    value={formData.contact_info}
                                    onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                                    placeholder="0501234567"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="image">Image (Optional but helpful)</Label>
                                <Input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] })}
                                />
                            </div>

                            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                                <p className="text-sm text-foreground">
                                    <strong>Note:</strong> An automatic announcement will be created to help spread the word quickly!
                                </p>
                            </div>

                            <Button type="submit" className="w-full cursor-pointer">
                                Post Item
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Dialog */}
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Post</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <div className="flex items-center gap-2 border p-3 rounded-md">
                                    <input
                                        type="checkbox"
                                        id="is_resolved"
                                        checked={editForm.is_resolved}
                                        onChange={(e) => setEditForm({ ...editForm, is_resolved: e.target.checked })}
                                        className="h-4 w-4"
                                    />
                                    <Label htmlFor="is_resolved" className="cursor-pointer">Mark as Resolved (Found/Returned)</Label>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    rows={4}
                                />
                            </div>
                            <Button type="submit" className="w-full">Update</Button>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Post</DialogTitle>
                            <DialogDescription>Are you sure? This cannot be undone.</DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end gap-3 mt-4">
                            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
                <TabsList className="flex w-full max-w-md bg-muted p-1 rounded-lg">
                    <TabsTrigger
                        value="lost"
                        className="flex-1 cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Lost Items
                    </TabsTrigger>
                    <TabsTrigger
                        value="found"
                        className="flex-1 cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Found Items
                    </TabsTrigger>
                    {isAuthenticated && (
                        <TabsTrigger
                            value="my_posts"
                            className="flex-1 cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                            <User className="h-4 w-4 mr-2" />
                            My Posts
                        </TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value={activeTab} className="mt-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Loading items...</p>
                        </div>
                    ) : items.length === 0 ? (
                        <Card className="p-12 text-center bg-card">
                            <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-lg font-semibold mb-2 text-foreground">No items yet</h3>
                            <p className="text-muted-foreground mb-4">
                                Be the first to post a {activeTab} item
                            </p>
                            <Button onClick={() => setDialogOpen(true)} className="cursor-pointer">
                                <Plus className="h-4 w-4 mr-2" />
                                Post Item
                            </Button>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {items.map((item) => (
                                <Link href={`/lost-and-found/${item.id}`} key={item.id} className="block group">
                                    <Card className="overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all bg-card h-full flex flex-col relative">
                                        {/* Resolved Overlay */}
                                        {item.is_resolved && (
                                            <div className="absolute inset-0 z-20 bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
                                                <Badge variant="outline" className="text-lg font-bold border-green-500 text-green-700 bg-green-50 px-4 py-2 rotate-[-12deg] shadow-sm">
                                                    RESOLVED
                                                </Badge>
                                            </div>
                                        )}
                                        {item.image_url && (
                                            <div className="relative aspect-video bg-muted group-hover:brightness-[0.95] transition-all">
                                                <img
                                                    src={getProxiedImageUrl(item.image_url) || ''}
                                                    alt={item.category_display || ''}
                                                    className="absolute inset-0 w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <CardHeader>
                                            <div className="flex items-start justify-between gap-2">
                                                <CardTitle className="text-lg text-foreground group-hover:text-primary transition-colors">
                                                    {item.category_display}
                                                    {item.student_name && ` - ${item.student_name}`}
                                                </CardTitle>
                                                <Badge variant={item.type === 'Lost' ? 'destructive' : 'default'}>
                                                    {item.type_display}
                                                </Badge>
                                            </div>
                                            <CardDescription className="text-xs">
                                                Posted {formatDate(item.created_at || '')} by {item.reporter_name}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-grow">
                                            <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                                                {item.description}
                                            </p>

                                            {/* My Posts Controls */}
                                            {activeTab === 'my_posts' && (
                                                <div className="flex gap-2 mt-4 pt-4 border-t z-30 relative">
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        className="flex-1"
                                                        onClick={(e) => handleEditClick(e, item)}
                                                    >
                                                        <Pencil className="w-3 h-3 mr-1" /> Edit
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="flex-1"
                                                        onClick={(e) => handleDeleteClick(e, item)}
                                                    >
                                                        <Trash2 className="w-3 h-3 mr-1" /> Delete
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div >
    );
}
