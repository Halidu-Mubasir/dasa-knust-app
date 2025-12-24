'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Progress } from "@/components/ui/progress";
import { useVoteStore } from '@/store/useVoteStore';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import axios from '@/lib/axios';
import { toast } from 'sonner';
import { ChevronRight, ChevronLeft, Check, AlertTriangle, FileText, User } from 'lucide-react';
import Image from 'next/image';
import { CandidateCard } from './CandidateCard';

interface VotingBoothProps {
    onVoteComplete: () => void;
}

export function VotingBooth({ onVoteComplete }: VotingBoothProps) {
    const {
        activeElection,
        positions,
        candidates,
        currentStep,
        selections,
        nextStep,
        prevStep,
        selectCandidate,
        skipStep
    } = useVoteStore();

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Group candidates by position
    const candidatesByPosition = positions.reduce((acc, pos) => {
        acc[pos.id] = candidates.filter(c => c.position === pos.id);
        return acc;
    }, {} as Record<number, typeof candidates>);

    const currentPosition = positions[currentStep];
    const isLastStep = currentStep === positions.length;
    const progress = Math.min(((currentStep + 1) / (positions.length + 1)) * 100, 100);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Submit votes sequentially
            for (const [positionId, candidateId] of Object.entries(selections)) {
                if (candidateId !== -1) {
                    await axios.post('/elections/votes/', {
                        position: parseInt(positionId),
                        candidate: candidateId
                    });
                }
            }

            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#22c55e', '#FFD700', '#ffffff']
            });

            toast.success('Ballot cast successfully!');
            setTimeout(() => {
                onVoteComplete();
            }, 1500);

        } catch (error: any) {
            console.error('Voting failed:', error);
            toast.error(error.response?.data?.detail || 'Failed to submit votes. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!activeElection) {
        return (
            <div className="flex justify-center items-center h-full p-12 text-center text-muted-foreground">
                <p>Loading voting session...</p>
            </div>
        );
    }

    // Review Step
    if (isLastStep) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl mx-auto"
            >
                <Card className="border-t-4 border-t-primary shadow-xl bg-card">
                    <div className="p-8 text-center bg-muted/30 border-b">
                        <h2 className="text-3xl font-bold mb-2 text-foreground">Review Your Ballot</h2>
                        <p className="text-muted-foreground">Please confirm your choices for {activeElection.title}</p>
                    </div>

                    <CardContent className="p-0">
                        <div className="divide-y divide-border">
                            {positions.map((pos, idx) => {
                                const selectedId = selections[pos.id];
                                const candidate = candidates.find(c => c.id === selectedId);

                                return (
                                    <div key={pos.id} className="p-6 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-foreground">{pos.name}</h4>
                                                {candidate ? (
                                                    <div className="flex items-center text-green-600 dark:text-green-400 font-medium">
                                                        <Check className="w-4 h-4 mr-1" />
                                                        {candidate.user_details?.first_name} {candidate.user_details?.last_name}
                                                    </div>
                                                ) : (
                                                    <span className="text-yellow-600 dark:text-yellow-400 font-medium italic">Abstained / Skipped</span>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="cursor-pointer"
                                            onClick={() => useVoteStore.setState({ currentStep: idx })}
                                        >
                                            Change
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="p-8 bg-muted/30 border-t mt-4 flex flex-col items-center text-center">
                            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 mb-6 bg-yellow-500/10 px-4 py-2 rounded-lg border border-yellow-500/20">
                                <AlertTriangle className="w-5 h-5" />
                                <span className="font-medium text-sm">Action cannot be undone once submitted</span>
                            </div>

                            <div className="flex gap-4 w-full max-w-md">
                                <Button
                                    variant="outline"
                                    className="flex-1 cursor-pointer"
                                    onClick={prevStep}
                                    disabled={isSubmitting}
                                >
                                    Go Back
                                </Button>
                                <Button
                                    className="flex-1 h-12 text-lg shadow-md hover:shadow-lg transition-all cursor-pointer"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Casting Ballot..." : "Cast Ballot"}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        );
    }

    // Voting Step
    return (
        <div className="w-full max-w-5xl mx-auto">
            <div className="mb-8 space-y-2">
                <div className="flex justify-between text-sm font-medium text-muted-foreground">
                    <span>Step {currentStep + 1} of {positions.length + 1}</span>
                    <span>{Math.round(progress)}% Complete</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            <div className="mb-8">
                <h1 className="text-4xl font-bold text-foreground mb-2">{currentPosition.name}</h1>
                <p className="text-lg text-muted-foreground">Select one candidate for this position</p>
            </div>

            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentPosition.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-32"
                >
                    {candidatesByPosition[currentPosition.id]?.map(candidate => {
                        const isSelected = selections[currentPosition.id] === candidate.id;

                        return (
                            <CandidateCard
                                key={candidate.id}
                                candidate={candidate}
                                isSelected={isSelected}
                                onSelect={() => selectCandidate(currentPosition.id, candidate.id)}
                            />
                        );
                    })}
                </motion.div>
            </AnimatePresence>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-card/90 backdrop-blur-md border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 flex justify-center">
                <div className="w-full max-w-5xl flex justify-between items-center gap-4 px-4">
                    <Button
                        variant="outline"
                        onClick={currentStep === 0 ? undefined : prevStep}
                        className="text-foreground hover:bg-muted cursor-pointer min-w-[100px]"
                        disabled={currentStep === 0}
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" /> Back
                    </Button>

                    <div className="flex gap-4">
                        <Button
                            variant="ghost"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                            onClick={skipStep}
                        >
                            Skip This Position
                        </Button>
                        <Button
                            className={`
                                min-w-[160px] h-11 text-lg font-semibold shadow-md transition-all cursor-pointer transform active:scale-95
                                ${!selections[currentPosition.id]
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:shadow-lg hover:-translate-y-0.5'
                                }
                            `}
                            onClick={nextStep}
                            disabled={!selections[currentPosition.id]}
                        >
                            Next Position <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
