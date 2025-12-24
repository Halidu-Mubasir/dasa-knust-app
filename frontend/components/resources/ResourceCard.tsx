'use client';

import { AcademicResource } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/axios';
import { toast } from 'sonner';

interface ResourceCardProps {
    resource: AcademicResource;
    onDownload?: (resource: AcademicResource) => void;
}

export function ResourceCard({ resource, onDownload }: ResourceCardProps) {
    const handleDownload = async () => {
        try {
            // Call the download action endpoint
            const { data } = await api.post(`/resources/${resource.id}/download/`);

            // Open file in new tab
            if (resource.file_url) {
                window.open(resource.file_url, '_blank');
            }

            toast.success('Download started', {
                description: `${resource.title} - ${data.downloads} total downloads`
            });

            // Callback to parent component
            if (onDownload) {
                onDownload({ ...resource, downloads: data.downloads });
            }
        } catch (err) {
            console.error('Download error:', err);
            toast.error('Download failed', {
                description: 'Unable to download the resource. Please try again.'
            });
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">
                            <FileText className="h-8 w-8 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg mb-1">{resource.title}</CardTitle>
                            <p className="text-sm text-muted-foreground font-mono">
                                {resource.course_code}
                            </p>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary">{resource.college_display}</Badge>
                    <Badge variant="outline">Level {resource.level}</Badge>
                    <Badge variant="outline">{resource.semester_display}</Badge>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        <span>{resource.downloads} downloads</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(resource.uploaded_at)}</span>
                    </div>
                </div>
            </CardContent>

            <CardFooter>
                <Button onClick={handleDownload} className="w-full" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Resource
                </Button>
            </CardFooter>
        </Card>
    );
}
