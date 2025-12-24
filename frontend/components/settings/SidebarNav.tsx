'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/settings', label: 'Profile' },
    { href: '/settings/account', label: 'Account' },
    { href: '/settings/appearance', label: 'Appearance' },
];

export function SidebarNav() {
    const pathname = usePathname();

    return (
        <nav className="flex flex-col space-y-1">
            {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                    <Button
                        variant="ghost"
                        className={cn(
                            'w-full justify-start',
                            pathname === item.href
                                ? 'bg-muted hover:bg-muted'
                                : 'hover:bg-transparent hover:underline'
                        )}
                    >
                        {item.label}
                    </Button>
                </Link>
            ))}
        </nav>
    );
}
