import { Opportunity } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, School, GraduationCap, Briefcase, MapPin, ExternalLink, Clock, AlertTriangle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface OpportunityCardProps {
    opportunity: Opportunity;
    isAuthenticated?: boolean;
}

export function OpportunityCard({ opportunity, isAuthenticated = true }: OpportunityCardProps) {
    const router = useRouter();
    const daysRemaining = differenceInDays(new Date(opportunity.deadline), new Date());
    const isUrgent = daysRemaining >= 0 && daysRemaining < 7;
    const isExpired = daysRemaining < 0;

    const handleApplyClick = (e: React.MouseEvent) => {
        if (!isAuthenticated) {
            e.preventDefault();
            toast.error('Please login to apply for opportunities');
            router.push('/auth/login?next=/career');
        }
    };

    const getTypeVariant = (type: Opportunity['type']) => {
        switch (type) {
            case 'Job':
            case 'Internship':
                return 'default'; // Primary for jobs
            case 'Masters':
            case 'PhD':
            case 'Postgraduate':
            case 'Undergarduate':
            case 'Research':
            case 'Conference':
            case 'Scholarship':
                return 'secondary'; // Secondary for academia
            case 'NSS':
                return 'outline'; // Outline for service
            case 'Workshop':
                return 'outline'; // Outline for workshops
            default:
                return 'outline';
        }
    };

    const getIcon = (type: Opportunity['type']) => {
        switch (type) {
            case 'Job':
            case 'Internship':
            case 'NSS':
                return <Briefcase className="w-3 h-3 mr-1" />;
            case 'Masters':
            case 'PhD':
            case 'Postgraduate':
            case 'Undergarduate':
            case 'Research':
            case 'Conference':
            case 'Scholarship':
                return <GraduationCap className="w-3 h-3 mr-1" />;
            case 'Workshop':
                return <School className="w-3 h-3 mr-1" />;
            default:
                return <Building2 className="w-3 h-3 mr-1" />;
        }
    };

    return (
        <Card
            className="h-full flex flex-col hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border bg-card cursor-pointer group relative"
            onClick={() => router.push(`/career/${opportunity.id}`)}
        >
            <CardHeader className="pb-3 space-y-3">
                <div className="flex justify-between items-start gap-2">
                    <Badge variant={getTypeVariant(opportunity.type)} className="flex items-center w-fit">
                        {getIcon(opportunity.type)}
                        {opportunity.type}
                    </Badge>
                    {isUrgent && !isExpired && (
                        <div className="flex items-center text-destructive text-xs font-medium bg-destructive/10 px-2 py-1 rounded-md">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            <span>{daysRemaining}d left</span>
                        </div>
                    )}
                    {isExpired && (
                        <Badge variant="destructive" className="text-xs">
                            Expired
                        </Badge>
                    )}
                </div>

                <div>
                    <h3 className="font-bold text-lg line-clamp-2 leading-tight text-foreground group-hover:text-primary transition-colors">
                        {opportunity.title}
                    </h3>
                    <div className="flex items-center text-muted-foreground text-sm mt-2">
                        <Building2 className="w-4 h-4 mr-1.5 shrink-0" />
                        <span className="truncate">{opportunity.organization}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground text-sm mt-1">
                        <MapPin className="w-4 h-4 mr-1.5 shrink-0" />
                        <span className="truncate">{opportunity.location}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground text-xs mt-1">
                        <Clock className="w-3 h-3 mr-1.5 shrink-0" />
                        <span>
                            {isExpired
                                ? "Application closed"
                                : `Deadline: ${format(new Date(opportunity.deadline), 'MMM d, yyyy')}`
                            }
                        </span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-grow pb-4">
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {opportunity.description}
                </p>
            </CardContent>

            <CardFooter className="pt-0">
                <Button
                    className="w-full cursor-pointer hover:shadow-md transition-all"
                    variant="outline"
                    asChild={isAuthenticated}
                    disabled={isExpired}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!isAuthenticated) handleApplyClick(e);
                    }}
                >
                    {isAuthenticated ? (
                        <a href={opportunity.application_link} target="_blank" rel="noopener noreferrer">
                            Apply Now <ExternalLink className="w-4 h-4 ml-2" />
                        </a>
                    ) : (
                        <span>Apply Now <ExternalLink className="w-4 h-4 ml-2" /></span>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
