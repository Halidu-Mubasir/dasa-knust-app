'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { Plus, Edit, Trash2, Loader2, Scale, FileText } from 'lucide-react';

interface Chapter {
    id: number;
    number: number;
    title: string;
    articles: Article[];
}

interface Article {
    id: number;
    chapter: number;
    article_number: string;
    title: string;
    content: string;
}

export default function AdminLegalPage() {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Chapter Dialog State
    const [chapterDialogOpen, setChapterDialogOpen] = useState(false);
    const [isChapterSubmitting, setIsChapterSubmitting] = useState(false);
    const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
    const [chapterForm, setChapterForm] = useState({
        number: '',
        title: '',
    });

    // Article Sheet State
    const [articleSheetOpen, setArticleSheetOpen] = useState(false);
    const [isArticleSubmitting, setIsArticleSubmitting] = useState(false);
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);
    const [articleForm, setArticleForm] = useState({
        article_number: '',
        title: '',
        content: '',
        chapter: 0,
    });

    // Delete State
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteArticleDialogOpen, setDeleteArticleDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Chapter | Article | null>(null);

    // Fetch Chapters
    const fetchChapters = async () => {
        try {
            const res = await api.get('/constitution/chapters/');
            const data = res.data.results || res.data || [];
            setChapters(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load chapters');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchChapters();
    }, []);

    // Chapter Handlers
    const handleAddChapter = () => {
        setEditingChapter(null);
        setChapterForm({ number: '', title: '' });
        setChapterDialogOpen(true);
    };

    const handleEditChapter = (chapter: Chapter) => {
        setEditingChapter(chapter);
        setChapterForm({
            number: chapter.number.toString(),
            title: chapter.title,
        });
        setChapterDialogOpen(true);
    };

    const handleSubmitChapter = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!chapterForm.number || !chapterForm.title) {
            toast.error('Please fill all required fields');
            return;
        }

        setIsChapterSubmitting(true);

        const payload = {
            number: parseInt(chapterForm.number),
            title: chapterForm.title,
        };

        try {
            if (editingChapter) {
                await api.patch(`/constitution/chapters/${editingChapter.id}/`, payload);
                toast.success('Chapter updated successfully');
            } else {
                await api.post('/constitution/chapters/', payload);
                toast.success('Chapter created successfully');
            }
            setChapterDialogOpen(false);
            fetchChapters();
            // Update selected chapter if it was edited
            if (editingChapter && selectedChapter?.id === editingChapter.id) {
                const res = await api.get(`/constitution/chapters/${editingChapter.id}/`);
                setSelectedChapter(res.data);
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.detail || 'Failed to save chapter');
        } finally {
            setIsChapterSubmitting(false);
        }
    };

    const handleDeleteChapter = (chapter: Chapter) => {
        setItemToDelete(chapter);
        setDeleteDialogOpen(true);
    };

    const confirmDeleteChapter = async () => {
        if (!itemToDelete) return;

        try {
            await api.delete(`/constitution/chapters/${itemToDelete.id}/`);
            toast.success('Chapter deleted successfully');
            fetchChapters();
            if (selectedChapter?.id === itemToDelete.id) {
                setSelectedChapter(null);
            }
        } catch (error) {
            toast.error('Failed to delete chapter');
        } finally {
            setDeleteDialogOpen(false);
            setItemToDelete(null);
        }
    };

    // Article Handlers
    const handleAddArticle = () => {
        if (!selectedChapter) {
            toast.error('Please select a chapter first');
            return;
        }
        setEditingArticle(null);
        setArticleForm({
            article_number: '',
            title: '',
            content: '',
            chapter: selectedChapter.id,
        });
        setArticleSheetOpen(true);
    };

    const handleEditArticle = (article: Article) => {
        setEditingArticle(article);
        setArticleForm({
            article_number: article.article_number,
            title: article.title,
            content: article.content,
            chapter: article.chapter,
        });
        setArticleSheetOpen(true);
    };

    const handleSubmitArticle = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!articleForm.article_number || !articleForm.title || !articleForm.content) {
            toast.error('Please fill all required fields');
            return;
        }

        setIsArticleSubmitting(true);

        const payload = {
            article_number: articleForm.article_number,
            title: articleForm.title,
            content: articleForm.content,
            chapter: articleForm.chapter,
        };

        try {
            if (editingArticle) {
                await api.patch(`/constitution/articles/${editingArticle.id}/`, payload);
                toast.success('Article updated successfully');
            } else {
                await api.post('/constitution/articles/', payload);
                toast.success('Article created successfully');
            }
            setArticleSheetOpen(false);
            // Refresh the selected chapter to show updated articles
            if (selectedChapter) {
                const res = await api.get(`/constitution/chapters/${selectedChapter.id}/`);
                setSelectedChapter(res.data);
                // Also refresh the full chapters list
                fetchChapters();
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.detail || 'Failed to save article');
        } finally {
            setIsArticleSubmitting(false);
        }
    };

    const handleDeleteArticle = (article: Article) => {
        setItemToDelete(article);
        setDeleteArticleDialogOpen(true);
    };

    const confirmDeleteArticle = async () => {
        if (!itemToDelete) return;

        try {
            await api.delete(`/constitution/articles/${itemToDelete.id}/`);
            toast.success('Article deleted successfully');
            // Refresh the selected chapter
            if (selectedChapter) {
                const res = await api.get(`/constitution/chapters/${selectedChapter.id}/`);
                setSelectedChapter(res.data);
                fetchChapters();
            }
        } catch (error) {
            toast.error('Failed to delete article');
        } finally {
            setDeleteArticleDialogOpen(false);
            setItemToDelete(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight flex items-center">
                        <Scale className="mr-3 h-8 w-8" />
                        Constitution Manager
                    </h2>
                    <p className="text-muted-foreground">
                        Manage chapters and articles of the DASA constitution
                    </p>
                </div>

                <Separator />

                {/* Master-Detail Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column: Chapters */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-semibold">Chapters</h3>
                            <Button onClick={handleAddChapter} size="sm" className="cursor-pointer">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Chapter
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {chapters.length === 0 ? (
                                <Card>
                                    <CardContent className="py-6 text-center text-muted-foreground">
                                        No chapters yet. Add your first chapter to get started.
                                    </CardContent>
                                </Card>
                            ) : (
                                chapters.map((chapter) => (
                                    <Card
                                        key={chapter.id}
                                        className={`cursor-pointer transition-all hover:shadow-md ${
                                            selectedChapter?.id === chapter.id
                                                ? 'ring-2 ring-primary'
                                                : ''
                                        }`}
                                        onClick={() => setSelectedChapter(chapter)}
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle className="text-base">
                                                        Chapter {chapter.number}
                                                    </CardTitle>
                                                    <CardDescription className="mt-1">
                                                        {chapter.title}
                                                    </CardDescription>
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        {chapter.articles.length} article(s)
                                                    </p>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditChapter(chapter);
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteChapter(chapter);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Column: Articles */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-semibold">
                                {selectedChapter
                                    ? `Chapter ${selectedChapter.number}: ${selectedChapter.title}`
                                    : 'Select a Chapter'}
                            </h3>
                            {selectedChapter && (
                                <Button onClick={handleAddArticle} size="sm" className="cursor-pointer">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Article
                                </Button>
                            )}
                        </div>

                        {!selectedChapter ? (
                            <Card>
                                <CardContent className="py-12 text-center text-muted-foreground">
                                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>Select a chapter from the left to view and manage its articles</p>
                                </CardContent>
                            </Card>
                        ) : selectedChapter.articles.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center text-muted-foreground">
                                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No articles yet. Add your first article to this chapter.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {selectedChapter.articles.map((article) => (
                                    <Card key={article.id}>
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle className="text-lg">
                                                        Article {article.article_number}
                                                    </CardTitle>
                                                    <CardDescription className="mt-1 font-semibold">
                                                        {article.title}
                                                    </CardDescription>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEditArticle(article)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteArticle(article)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm whitespace-pre-wrap">{article.content}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Chapter Dialog */}
            <Dialog open={chapterDialogOpen} onOpenChange={setChapterDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingChapter ? 'Edit Chapter' : 'Add Chapter'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingChapter
                                ? 'Update the chapter details'
                                : 'Create a new chapter for the constitution'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitChapter} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="chapter-number">Chapter Number *</Label>
                            <Input
                                id="chapter-number"
                                type="number"
                                value={chapterForm.number}
                                onChange={(e) =>
                                    setChapterForm({ ...chapterForm, number: e.target.value })
                                }
                                placeholder="e.g., 1"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="chapter-title">Chapter Title *</Label>
                            <Input
                                id="chapter-title"
                                value={chapterForm.title}
                                onChange={(e) =>
                                    setChapterForm({ ...chapterForm, title: e.target.value })
                                }
                                placeholder="e.g., Membership"
                                required
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setChapterDialogOpen(false)}
                                className="cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isChapterSubmitting} className="cursor-pointer">
                                {isChapterSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {editingChapter ? 'Update' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Article Sheet */}
            <Sheet open={articleSheetOpen} onOpenChange={setArticleSheetOpen}>
                <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>
                            {editingArticle ? 'Edit Article' : 'Add Article'}
                        </SheetTitle>
                        <SheetDescription>
                            {editingArticle
                                ? 'Update the article details'
                                : `Create a new article for Chapter ${selectedChapter?.number}`}
                        </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleSubmitArticle} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="article-number">Article Number *</Label>
                            <Input
                                id="article-number"
                                value={articleForm.article_number}
                                onChange={(e) =>
                                    setArticleForm({ ...articleForm, article_number: e.target.value })
                                }
                                placeholder="e.g., 5.2"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Use format like "5.2" or "3.1.4"
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="article-title">Article Title *</Label>
                            <Input
                                id="article-title"
                                value={articleForm.title}
                                onChange={(e) =>
                                    setArticleForm({ ...articleForm, title: e.target.value })
                                }
                                placeholder="e.g., Voting Rights"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="article-content">Article Content *</Label>
                            <Textarea
                                id="article-content"
                                value={articleForm.content}
                                onChange={(e) =>
                                    setArticleForm({ ...articleForm, content: e.target.value })
                                }
                                placeholder="Enter the full article content..."
                                rows={15}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Content will preserve line breaks and formatting
                            </p>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setArticleSheetOpen(false)}
                                className="flex-1 cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isArticleSubmitting} className="flex-1 cursor-pointer">
                                {isArticleSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {editingArticle ? 'Update Article' : 'Create Article'}
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>

            {/* Delete Chapter Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this chapter? This will also delete all
                            articles within this chapter. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteChapter}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Article Dialog */}
            <AlertDialog open={deleteArticleDialogOpen} onOpenChange={setDeleteArticleDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Article</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this article? This action cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteArticle}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
