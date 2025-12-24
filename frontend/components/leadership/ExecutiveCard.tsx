'use client';

import { Card } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Facebook, Linkedin, Twitter } from 'lucide-react';
import { Executive } from '@/types';
import { cn } from '@/lib/utils';

interface ExecutiveCardProps {
    executive: Executive;
}

/**
 * Helper function to get user initials from full name
 */
const getInitials = (name: string): string => {
    if (!name) return 'EX';
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

export function ExecutiveCard({ executive }: ExecutiveCardProps) {
    // Robust image handling
    const imageUrl = executive.image_url || executive.profile_picture || null;
    const hasImage = !!imageUrl;

    return (
        <Card className="group relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300">
            {/* Image Container with Fallback */}
            <div className="relative bg-muted">
                <AspectRatio ratio={1 / 1}>
                    {hasImage ? (
                        <div className="relative h-full w-full overflow-hidden bg-muted">
                            {/* Layer 1: Background Ambience */}
                            <img
                                src={imageUrl!}
                                alt={executive.full_name}
                                className="absolute inset-0 h-full w-full object-cover blur-xl scale-110 opacity-60 brightness-75"
                            />

                            {/* Layer 2: Sharp Subject */}
                            <img
                                src={imageUrl!}
                                alt={executive.full_name}
                                className="absolute inset-0 h-full w-full object-scale-down z-10 drop-shadow-md transition-transform duration-500 group-hover:scale-105"
                            />
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10">
                            <span className="text-6xl font-bold text-primary">
                                {getInitials(executive.full_name)}
                            </span>
                        </div>
                    )}
                </AspectRatio>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 text-white z-20">
                    {/* Quote/Bio */}
                    {executive.bio && (
                        <p className="text-sm italic text-center mb-6">
                            "{executive.bio}"
                        </p>
                    )}

                    {/* Social Icons */}
                    <div className="flex space-x-4">
                        {executive.facebook_url && (
                            <a
                                href={executive.facebook_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary transition-colors"
                                aria-label="Facebook"
                            >
                                <Facebook className="h-6 w-6" />
                            </a>
                        )}
                        {executive.linkedin_url && (
                            <a
                                href={executive.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary transition-colors"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="h-6 w-6" />
                            </a>
                        )}
                        {executive.twitter_url && (
                            <a
                                href={executive.twitter_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary transition-colors"
                                aria-label="Twitter"
                            >
                                <Twitter className="h-6 w-6" />
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Executive Info */}
            <div className="p-6 text-center">
                <h3 className="text-xl font-bold mb-1">{executive.full_name}</h3>
                <p className="text-primary font-medium">{executive.title}</p>
            </div>
        </Card>
    );
}
