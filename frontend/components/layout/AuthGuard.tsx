'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
    children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, isLoading } = useAuthStore();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            // Redirect to login with next parameter
            const loginUrl = `/auth/login?next=${encodeURIComponent(pathname)}`;
            router.push(loginUrl);
        }
    }, [isAuthenticated, isLoading, router, pathname]);

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-lg text-muted-foreground">Verifying authentication...</p>
                </div>
            </div>
        );
    }

    // Don't render anything if not authenticated (redirect is happening)
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-lg text-muted-foreground">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    // Render protected content
    return <>{children}</>;
}
