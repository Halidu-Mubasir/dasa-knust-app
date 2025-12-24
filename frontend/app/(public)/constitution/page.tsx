'use client';

import { useState, useEffect, useMemo } from 'react';
import { Chapter, Article } from '@/types';
import api from '@/lib/axios';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Search, BookOpen, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ConstitutionPage() {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedChapter, setSelectedChapter] = useState<number | null>(null);

    useEffect(() => {
        fetchConstitution();
    }, []);

    const fetchConstitution = async () => {
        try {
            setLoading(true);
            const { data } = await api.get<Chapter[]>('/constitution/chapters/');
            setChapters(data);
            if (data.length > 0) {
                setSelectedChapter(data[0].id);
            }
        } catch (err) {
            console.error('Error fetching constitution:', err);
        } finally {
            setLoading(false);
        }
    };

    // Filter chapters and articles based on search
    const filteredData = useMemo(() => {
        if (!searchQuery) return chapters;

        const query = searchQuery.toLowerCase();
        return chapters.map(chapter => {
            const matchingArticles = chapter.articles.filter(
                article =>
                    article.title.toLowerCase().includes(query) ||
                    article.content.toLowerCase().includes(query) ||
                    article.article_number.toLowerCase().includes(query)
            );

            const chapterMatches = chapter.title.toLowerCase().includes(query);

            return {
                ...chapter,
                articles: chapterMatches ? chapter.articles : matchingArticles,
                isMatch: chapterMatches || matchingArticles.length > 0,
            };
        }).filter(chapter => chapter.isMatch);
    }, [chapters, searchQuery]);

    const highlightText = (text: string, query: string) => {
        if (!query) return text;

        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return parts.map((part, index) =>
            part.toLowerCase() === query.toLowerCase() ? (
                <mark key={index} className="bg-yellow-200 text-black">
                    {part}
                </mark>
            ) : (
                part
            )
        );
    };

    const currentChapter = chapters.find(ch => ch.id === selectedChapter);

    return (
        <div className="container mx-auto py-8 px-4">
            {/* Header */}
            <div className="mb-8">
                <PageHeader
                    title="DASA Constitution"
                    description="The official constitution governing the Dagomba Student Association"
                />

                {/* Search Bar */}
                <div className="relative max-w-2xl mt-6">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search for 'elections', 'impeachment', 'executive'..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 py-6 text-lg"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading constitution...</p>
                </div>
            ) : (
                <>
                    {/* Mobile View - Accordion */}
                    <div className="lg:hidden">
                        <Accordion type="single" collapsible className="space-y-4">
                            {(filteredData as any[]).map((chapter) => (
                                <AccordionItem
                                    key={chapter.id}
                                    value={`chapter-${chapter.id}`}
                                    className="border rounded-lg px-4"
                                >
                                    <AccordionTrigger className="text-left hover:no-underline">
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                                            <div>
                                                <div className="font-semibold">
                                                    Chapter {chapter.number}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {chapter.title}
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-4 pt-4">
                                            {chapter.articles.map((article: Article) => (
                                                <Card key={article.id} className="p-4">
                                                    <h4 className="font-semibold text-sm mb-2">
                                                        Article {article.article_number}: {highlightText(article.title, searchQuery)}
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground prose prose-sm max-w-none">
                                                        {highlightText(article.content, searchQuery)}
                                                    </p>
                                                </Card>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>

                    {/* Desktop View - Sidebar + Content */}
                    <div className="hidden lg:grid lg:grid-cols-[300px_1fr] gap-8">
                        {/* Left Sidebar - Chapters */}
                        <Card className="p-4 h-fit sticky top-4">
                            <h3 className="font-semibold mb-4">Chapters</h3>
                            <ScrollArea className="h-[600px]">
                                <div className="space-y-2">
                                    {(filteredData as any[]).map((chapter) => (
                                        <button
                                            key={chapter.id}
                                            onClick={() => setSelectedChapter(chapter.id)}
                                            className={cn(
                                                "w-full text-left p-3 rounded-lg transition-colors",
                                                selectedChapter === chapter.id
                                                    ? "bg-primary text-primary-foreground"
                                                    : "hover:bg-accent"
                                            )}
                                        >
                                            <div className="font-medium text-sm">
                                                Chapter {chapter.number}
                                            </div>
                                            <div className="text-xs opacity-90 mt-1">
                                                {chapter.title}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </Card>

                        {/* Right Content - Articles */}
                        <div>
                            {currentChapter && (
                                <>
                                    <div className="mb-6">
                                        <h2 className="text-2xl font-bold mb-2">
                                            Chapter {currentChapter.number}: {currentChapter.title}
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            {currentChapter.article_count} article(s)
                                        </p>
                                    </div>

                                    <ScrollArea className="h-[700px]">
                                        <div className="space-y-6 pr-4">
                                            {currentChapter.articles.map((article) => (
                                                <Card key={article.id} className="p-6">
                                                    <h3 className="text-lg font-semibold mb-3">
                                                        Article {article.article_number}: {highlightText(article.title, searchQuery)}
                                                    </h3>
                                                    <div className="prose prose-sm max-w-none text-muted-foreground">
                                                        <p>{highlightText(article.content, searchQuery)}</p>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Empty State */}
                    {filteredData.length === 0 && (
                        <Card className="p-12 text-center">
                            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">No results found</h3>
                            <p className="text-muted-foreground">
                                No chapters or articles match your search query
                            </p>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}
