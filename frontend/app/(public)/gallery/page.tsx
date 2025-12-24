'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Loader2, Play } from 'lucide-react';
import Lightbox from 'yet-another-react-lightbox';
import Video from 'yet-another-react-lightbox/plugins/video';
import 'yet-another-react-lightbox/styles.css';
import { motion } from 'framer-motion';
import api from '@/lib/axios';
import { GalleryItem } from '@/types';
import { toast } from 'sonner';

const CATEGORIES = ['All', 'General', 'Sports', 'Cultural', 'Politics', 'Excursion'];

export default function GalleryPage() {
    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                setLoading(true);
                const { data } = await api.get<GalleryItem[]>('/gallery/');
                setGalleryItems(data);
                setFilteredItems(data);
            } catch (err: any) {
                console.error('Error fetching gallery:', err);
                toast.error('Failed to load gallery');
            } finally {
                setLoading(false);
            }
        };

        fetchGallery();
    }, []);

    useEffect(() => {
        if (selectedCategory === 'All') {
            setFilteredItems(galleryItems);
        } else {
            setFilteredItems(galleryItems.filter(item => item.category === selectedCategory));
        }
    }, [selectedCategory, galleryItems]);

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    // Prepare lightbox slides from filtered items
    const lightboxSlides = filteredItems
        .filter(item => item.image_url || item.video_url)
        .map(item => {
            if (item.media_type === 'Video') {
                return {
                    type: 'video' as const,
                    width: 1920,
                    height: 1080,
                    sources: [
                        {
                            src: item.video_url!,
                            type: 'video/mp4',
                        },
                    ],
                };
            }
            return {
                src: item.image_url!,
            };
        });

    if (loading) {
        return (
            <div className="min-h-screen py-16 bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading gallery...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-16 bg-background">
            <div className="container mx-auto px-4">
                {/* Header */}
                {/* Header */}
                <PageHeader
                    title="Media Gallery"
                    description="Moments and memories from our events, celebrations, and daily activities"
                />

                {/* Category Filter Pills */}
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {CATEGORIES.map((category) => (
                        <Button
                            key={category}
                            variant={selectedCategory === category ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedCategory(category)}
                            className="cursor-pointer"
                        >
                            {category}
                        </Button>
                    ))}
                </div>

                {/* Empty State */}
                {filteredItems.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No media items found in this category.</p>
                    </div>
                )}

                {/* Masonry Grid Gallery */}
                <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                    {filteredItems.map((item, index) => {
                        const thumbnailUrl = item.thumbnail_url;
                        if (!thumbnailUrl) return null;

                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="break-inside-avoid"
                            >
                                <Card
                                    className="group relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
                                    onClick={() => openLightbox(index)}
                                >
                                    <div className="relative">
                                        <img
                                            src={thumbnailUrl}
                                            alt={item.title || `${item.category} media`}
                                            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105 aspect-[4/3]"
                                        />

                                        {/* Video Play Icon */}
                                        {item.media_type === 'Video' && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="bg-black/60 rounded-full p-4">
                                                    <Play className="h-12 w-12 text-white fill-white" />
                                                </div>
                                            </div>
                                        )}

                                        {/* Category Label Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                                <span className="inline-block px-3 py-1 bg-primary/90 text-primary-foreground text-xs font-medium rounded-full">
                                                    {item.category}
                                                </span>
                                                {item.title && (
                                                    <p className="text-white text-sm mt-2">{item.title}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Lightbox */}
                <Lightbox
                    open={lightboxOpen}
                    close={() => setLightboxOpen(false)}
                    index={lightboxIndex}
                    slides={lightboxSlides}
                    plugins={[Video]}
                />
            </div>
        </div>
    );
}
