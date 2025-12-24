'use client';

import { useState } from 'react';
import { WelfareReport } from '@/types';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Shield, MapPin, Mail, Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import api from '@/lib/axios';
import { toast } from 'sonner';

interface WelfareDetailSheetProps {
    report: WelfareReport | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate?: () => void;
}

export function WelfareDetailSheet({
    report,
    open,
    onOpenChange,
    onUpdate
}: WelfareDetailSheetProps) {
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    if (!report) return null;

    const handleStatusChange = async (newStatus: string) => {
        setIsUpdatingStatus(true);
        try {
            await api.patch(`/welfare/reports/${report.id}/`, { status: newStatus });
            toast.success('Status updated successfully');
            onUpdate?.();
        } catch (error) {
            const axiosError = error as { response?: { status?: number } }
            if (axiosError.response?.status === 404) {
                toast.error('Report not found. It may have been deleted.');
                onUpdate?.(); // Refresh to sync with server
            } else {
                toast.error('Failed to update status');
            }
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const getStatusBadge = (status: string) => {
        if (status === 'Pending') {
            return <Badge className="bg-yellow-200 text-yellow-900 hover:bg-yellow-200">Pending</Badge>
        }
        if (status === 'Investigating') {
            return <Badge className="bg-blue-200 text-blue-900 hover:bg-blue-200">Investigating</Badge>
        }
        if (status === 'Resolved') {
            return <Badge className="bg-green-200 text-green-900 hover:bg-green-200">Resolved</Badge>
        }
        return <Badge>{status}</Badge>
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        {report.category} Report
                    </SheetTitle>
                    <SheetDescription>
                        Submitted {report.created_at && format(new Date(report.created_at), 'PPP')}
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {/* Status Control */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                            Status Management
                        </h4>
                        <div className="flex items-center gap-3">
                            {getStatusBadge(report.status || 'Pending')}
                            <Select
                                value={report.status || 'Pending'}
                                onValueChange={handleStatusChange}
                                disabled={isUpdatingStatus}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Investigating">Investigating</SelectItem>
                                    <SelectItem value="Resolved">Resolved</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Separator />

                    {/* Reporter Information */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                            Reporter Information
                        </h4>

                        {report.is_anonymous || !report.reporter_details ? (
                            <div className="bg-muted/30 p-4 rounded-lg border border-dashed">
                                <div className="flex items-start gap-3">
                                    <Shield className="h-5 w-5 mt-0.5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium text-sm">Anonymous Submission</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            This report was submitted anonymously. No user data is available.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-muted/30 p-4 rounded-lg">
                                <div className="flex items-center gap-3 mb-3">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={report.reporter_details.avatar || undefined} />
                                        <AvatarFallback>
                                            {report.reporter_details.full_name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{report.reporter_details.full_name}</p>
                                        <p className="text-sm text-muted-foreground">@{report.reporter_details.username}</p>
                                    </div>
                                </div>

                                <div className="space-y-2 mt-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span>{report.reporter_details.email}</span>
                                    </div>

                                    {report.contact_info && (
                                        <div className="mt-3 pt-3 border-t">
                                            <p className="text-xs text-muted-foreground mb-1">Contact Information Provided:</p>
                                            <p className="text-sm">{report.contact_info}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Location */}
                    {report.location && (
                        <>
                            <div className="space-y-3">
                                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                                    Location
                                </h4>
                                <div className="flex items-center gap-2 text-sm bg-muted/30 p-3 rounded-lg">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{report.location}</span>
                                </div>
                            </div>
                            <Separator />
                        </>
                    )}

                    {/* Description - The Core */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                            Report Description
                        </h4>
                        <div className="bg-muted/30 p-4 rounded-lg border">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {report.description}
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Timestamps */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                            Timeline
                        </h4>
                        <div className="space-y-2 text-sm">
                            {report.created_at && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Created:</span>
                                    <span className="text-muted-foreground">
                                        {format(new Date(report.created_at), 'PPP p')}
                                    </span>
                                </div>
                            )}
                            {report.updated_at && report.updated_at !== report.created_at && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Last Updated:</span>
                                    <span className="text-muted-foreground">
                                        {format(new Date(report.updated_at), 'PPP p')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
