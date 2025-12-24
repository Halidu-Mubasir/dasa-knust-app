'use client';

import { useState, useEffect } from 'react';
import { Opportunity } from '@/types';
import axios from '@/lib/axios';
import { OpportunityCard } from '@/components/career/OpportunityCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { Briefcase, GraduationCap, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';

const CATEGORIES = [
    { value: 'all', label: 'All Opportunities', icon: Briefcase },
    { value: 'jobs', label: 'Jobs & Internships', icon: Briefcase },
    { value: 'nss', label: 'NSS Positions', icon: Briefcase },
    { value: 'scholarships', label: 'Scholarships', icon: GraduationCap },
];

export default function CareerPage() {
    const { isAuthenticated } = useAuthStore();
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        fetchOpportunities();
    }, []);

    const fetchOpportunities = async () => {
        try {
            const response = await axios.get('/career/opportunities/');
            setOpportunities(response.data);
        } catch (error) {
            console.error('Error fetching opportunities:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredOpportunities = opportunities.filter((op) => {
        if (selectedCategory === 'all') return true;
        if (selectedCategory === 'jobs') return ['Job', 'Internship'].includes(op.type);
        if (selectedCategory === 'nss') return op.type === 'NSS';
        if (selectedCategory === 'scholarships') return ['Masters', 'PhD', 'Workshop', 'Postgraduate', 'Undergarduate', 'Research', 'Conference', 'Scholarship',].includes(op.type);
        return true;
    });

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div className="flex-1">
                        <PageHeader
                            title="Career Opportunities"
                            description="Curated jobs, internships, and scholarships for DASA members"
                        />
                    </div>
                    <div className="hidden md:block text-right pb-8">
                        <div className="text-sm font-medium text-muted-foreground">
                            Total Opportunities
                        </div>
                        <div className="text-3xl font-bold text-primary">
                            {opportunities.length}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Category Filter Pills */}
                <div className="mb-8">
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {CATEGORIES.map((cat) => {
                            const Icon = cat.icon;
                            return (
                                <Button
                                    key={cat.value}
                                    variant={selectedCategory === cat.value ? 'default' : 'outline'}
                                    onClick={() => setSelectedCategory(cat.value)}
                                    className="whitespace-nowrap cursor-pointer hover:shadow-md transition-all"
                                >
                                    <Icon className="h-4 w-4 mr-2" />
                                    {cat.label}
                                </Button>
                            );
                        })}
                    </div>
                </div>

                {/* Opportunities Grid */}
                {isLoading ? (
                    <div className="flex flex-col justify-center items-center h-64">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">Loading opportunities...</p>
                    </div>
                ) : filteredOpportunities.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredOpportunities.map((opportunity) => (
                            <OpportunityCard
                                key={opportunity.id}
                                opportunity={opportunity}
                                isAuthenticated={isAuthenticated}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState category={selectedCategory} />
                )}
            </div>
        </div>
    );
}

function EmptyState({ category }: { category: string }) {
    return (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed bg-card">
            <div className="rounded-full bg-muted p-4 mb-4">
                <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No opportunities found</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
                {category === 'all'
                    ? "We couldn't find any opportunities at the moment. Please check back later."
                    : `No ${category} opportunities available right now. Try browsing all opportunities.`}
            </p>
        </Card>
    );
}
