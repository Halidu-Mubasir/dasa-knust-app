'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Vote, ShoppingBag, LifeBuoy, ArrowUpRight, Megaphone, UserPlus, Package, AlertCircle, FileText, Briefcase, Calendar, Download, Search, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import api from '@/lib/axios';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Activity {
    type: 'user' | 'market' | 'welfare' | 'lost_found' | 'lost_found_resolved';
    message: string;
    time: string;
}

export default function AdminDashboardPage() {
    const [statsData, setStatsData] = useState({
        total_users: 0,
        active_elections: 0,
        pending_market_items: 0,
        pending_welfare: 0,
        total_announcements: 0,
        total_resources: 0,
        total_opportunities: 0,
        total_events: 0
    });
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingActivity, setIsLoadingActivity] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/users/admin/stats/');
                setStatsData(response.data);
            } catch (error) {
                console.error('Failed to fetch admin stats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchActivity = async () => {
            try {
                const response = await api.get('/users/admin/activity/');
                setActivities(response.data.activities);
            } catch (error) {
                console.error('Failed to fetch admin activity:', error);
            } finally {
                setIsLoadingActivity(false);
            }
        };

        fetchStats();
        fetchActivity();
    }, []);

    // Dictionary for quick stats configuration with colors
    const stats = [
        {
            title: 'Total Students',
            value: isLoading ? '...' : statsData.total_users.toLocaleString(),
            change: 'Registered Users',
            icon: Users,
            link: '/admin-dashboard/users',
            bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
            iconColor: 'text-blue-600',
        },
        {
            title: 'Active Elections',
            value: isLoading ? '...' : statsData.active_elections,
            change: 'Live',
            icon: Vote,
            link: '/admin-dashboard/elections',
            bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
            iconColor: 'text-purple-600',
        },
        {
            title: 'Market Items',
            value: isLoading ? '...' : statsData.pending_market_items,
            change: 'Available Item(s)',
            icon: ShoppingBag,
            link: '/admin-dashboard/moderation',
            bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
            iconColor: 'text-green-600',
        },
        {
            title: 'Welfare Requests',
            value: isLoading ? '...' : statsData.pending_welfare,
            change: 'Pending Review',
            icon: LifeBuoy,
            link: '/admin-dashboard/welfare',
            bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100',
            iconColor: 'text-orange-600',
        },
        {
            title: 'Resources',
            value: isLoading ? '...' : statsData.total_resources || 0,
            change: 'Academic Files',
            icon: FileText,
            link: '/admin-dashboard/resources/pasco',
            bgColor: 'bg-gradient-to-br from-pink-50 to-pink-100',
            iconColor: 'text-pink-600',
        },
        {
            title: 'Opportunities',
            value: isLoading ? '...' : statsData.total_opportunities || 0,
            change: 'Active',
            icon: Briefcase,
            link: '/admin-dashboard/career',
            bgColor: 'bg-gradient-to-br from-cyan-50 to-cyan-100',
            iconColor: 'text-cyan-600',
        },
        {
            title: 'Events',
            value: isLoading ? '...' : statsData.total_events || 0,
            change: 'Upcoming',
            icon: Calendar,
            link: '/admin-dashboard/events',
            bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100',
            iconColor: 'text-amber-600',
        },
    ];

    // Helper function to get icon based on activity type
    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'user':
                return <UserPlus className="h-4 w-4" />;
            case 'market':
                return <Package className="h-4 w-4" />;
            case 'welfare':
                return <AlertCircle className="h-4 w-4" />;
            case 'lost_found':
                return <Search className="h-4 w-4" />;
            case 'lost_found_resolved':
                return <CheckCircle2 className="h-4 w-4" />;
            default:
                return <Users className="h-4 w-4" />;
        }
    };

    // Helper function to format time
    const formatTime = (isoString: string) => {
        try {
            return formatDistanceToNow(new Date(isoString), { addSuffix: true });
        } catch {
            return 'Recently';
        }
    };

    // Handle Download Report
    const handleDownloadReport = async () => {
        try {
            const response = await api.get('/users/export/users/', {
                responseType: 'blob'
            });

            // Create a blob URL and trigger download
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'dasa_users_report.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('Report downloaded successfully');
        } catch (error) {
            console.error(error);
            const err = error as { response?: { data?: { detail?: string } } };
            toast.error(err.response?.data?.detail || 'Failed to download report');
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Executive Overview</h2>
                <div className="flex items-center space-x-2">
                    <Button onClick={handleDownloadReport} className="cursor-pointer">
                        <Download className="mr-2 h-4 w-4 " />
                        Download Report
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Link href={stat.link} key={stat.title}>
                        <Card className={`transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer ${stat.bgColor}`}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stat.change}
                                </p>
                            </CardContent>
                        </Card>
                        </Link>
                    );
                })}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoadingActivity ? (
                            <div className="space-y-8">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex items-center">
                                        <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
                                        <div className="ml-4 space-y-2 flex-1">
                                            <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                                            <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : activities.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                <Users className="h-12 w-12 mb-2 opacity-20" />
                                <p className="text-sm">No recent activity</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {activities.map((activity, index) => (
                                    <div key={index} className="flex items-center">
                                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            {getActivityIcon(activity.type)}
                                        </div>
                                        <div className="ml-4 space-y-1 flex-1">
                                            <p className="text-sm font-medium leading-none">
                                                {activity.message}
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium text-xs text-muted-foreground whitespace-nowrap">
                                            {formatTime(activity.time)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            Quick Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-2">
                            <Link href="/admin-dashboard/announcements">
                                <Button variant="outline" className="w-full justify-start cursor-pointer">
                                    <Megaphone className="mr-2 h-4 w-4" />
                                    Post Announcement
                                </Button>
                            </Link>
                            <Link href="/admin-dashboard/elections">
                                <Button variant="outline" className="w-full justify-start cursor-pointer">
                                    <Vote className="mr-2 h-4 w-4" />
                                    Create Election
                                </Button>
                            </Link>
                            <Link href="/admin-dashboard/users">
                                <Button variant="outline" className="w-full justify-start cursor-pointer">
                                    <Users className="mr-2 h-4 w-4" />
                                    Manage Users
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
