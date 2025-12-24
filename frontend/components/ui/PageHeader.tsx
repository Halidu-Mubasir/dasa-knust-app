'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
    title: string;
    description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
    const router = useRouter();

    return (
        <div className="flex items-center gap-4 mb-8">
            <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-10 w-10 shrink-0"
                onClick={() => router.back()}
            >
                <ArrowLeft className="h-6 w-6" />
                <span className="sr-only">Go back</span>
            </Button>
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
                {description && (
                    <p className="text-muted-foreground mt-1">{description}</p>
                )}
            </div>
        </div>
    );
}
