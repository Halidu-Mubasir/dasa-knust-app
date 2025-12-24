'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export function AuthInit() {
    const initialize = useAuthStore((state) => state.initialize);

    useEffect(() => {
        initialize();
    }, [initialize]);

    return null;
}
