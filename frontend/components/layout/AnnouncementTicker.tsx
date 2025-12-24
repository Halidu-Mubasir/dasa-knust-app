'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Bell, X } from 'lucide-react';
import { Announcement } from '@/types';
import api from '@/lib/axios';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';

const POLL_INTERVAL = 60000; // 60 seconds

export function AnnouncementTicker() {
    const { isAuthenticated } = useAuthStore();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAnnouncements = async () => {
        try {
            const { data } = await api.get<Announcement[]>('/announcements/');
            // Filter only active announcements (backend should already do this, but double-check)
            const activeAnnouncements = data.filter((a) => a.is_active);
            setAnnouncements(activeAnnouncements);
        } catch (error) {
            console.error('Error fetching announcements:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial fetch and polling setup
    useEffect(() => {
        if (!isAuthenticated) return;

        fetchAnnouncements();

        // Set up polling every 60 seconds
        const pollInterval = setInterval(fetchAnnouncements, POLL_INTERVAL);

        return () => clearInterval(pollInterval);
    }, [isAuthenticated]);

    // Rotation timer for cycling through announcements
    useEffect(() => {
        if (announcements.length === 0) return;

        const rotationInterval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % announcements.length);
        }, 5000); // Change announcement every 5 seconds

        return () => clearInterval(rotationInterval);
    }, [announcements.length]);

    if (!isAuthenticated) {
        return null;
    }

    if (isLoading || announcements.length === 0 || !isVisible) {
        return null;
    }

    const currentAnnouncement = announcements[currentIndex];
    const isHighPriority = currentAnnouncement.priority === 'High';

    return (
        <div
            className={`relative h-10 flex items-center justify-center overflow-hidden border-b ${isHighPriority
                ? 'bg-destructive/10 border-destructive/20'
                : 'bg-muted/50 border-border'
                }`}
        >
            <div className="container mx-auto px-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 min-w-fit">
                    {isHighPriority ? (
                        <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />
                    ) : (
                        <Bell className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {isHighPriority ? 'Alert' : 'Notice'}
                    </span>
                </div>

                <div className="flex-1 overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="text-center"
                        >
                            {currentAnnouncement.related_link ? (
                                <Link
                                    href={currentAnnouncement.related_link}
                                    className={`text-sm font-medium hover:underline cursor-pointer ${isHighPriority ? 'text-destructive' : 'text-foreground'
                                        }`}
                                >
                                    {currentAnnouncement.title} • {currentAnnouncement.message}
                                </Link>
                            ) : (
                                <span
                                    className={`text-sm font-medium ${isHighPriority ? 'text-destructive' : 'text-foreground'
                                        }`}
                                >
                                    {currentAnnouncement.title} • {currentAnnouncement.message}
                                </span>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="flex items-center gap-2 min-w-fit">
                    {announcements.length > 1 && (
                        <div className="flex gap-1">
                            {announcements.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`h-1.5 rounded-full transition-all cursor-pointer ${idx === currentIndex
                                        ? 'w-4 bg-foreground'
                                        : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                                        }`}
                                    aria-label={`Go to announcement ${idx + 1}`}
                                />
                            ))}
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 cursor-pointer hover:bg-muted"
                        onClick={() => setIsVisible(false)}
                        aria-label="Close announcements"
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
