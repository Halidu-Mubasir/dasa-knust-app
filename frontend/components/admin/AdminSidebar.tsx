"use client"

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Users,
    FileText,
    Vote,
    ShieldAlert,
    LifeBuoy,
    Settings,
    Briefcase,
    Megaphone,
    Calendar,
    Image as ImageIcon,
    UserCheck,
    Scale,
} from 'lucide-react';
import { UserNav } from '../layout/UserNav';
import { NotificationBell } from '../layout/NotificationBell';

const navGroups = [
    {
        title: "Overview",
        items: [
            { href: '/admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
        ]
    },
    {
        title: "People",
        items: [
            { href: '/admin-dashboard/users', label: 'Users', icon: Users },
            { href: '/admin-dashboard/leadership', label: 'Leadership', icon: UserCheck },
            { href: '/admin-dashboard/welfare', label: 'Welfare', icon: LifeBuoy },
        ]
    },
    {
        title: "Activities",
        items: [
            { href: '/admin-dashboard/events', label: 'Events', icon: Calendar },
            { href: '/admin-dashboard/elections', label: 'Elections', icon: Vote },
            { href: '/admin-dashboard/gallery', label: 'Gallery', icon: ImageIcon },
        ]
    },
    {
        title: "Communication",
        items: [
            { href: '/admin-dashboard/announcements', label: 'Announcements', icon: Megaphone },
            { href: '/admin-dashboard/moderation', label: 'Market & L&F', icon: ShieldAlert },
        ]
    },
    {
        title: "Resources",
        items: [
            { href: '/admin-dashboard/resources/pasco', label: 'Academics', icon: FileText },
            { href: '/admin-dashboard/career', label: 'Careers', icon: Briefcase },
            { href: '/admin-dashboard/legal', label: 'Constitution', icon: Scale },
        ]
    },
    {
        title: "System",
        items: [
            { href: '/admin-dashboard/settings', label: 'Settings', icon: Settings },
        ]
    }
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="h-full w-full flex flex-col bg-slate-900 text-slate-100 border-r border-slate-800">
            {/* Header with Logo */}
            <div className="p-6 flex items-center gap-3 border-b border-slate-800">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-700">
                    <Image
                        src="/dasa_logo.jpg"
                        alt="DASA"
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                    />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-white">DASA Admin</h3>
            </div>

            {/* Scrollable Navigation - The Middle */}
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {navGroups.map((group, i) => (
                    <div key={i} className="mb-6">
                        <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            {group.title}
                        </h3>
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const isActive = pathname === item.href;
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                                            isActive
                                                ? "bg-primary text-primary-foreground shadow-md"
                                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer: User/Notifs */}
            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center justify-between gap-2 text-white">
                    <NotificationBell className="text-white" />
                    <UserNav />
                </div>
            </div>
        </aside>
    );
}
