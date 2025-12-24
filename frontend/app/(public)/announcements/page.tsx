'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Calendar, AlertCircle } from 'lucide-react';
import api from '@/lib/axios';
import { Announcement } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const { data } = await api.get<Announcement[]>('/announcements/');
            setAnnouncements(data);
        } catch (err) {
            console.error('Error fetching announcements:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-3xl">
            <PageHeader
                title="Announcements"
                description="Stay updated with DASA news and alerts."
            />

            <div className="space-y-6 mt-8">
                {loading ? (
                    // Skeletons
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader className="space-y-2">
                                <div className="h-6 w-2/3 bg-muted rounded"></div>
                                <div className="h-4 w-1/4 bg-muted rounded"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-4 w-full bg-muted rounded mb-2"></div>
                                <div className="h-4 w-3/4 bg-muted rounded"></div>
                            </CardContent>
                        </Card>
                    ))
                ) : announcements.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>No announcements yet.</p>
                    </div>
                ) : (
                    announcements.map((announcement) => (
                        <Card
                            key={announcement.id}
                            className={cn(
                                "transition-all duration-200",
                                announcement.priority === 'High'
                                    ? "border-l-4 border-l-red-500 bg-red-50/10"
                                    : "border-l-4 border-l-transparent"
                            )}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <CardTitle className={cn(
                                                "text-lg",
                                                announcement.priority === 'High' && "text-red-600"
                                            )}>
                                                {announcement.title}
                                            </CardTitle>
                                            {announcement.priority === 'High' && (
                                                <Badge variant="destructive" className="h-5 text-[10px] px-1.5">
                                                    URGENT
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            {announcement.created_at && formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
                                    {announcement.message}
                                </div>

                                {announcement.related_link && (
                                    <div className="mt-4 flex justify-end">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="cursor-pointer group"
                                            onClick={() => router.push(announcement.related_link!)}
                                        >
                                            View Details
                                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
