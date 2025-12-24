'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2 } from 'lucide-react';

interface GuestGuardProps {
    children: React.ReactNode;
}

export function GuestGuard({ children }: GuestGuardProps) {
    const router = useRouter();
    const { isAuthenticated, isLoading, user } = useAuthStore();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            if (user?.is_staff) {
                router.replace('/admin-dashboard');
            } else {
                router.replace('/');
            }
        }
    }, [isAuthenticated, isLoading, user, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-lg text-muted-foreground">Checking authorization...</p>
                </div>
            </div>
        );
    }

    if (isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-lg text-muted-foreground">Redirecting...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
