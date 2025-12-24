'use client';

import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/store/useAuthStore';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Check, Moon, Sun, Monitor, CreditCard, LifeBuoy, ShieldCheck } from 'lucide-react';

export function UserNav() {
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuthStore();
    const { theme, setTheme } = useTheme();

    // If user is not logged in, return null (Navbar will show Login/Join buttons)
    if (!isAuthenticated || !user) {
        return null;
    }

    const getInitials = (name: string) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const displayName = user.first_name && user.last_name
        ? `${user.first_name} ${user.last_name}`
        : user.username;

    const themes = [
        { value: 'light', label: 'Light', icon: Sun },
        { value: 'dark', label: 'Dark', icon: Moon },
        { value: 'system', label: 'System', icon: Monitor },
    ];

    // Get profile picture URL
    const profilePicture = user.profile?.profile_picture || '';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full cursor-pointer">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={profilePicture} alt={displayName} />
                        <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Admin Dashboard Link - Only shown to staff/superuser */}
                {(user.is_staff || user.is_superuser) && (
                    <>
                        <DropdownMenuGroup>
                            <DropdownMenuItem
                                onClick={() => router.push('/admin-dashboard')}
                                className="bg-primary/5 hover:bg-primary/10 cursor-pointer"
                            >
                                <ShieldCheck className="mr-2 h-4 w-4 text-primary" />
                                <span className="font-semibold text-primary">Admin Dashboard</span>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                    </>
                )}

                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => router.push('/settings')}>
                        My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/id-card')}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Digital ID Card</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <div className="flex items-center justify-between w-full">
                            <span>My Dues</span>
                            <span className="ml-2 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                Coming Soon
                            </span>
                        </div>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <Monitor className="mr-2 h-4 w-4" />
                            <span>Appearance</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                            {themes.map((themeOption) => {
                                const Icon = themeOption.icon;
                                return (
                                    <DropdownMenuItem
                                        key={themeOption.value}
                                        onClick={() => setTheme(themeOption.value)}
                                    >
                                        <Icon className="mr-2 h-4 w-4" />
                                        <span>{themeOption.label}</span>
                                        {theme === themeOption.value && (
                                            <Check className="ml-auto h-4 w-4" />
                                        )}
                                    </DropdownMenuItem>
                                );
                            })}
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => router.push('/welfare')}>
                        <LifeBuoy className="mr-2 h-4 w-4" />
                        <span>Welfare Support</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={() => {
                        logout();
                        router.push('/');
                    }}
                >
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
