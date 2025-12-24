'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Loader2 } from 'lucide-react';
import api from '@/lib/axios';
import { Executive } from '@/types';
import { toast } from 'sonner';
import { ExecutiveCard } from '@/components/leadership/ExecutiveCard';

export default function LeadershipPage() {
    const [executives, setExecutives] = useState<Executive[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchExecutives = async () => {
            try {
                setLoading(true);
                const { data } = await api.get<Executive[]>('/leadership/');
                setExecutives(data);
                setError(null);
            } catch (err: any) {
                console.error('Error fetching executives:', err);
                const errorMessage = err.response?.data?.detail || 'Failed to load executive leadership';
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchExecutives();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen py-16 bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading executive leadership...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen py-16 bg-background">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-md mx-auto">
                        <h2 className="text-2xl font-bold mb-4">Unable to Load Leadership</h2>
                        <p className="text-muted-foreground mb-6">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (executives.length === 0) {
        return (
            <div className="min-h-screen py-16 bg-background">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Executive Leadership</h1>
                        <p className="text-muted-foreground">No executive members found for this academic year.</p>
                    </div>
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
                    title="Executive Leadership"
                    description="Meet the dedicated team steering DASA KNUST towards excellence and unity"
                />

                {/* Executive Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {executives.map((executive) => (
                        <ExecutiveCard key={executive.id} executive={executive} />
                    ))}
                </div>
            </div>
        </div>
    );
}
