'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { Candidate, Election, Position } from '@/types';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';
import { Lock, Check, Trophy } from 'lucide-react';
import { toast } from 'sonner';

interface ResultsDashboardProps {
    election: Election;
    candidates: Candidate[];
    positions?: Position[];
    onPublish?: () => void;
}

export function ResultsDashboard({ election, candidates, positions = [], onPublish }: ResultsDashboardProps) {
    const { user } = useAuthStore();
    const isAdmin = user?.is_staff;
    const isPublished = election.is_published;
    const [isPublishing, setIsPublishing] = useState(false);

    // Color palette for pie charts (excluding black)
    const COLORS = [
        '#3b82f6', // blue
        '#10b981', // green
        '#f59e0b', // amber
        '#8b5cf6', // purple
        '#ec4899', // pink
        '#06b6d4', // cyan
        '#f97316', // orange
        '#6366f1', // indigo
        '#14b8a6', // teal
        '#84cc16', // lime
    ];

    const handlePublish = async () => {
        if (!isAdmin) return;
        setIsPublishing(true);
        try {
            await api.post(`/elections/elections/${election.id}/publish_results/`);
            toast.success('Election results published successfully!');
            if (onPublish) onPublish();
        } catch (error) {
            console.error('Failed to publish results:', error);
            toast.error('Failed to publish results. Please try again.');
        } finally {
            setIsPublishing(false);
        }
    };

    // 1. Group candidates by position
    const candidatesByPosition = positions
        .sort((a, b) => a.rank - b.rank)
        .map(position => {
            const positionCandidates = candidates.filter(c => c.position === position.id);

            // Determine winner
            let winner: Candidate | null = null;
            let maxVotes = -1;
            let isTie = false;

            if (positionCandidates.length > 0) {
                // simple max vote logic
                const sorted = [...positionCandidates].sort((a, b) => (b.total_votes || 0) - (a.total_votes || 0));
                const first = sorted[0];
                const second = sorted[1];

                if (first && (first.total_votes || 0) > maxVotes) {
                    maxVotes = first.total_votes || 0;
                    // Check for tie
                    if (second && second.total_votes === maxVotes) {
                        isTie = true;
                        winner = null;
                    } else {
                        winner = first;
                    }
                }
            }

            // Transform for Recharts
            const chartData = positionCandidates.map(c => ({
                id: c.id,
                name: `${c.user_details?.first_name || ''} ${c.user_details?.last_name || ''}`.trim() || 'Unknown',
                votes: c.total_votes || 0,
                isWinner: winner?.id === c.id
            }));

            return {
                position,
                candidates: positionCandidates,
                chartData,
                winner,
                isTie
            };
        });


    // If results needed to be hidden
    if (!isPublished && !isAdmin) {
        return (
            <Card className="w-full border-2 border-yellow-500/20 bg-yellow-500/5 dark:bg-yellow-500/10">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="bg-yellow-500/10 p-4 rounded-full mb-4">
                        <Lock className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-3">Results Pending Verification</h3>
                    <p className="text-muted-foreground max-w-md text-lg">
                        The Electoral Commission is currently validating the votes.
                        Results will be published here once the process is complete.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-8 w-full">
            {/* Dashboard Header */}
            <Card className="bg-card border-l-4 border-l-primary">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-3xl text-foreground">Election Results</CardTitle>
                        <CardDescription className="text-lg mt-1">
                            {election.title}
                        </CardDescription>
                    </div>

                    <div className="flex gap-4 items-center">
                        {isPublished ? (
                            <div className="flex items-center text-green-600 dark:text-green-400 bg-green-500/10 px-4 py-2 rounded-full text-base font-semibold border border-green-500/20">
                                <Check className="w-5 h-5 mr-2" /> Official Results
                            </div>
                        ) : (
                            <div className="flex items-center text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 px-4 py-2 rounded-full text-base font-semibold border border-yellow-500/20">
                                <Lock className="w-5 h-5 mr-2" /> Unofficial / Live
                            </div>
                        )}

                        {isAdmin && !isPublished && (
                            <Button
                                onClick={handlePublish}
                                disabled={isPublishing}
                                className="cursor-pointer shadow-md hover:shadow-lg transition-all"
                            >
                                {isPublishing ? "Publishing..." : "Publish Results"}
                            </Button>
                        )}
                    </div>
                </CardHeader>
            </Card>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {candidatesByPosition.map((group) => (
                    <Card key={group.position.id} className="flex flex-col h-full bg-card shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2 border-b bg-muted/20">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-foreground">{group.position.name}</h3>
                                    <span className="text-sm text-muted-foreground">{group.position.max_votes_per_user} Vote per person</span>
                                </div>
                                {group.winner && (
                                    <div className="flex flex-col items-end">
                                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 px-3 py-1 flex items-center gap-1 mb-1">
                                            <Trophy className="w-3 h-3 text-amber-600" /> Winner
                                        </Badge>
                                        <span className="font-bold text-sm text-foreground">
                                            {group.winner.user_details?.first_name} {group.winner.user_details?.last_name}
                                        </span>
                                    </div>
                                )}
                                {group.isTie && (
                                    <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50">
                                        Run-off / Tie
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>

                        <CardContent className="pt-6 flex-grow min-h-[350px]">
                            {group.chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={group.chartData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={(entry) => `${entry.name}: ${entry.votes}`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="votes"
                                        >
                                            {group.chartData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={COLORS[index % COLORS.length]}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '8px',
                                                border: 'none',
                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                                backgroundColor: 'hsl(var(--card))',
                                                color: 'hsl(var(--foreground))'
                                            }}
                                        />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            formatter={(value, entry) => {
                                                const payload = entry.payload as { votes: number };
                                                return `${value} (${payload.votes} votes)`;
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground p-8 border-dashed border-2 rounded-lg">
                                    No candidates or votes
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {candidatesByPosition.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    No positions data available.
                </div>
            )}
        </div>
    );
}
