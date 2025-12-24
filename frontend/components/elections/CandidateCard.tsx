'use client';

import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Candidate } from '@/types';
import { Check, FileText, User } from 'lucide-react';

interface CandidateCardProps {
    candidate: Candidate;
    isSelected: boolean;
    onSelect: () => void;
}

export function CandidateCard({ candidate, isSelected, onSelect }: CandidateCardProps) {
    return (
        <div
            onClick={onSelect}
            className={`
                relative cursor-pointer group rounded-xl border-2 overflow-hidden transition-all duration-200
                ${isSelected
                    ? 'border-green-600 dark:border-green-500 bg-green-50 dark:bg-green-500/10 shadow-lg ring-2 ring-green-600 dark:ring-green-500 scale-[1.02]'
                    : 'border-border bg-card hover:border-primary hover:shadow-md hover:scale-[1.01]'
                }
            `}
        >
            {isSelected && (
                <div className="absolute top-3 right-3 z-10 bg-green-600 dark:bg-green-500 text-white p-2 rounded-full shadow-sm animate-in zoom-in">
                    <Check className="w-5 h-5" />
                </div>
            )}

            <AspectRatio ratio={4 / 3} className="bg-muted relative">
                {candidate.photo ? (
                    <div className="relative h-full w-full overflow-hidden bg-muted">
                        {/* Layer 1: Background Ambience */}
                        <img
                            src={candidate.photo}
                            alt={`${candidate.user_details?.first_name || ''} ${candidate.user_details?.last_name || ''}`}
                            className="absolute inset-0 h-full w-full object-cover blur-xl scale-110 opacity-60 brightness-75"
                        />

                        {/* Layer 2: Sharp Subject */}
                        <img
                            src={candidate.photo}
                            alt={`${candidate.user_details?.first_name || ''} ${candidate.user_details?.last_name || ''}`}
                            className="absolute inset-0 h-full w-full object-contain z-10 drop-shadow-md transition-transform duration-500 group-hover:scale-105"
                        />
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">
                        <User className="w-16 h-16 text-muted-foreground/30" />
                    </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/5 dark:bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none z-20">
                    <span className="bg-card text-foreground px-4 py-2 rounded-full font-medium shadow-sm transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        {isSelected ? "Selected" : "Click to Select"}
                    </span>
                </div>
            </AspectRatio>

            <div className="p-5">
                <h3 className="text-lg font-bold text-foreground mb-1">
                    {candidate.user_details?.first_name || 'Unknown'} {candidate.user_details?.last_name || ''}
                </h3>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            variant="link"
                            className="p-0 h-auto text-sm text-primary hover:underline flex items-center gap-1 cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <FileText className="w-3 h-3" /> View Manifesto
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-card">
                        <DialogHeader>
                            <DialogTitle className="text-2xl mb-2 text-foreground">Manifesto</DialogTitle>
                            <DialogDescription className="text-lg font-medium text-foreground">
                                {candidate.user_details?.first_name} {candidate.user_details?.last_name} - {candidate.position_name}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4 prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap dark:prose-invert">
                            {candidate.manifesto || "No manifesto provided."}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
