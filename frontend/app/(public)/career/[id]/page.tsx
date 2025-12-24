'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Opportunity } from '@/types';
import api from '@/lib/axios';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, MapPin, Calendar, Clock, Building2, ExternalLink, Loader2 } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { toast } from 'sonner';

export default function OpportunityDetailPage() {
    const params = useParams();
    const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (params.id) {
            fetchOpportunity(params.id as string);
        }
    }, [params.id]);

    const fetchOpportunity = async (id: string) => {
        try {
            setLoading(true);
            const { data } = await api.get<Opportunity>(`/career/opportunities/${id}/`);
            setOpportunity(data);
        } catch (err: any) {
            console.error('Error fetching opportunity:', err);
            setError(err.response?.data?.detail || 'Failed to load opportunity details');
            toast.error('Failed to load opportunity');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen py-16 flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !opportunity) {
        return (
            <div className="min-h-screen py-16 bg-background">
                <div className="container mx-auto px-4">
                    <PageHeader title="Opportunity Not Found" />
                    <div className="text-center py-12">
                        <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h2 className="text-2xl font-bold mb-2">Opportunity Unavailable</h2>
                        <p className="text-muted-foreground mb-4">{error || "This opportunity may have expired or been removed."}</p>
                    </div>
                </div>
            </div>
        );
    }

    const daysLeft = differenceInDays(new Date(opportunity.deadline), new Date());
    const isDeadlinePassed = daysLeft < 0;

    return (
        <div className="min-h-screen py-8 bg-background">
            <div className="container mx-auto px-4 max-w-5xl">
                <PageHeader title="Opportunity Details" />

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
                    {/* Main Content */}
                    <div className="space-y-6">
                        {/* Header Card */}
                        <Card className="border-l-4 border-l-primary shadow-sm">
                            <CardHeader className="pb-4">
                                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                                    <div>
                                        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
                                            {opportunity.title}
                                        </h1>
                                        <div className="flex items-center gap-2 text-lg text-muted-foreground font-medium">
                                            <Building2 className="h-5 w-5" />
                                            {opportunity.organization}
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="text-sm px-4 py-1.5 w-fit">
                                        {opportunity.type}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="h-4 w-4" />
                                        {opportunity.location}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-4 w-4" />
                                        Posted: {format(new Date(opportunity.posted_at), 'MMM d, yyyy')}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-4 w-4" />
                                        Deadline: {format(new Date(opportunity.deadline), 'MMM d, yyyy')}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Description */}
                        <div className="prose prose-slate dark:prose-invert max-w-none">
                            <h3 className="text-xl font-bold mb-4">Opportunity Description</h3>
                            <div className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                                {opportunity.description}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card className="bg-card shadow-sm sticky top-24">
                            <CardHeader>
                                <h3 className="font-bold text-lg">Application Info</h3>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Countdown */}
                                <div className="bg-primary/5 rounded-lg p-4 text-center border border-primary/10">
                                    {isDeadlinePassed ? (
                                        <div className="text-destructive font-medium">Applications Closed</div>
                                    ) : (
                                        <>
                                            <div className="text-3xl font-bold text-primary mb-1">{daysLeft}</div>
                                            <div className="text-sm text-muted-foreground">Days left to apply</div>
                                        </>
                                    )}
                                </div>

                                {/* Apply Button */}
                                <Button
                                    className="w-full text-base font-semibold shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5"
                                    size="lg"
                                    disabled={isDeadlinePassed}
                                    asChild
                                >
                                    <a
                                        href={opportunity.application_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {isDeadlinePassed ? 'Closed' : 'Apply Now'}
                                        <ExternalLink className="ml-2 h-4 w-4" />
                                    </a>
                                </Button>

                                <p className="text-xs text-muted-foreground text-center">
                                    You will be redirected to the official application portal.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
