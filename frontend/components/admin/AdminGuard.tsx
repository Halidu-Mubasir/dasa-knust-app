'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2 } from 'lucide-react';

export function AdminGuard({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, isLoading } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/auth/login');
            } else if (!user?.is_staff && !user?.is_superuser) {
                // If authenticated but not staff/superuser, redirect to home
                router.push('/');
            }
        }
    }, [user, isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated || (!user?.is_staff && !user?.is_superuser)) {
        return null; // Don't render anything while redirecting
    }

    return <>{children}</>;
}
