'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import api from '@/lib/axios';
import { Announcement } from '@/types';
import { cn } from '@/lib/utils';

type NotificationBellProps = {
    className?: string;
};

const LAST_READ_KEY = 'dasa_notification_last_read';
const POLL_INTERVAL = 30000; // 30 seconds

export function NotificationBell({ className }: NotificationBellProps) {
    const [data, setData] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const response = await api.get<Announcement[]>('/announcements/');
            // Get latest 5 announcements
            const latest = response.data.slice(0, 5);
            setData(latest);

            // Check for unread notifications
            if (latest.length > 0) {
                const newestItemTime = new Date(latest[0].created_at).getTime();
                const lastReadTime = localStorage.getItem(LAST_READ_KEY);

                if (!lastReadTime || newestItemTime > parseInt(lastReadTime)) {
                    setHasUnread(true);
                } else {
                    setHasUnread(false);
                }
            } else {
                setHasUnread(false);
            }
        } catch (err) {
            console.error('Error fetching announcements:', err);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch and polling setup
    useEffect(() => {
        fetchAnnouncements();

        // Set up polling every 30 seconds
        const interval = setInterval(fetchAnnouncements, POLL_INTERVAL);

        return () => clearInterval(interval);
    }, []);

    // Handle popover open - mark as read
    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);

        if (isOpen && data.length > 0) {
            // Mark as read
            setHasUnread(false);
            const currentTime = new Date().getTime().toString();
            localStorage.setItem(LAST_READ_KEY, currentTime);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn('relative', className)}
                >
                    <Bell className="h-5 w-5" />
                    {hasUnread && (
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold">Notifications</h3>
                    {data.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                            {data.length} recent
                        </span>
                    )}
                </div>
                <ScrollArea className="h-[400px]">
                    {loading && data.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            Loading...
                        </div>
                    ) : data.length === 0 ? (
                        <div className="p-8 text-center">
                            <Bell className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                            <p className="text-sm text-muted-foreground">No new announcements</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {data.map((announcement) => (
                                <div
                                    key={announcement.id}
                                    className={cn(
                                        'p-4 hover:bg-accent transition-colors cursor-pointer',
                                        announcement.priority === 'High' && 'bg-red-50/50 hover:bg-red-100/50'
                                    )}
                                    onClick={() => {
                                        if (announcement.related_link) {
                                            window.location.href = announcement.related_link;
                                        }
                                        setOpen(false);
                                    }}
                                >
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <h4 className={cn(
                                            'font-medium text-sm',
                                            announcement.priority === 'High' && 'text-red-700'
                                        )}>
                                            {announcement.title}
                                        </h4>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                            {formatDate(announcement.created_at)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {announcement.message}
                                    </p>
                                    {announcement.priority === 'High' && (
                                        <span className="inline-block mt-2 text-xs font-medium text-red-600">
                                            High Priority
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                {data.length > 0 && (
                    <div className="p-2 border-t">
                        <Link href="/announcements" passHref onClick={() => setOpen(false)}>
                            <Button
                                variant="ghost"
                                className="w-full text-xs cursor-pointer"
                            >
                                View all announcements
                            </Button>
                        </Link>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
