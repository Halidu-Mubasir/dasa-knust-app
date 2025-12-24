'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Election } from '@/types';
import axios from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';
import { useVoteStore } from '@/store/useVoteStore';
import { VotingBooth } from '@/components/elections/VotingBooth';
import { ResultsDashboard } from '@/components/elections/ResultsDashboard';
import { PageHeader } from '@/components/ui/PageHeader';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { Vote, PlayCircle, History, Lock, Loader2, Clock, CalendarClock } from 'lucide-react';
import { format, differenceInSeconds, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import { toast } from 'sonner';

function ElectionsContent() {
    const [activeTab, setActiveTab] = useState('active');
    const [elections, setElections] = useState<Election[]>([]);
    const [activeElections, setActiveElections] = useState<Election[]>([]);
    const [pastElections, setPastElections] = useState<Election[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Voting State
    const [isVoting, setIsVoting] = useState(false);
    const [selectedElection, setSelectedElection] = useState<Election | null>(null);
    const [electionData, setElectionData] = useState<any>(null);
    const [hasVotedMap, setHasVotedMap] = useState<Record<number, boolean>>({});
    const [isDataLoading, setIsDataLoading] = useState(false);

    // Countdown states
    const [countdowns, setCountdowns] = useState<Record<number, string>>({});

    const { user } = useAuthStore();

    useEffect(() => {
        fetchElections();
        checkVoteStatus();
    }, []);

    // Countdown timer effect
    useEffect(() => {
        const updateCountdowns = () => {
            const newCountdowns: Record<number, string> = {};

            activeElections.forEach(election => {
                const now = new Date();
                let targetDate: Date;

                if (election.status === 'UPCOMING') {
                    targetDate = new Date(election.start_date);
                } else if (election.status === 'LIVE') {
                    targetDate = new Date(election.end_date);
                } else {
                    return; // No countdown for CLOSED or PAUSED
                }

                const secondsLeft = differenceInSeconds(targetDate, now);

                if (secondsLeft <= 0) {
                    newCountdowns[election.id] = election.status === 'UPCOMING' ? 'Starting now' : 'Ending now';
                    return;
                }

                const days = differenceInDays(targetDate, now);
                const hours = differenceInHours(targetDate, now) % 24;
                const minutes = differenceInMinutes(targetDate, now) % 60;
                const seconds = secondsLeft % 60;

                if (days > 0) {
                    newCountdowns[election.id] = `${days}d ${hours}h ${minutes}m`;
                } else if (hours > 0) {
                    newCountdowns[election.id] = `${hours}h ${minutes}m ${seconds}s`;
                } else if (minutes > 0) {
                    newCountdowns[election.id] = `${minutes}m ${seconds}s`;
                } else {
                    newCountdowns[election.id] = `${seconds}s`;
                }
            });

            setCountdowns(newCountdowns);
        };

        updateCountdowns();
        const interval = setInterval(updateCountdowns, 1000);
        return () => clearInterval(interval);
    }, [activeElections]);

    const fetchElections = async () => {
        try {
            const response = await axios.get('/elections/elections/');
            const allElections: Election[] = Array.isArray(response.data)
                ? response.data
                : (response.data.results || []);

            // Filter to only show elections that should be displayed on public UI
            const displayableElections = allElections.filter(e => e.should_display);

            setElections(displayableElections);
            // Active elections include LIVE, UPCOMING, and PAUSED
            setActiveElections(displayableElections.filter(e => e.status !== 'CLOSED'));
            // Past elections are CLOSED
            setPastElections(displayableElections.filter(e => e.status === 'CLOSED').sort((a, b) =>
                new Date(b.end_date).getTime() - new Date(a.end_date).getTime()
            ));
        } catch (error) {
            console.error('Error fetching elections:', error);
            toast.error('Failed to load elections.');
        } finally {
            setIsLoading(false);
        }
    };

    const checkVoteStatus = async () => {
        try {
            // Can be enhanced later
        } catch (e) { }
    };

    const handleEnterBooth = async (election: Election) => {
        setIsDataLoading(true);
        setSelectedElection(election);
        try {
            // Fetch data scoped to THIS election only using query params
            const [posRes, candRes, votesRes] = await Promise.all([
                axios.get(`/elections/positions/?election=${election.id}`),
                axios.get(`/elections/candidates/?election=${election.id}`),
                axios.get('/elections/votes/my_votes/')
            ]);

            // Backend now returns filtered data, no need for client-side filtering
            const positions = posRes.data.results || posRes.data || [];
            const candidates = candRes.data.results || candRes.data || [];

            const myVotes = votesRes.data;
            const hasVoted = myVotes.some((v: any) =>
                positions.some((p: any) => p.id === v.position)
            );

            if (hasVoted) {
                setHasVotedMap(prev => ({ ...prev, [election.id]: true }));
                setIsVoting(false);
                toast.info("You have already voted in this election.");
            } else {
                useVoteStore.getState().setElectionData({
                    election,
                    positions,
                    candidates
                });
                setIsVoting(true);
            }

        } catch (error) {
            console.error("Failed to load election details", error);
            toast.error("Failed to enter voting booth.");
            setSelectedElection(null);
        } finally {
            setIsDataLoading(false);
        }
    };

    const handleVoteComplete = async () => {
        setIsVoting(false);
        if (selectedElection) {
            setHasVotedMap(prev => ({ ...prev, [selectedElection.id]: true }));
        }
        useVoteStore.getState().reset();
    };

    const handleViewHistory = async (election: Election) => {
        setIsDataLoading(true);
        setSelectedElection(election);
        try {
            // Fetch data scoped to THIS election only using query params
            const [posRes, candRes] = await Promise.all([
                axios.get(`/elections/positions/?election=${election.id}`),
                axios.get(`/elections/candidates/?election=${election.id}`)
            ]);

            // Backend now returns filtered data, no need for client-side filtering
            const positions = posRes.data.results || posRes.data || [];
            const candidates = candRes.data.results || candRes.data || [];

            setElectionData({ positions, candidates });
        } catch (error) {
            toast.error("Could not load history.");
        } finally {
            setIsDataLoading(false);
        }
    };

    // Helper function to get status badge
    const getStatusBadge = (election: Election) => {
        switch (election.status) {
            case 'LIVE':
                return (
                    <Badge className="bg-green-600 dark:bg-green-500 text-white hover:bg-green-600 dark:hover:bg-green-500 px-3 py-1 animate-pulse">
                        LIVE
                    </Badge>
                );
            case 'UPCOMING':
                return (
                    <Badge className="bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-600 dark:hover:bg-blue-500 px-3 py-1">
                        UPCOMING
                    </Badge>
                );
            case 'CLOSED':
                return (
                    <Badge variant="secondary" className="px-3 py-1">
                        EENDED
                    </Badge>
                );
            case 'PAUSED':
                return (
                    <Badge variant="destructive" className="px-3 py-1">
                        Suspended
                    </Badge>
                );
        }
    };

    // Helper function to get action button props
    const getActionButton = (election: Election) => {
        switch (election.status) {
            case 'LIVE':
                return {
                    text: 'Enter Voting Booth',
                    disabled: false,
                    variant: 'default' as const,
                    onClick: () => handleEnterBooth(election)
                };
            case 'UPCOMING':
                return {
                    text: `Polls Open ${format(new Date(election.start_date), 'MMM d, h:mm a')}`,
                    disabled: true,
                    variant: 'secondary' as const,
                    onClick: () => {}
                };
            case 'CLOSED':
                return {
                    text: 'Polls Closed',
                    disabled: true,
                    variant: 'secondary' as const,
                    onClick: () => {}
                };
            case 'PAUSED':
                return {
                    text: 'Voting Suspended',
                    disabled: true,
                    variant: 'destructive' as const,
                    onClick: () => {}
                };
        }
    };

    // Voting Booth View
    if (isVoting) {
        return (
            <div className="min-h-screen bg-background">
                <div className="sticky top-0 z-50 bg-card border-b px-6 py-4 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                            <Vote className="w-5 h-5" />
                        </div>
                        <h2 className="font-bold text-lg text-foreground">{selectedElection?.title}</h2>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => { setIsVoting(false); useVoteStore.getState().reset(); }}
                    >
                        Exit Booth
                    </Button>
                </div>
                <div className="container mx-auto py-12 px-4">
                    <VotingBooth onVoteComplete={handleVoteComplete} />
                </div>
            </div>
        );
    }

    // Results Dashboard View
    if (selectedElection && selectedElection.status === 'CLOSED' && electionData) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto py-8 px-4">
                    <Button
                        variant="ghost"
                        className="mb-4 cursor-pointer hover:bg-muted"
                        onClick={() => setSelectedElection(null)}
                    >
                        ← Back to History
                    </Button>
                    <ResultsDashboard
                        election={selectedElection}
                        candidates={electionData.candidates}
                        positions={electionData.positions}
                    />
                </div>
            </div>
        );
    }

    // Main Elections Page
    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <PageHeader
                    title="Electoral Commission"
                    description="Official voting portal for the Dagomba Students Association"
                />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-8">
                        <TabsTrigger value="active" className="flex items-center gap-2 cursor-pointer">
                            <PlayCircle className="w-4 h-4" /> Active Elections
                        </TabsTrigger>
                        <TabsTrigger value="history" className="flex items-center gap-2 cursor-pointer">
                            <History className="w-4 h-4" /> Election History
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="active" className="space-y-6">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                                <p className="text-muted-foreground">Loading elections...</p>
                            </div>
                        ) : activeElections.length > 0 ? (
                            activeElections.map(election => {
                                const hasVoted = hasVotedMap[election.id];
                                const actionButton = getActionButton(election);
                                const countdown = countdowns[election.id];

                                if (hasVoted && election.status === 'LIVE') {
                                    return (
                                        <Card key={election.id} className="border-l-4 border-l-green-500 bg-green-500/5 dark:bg-green-500/10">
                                            <CardHeader>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <CardTitle className="text-xl flex items-center gap-2 text-foreground">
                                                            {election.title}
                                                            <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30">
                                                                Vote Cast
                                                            </Badge>
                                                        </CardTitle>
                                                        <CardDescription className="mt-2">
                                                            Polls close on {format(new Date(election.end_date), 'MMMM do, yyyy')}
                                                        </CardDescription>
                                                    </div>
                                                    <div className="bg-green-500/10 p-3 rounded-full">
                                                        <Lock className="w-6 h-6 text-green-600 dark:text-green-400" />
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-muted-foreground">
                                                    Your vote has been securely recorded. Results will be published by the EC shortly after the polls close.
                                                </p>
                                            </CardContent>
                                        </Card>
                                    );
                                }

                                return (
                                    <Card key={election.id} className="hover:shadow-lg hover:scale-[1.01] transition-all border bg-card group">
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="text-2xl text-foreground">{election.title}</CardTitle>
                                                {getStatusBadge(election)}
                                            </div>
                                            <CardDescription className="flex items-center gap-2 mt-2">
                                                {election.status === 'LIVE' && (
                                                    <>
                                                        <Clock className="w-4 h-4" />
                                                        <span>Ends: {format(new Date(election.end_date), 'PPP p')}</span>
                                                    </>
                                                )}
                                                {election.status === 'UPCOMING' && (
                                                    <>
                                                        <CalendarClock className="w-4 h-4" />
                                                        <span>Opens: {format(new Date(election.start_date), 'PPP p')}</span>
                                                    </>
                                                )}
                                                {election.status === 'PAUSED' && (
                                                    <span className="text-destructive">Voting has been temporarily suspended</span>
                                                )}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {election.status === 'LIVE' && (
                                                <>
                                                    <p className="text-muted-foreground mb-3">
                                                        The polls are currently open. Please proceed to the voting booth to cast your vote.
                                                        Ensure you have reviewed all manifestos before voting.
                                                    </p>
                                                    {countdown && (
                                                        <div className="flex items-center gap-2 text-sm font-medium text-primary">
                                                            <Clock className="w-4 h-4" />
                                                            <span>Time remaining: {countdown}</span>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                            {election.status === 'UPCOMING' && (
                                                <>
                                                    <p className="text-muted-foreground mb-3">
                                                        This election has not started yet. The polls will open at the scheduled time.
                                                    </p>
                                                    {countdown && (
                                                        <div className="flex items-center gap-2 text-sm font-medium text-yellow-600 dark:text-yellow-400">
                                                            <CalendarClock className="w-4 h-4" />
                                                            <span>Opens in: {countdown}</span>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                            {election.status === 'PAUSED' && (
                                                <p className="text-muted-foreground">
                                                    Voting for this election has been temporarily suspended by the Electoral Commission.
                                                    Please check back later.
                                                </p>
                                            )}
                                        </CardContent>
                                        <CardFooter>
                                            <Button
                                                className="w-full sm:w-auto font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer"
                                                size="lg"
                                                variant={actionButton.variant}
                                                onClick={actionButton.onClick}
                                                disabled={actionButton.disabled || isDataLoading}
                                            >
                                                {isDataLoading && !actionButton.disabled ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Checking Eligibility...
                                                    </>
                                                ) : (
                                                    actionButton.text
                                                )}
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                );
                            })
                        ) : (
                            <Card className="text-center py-16 bg-card border-dashed">
                                <CardContent>
                                    <Vote className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                                    <h3 className="text-lg font-semibold text-foreground mb-2">No Active Elections</h3>
                                    <p className="text-muted-foreground">There are no polls currently open for voting</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="history" className="space-y-4">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                                <p className="text-muted-foreground">Loading history...</p>
                            </div>
                        ) : pastElections.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pastElections.map(election => (
                                    <Card
                                        key={election.id}
                                        className="hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer group border-l-4 border-l-border hover:border-l-primary bg-card"
                                        onClick={() => handleViewHistory(election)}
                                    >
                                        <CardHeader>
                                            <CardTitle className="group-hover:text-primary transition-colors text-foreground">
                                                {election.title}
                                            </CardTitle>
                                            <CardDescription>
                                                Ended {format(new Date(election.end_date), 'MMM d, yyyy')}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex justify-between items-center text-sm">
                                                <Badge
                                                    variant="outline"
                                                    className={election.is_published
                                                        ? "border-green-500 text-green-600 dark:text-green-400 bg-green-500/10"
                                                        : "border-yellow-500 text-yellow-600 dark:text-yellow-400 bg-yellow-500/10"
                                                    }
                                                >
                                                    {election.is_published ? "Results Published" : "Results Pending"}
                                                </Badge>
                                                <span className="text-primary text-sm font-medium group-hover:translate-x-1 transition-transform">
                                                    View Results →
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="text-center py-16 bg-card">
                                <CardContent>
                                    <History className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                                    <p className="text-muted-foreground">No election history available</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

export default function ElectionsPage() {
    return (
        <AuthGuard>
            <ElectionsContent />
        </AuthGuard>
    );
}
