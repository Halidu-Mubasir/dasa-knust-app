'use client';

import { User } from '@/types';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
    ShieldCheck,
    ShieldAlert,
    Mail,
    Phone,
    Calendar,
    MapPin,
    Building2,
    GraduationCap,
    Home,
    User as UserIcon,
    Ban,
    ShieldOff,
    Check,
} from 'lucide-react';
import { format } from 'date-fns';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { useState } from 'react';

interface UserDetailSheetProps {
    user: User | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUserUpdate?: () => void;
}

export function UserDetailSheet({ user, open, onOpenChange, onUserUpdate }: UserDetailSheetProps) {
    const [isUpdating, setIsUpdating] = useState(false);

    if (!user) return null;

    const handlePromoteToAdmin = async () => {
        setIsUpdating(true);
        try {
            await api.patch(`/users/${user.id}/`, { is_staff: !user.is_staff });
            toast.success(user.is_staff ? 'User demoted to Student' : 'User promoted to Admin');
            onUserUpdate?.();
            onOpenChange(false);
        } catch (error) {
            toast.error('Failed to update role');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleBanUser = async () => {
        setIsUpdating(true);
        try {
            await api.patch(`/users/${user.id}/`, { is_active: !user.is_active });
            toast.success(user.is_active ? 'User banned successfully' : 'User unbanned successfully');
            onUserUpdate?.();
            onOpenChange(false);
        } catch (error) {
            toast.error('Failed to update user status');
        } finally {
            setIsUpdating(false);
        }
    };

    const getRoleBadge = () => {
        if (user.is_superuser) {
            return (
                <Badge variant="destructive" className="flex w-fit items-center gap-1">
                    <ShieldAlert className="h-3 w-3" /> Superuser
                </Badge>
            );
        }
        if (user.is_staff) {
            return (
                <Badge variant="default" className="flex w-fit items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Admin
                </Badge>
            );
        }
        return <Badge variant="secondary">Student</Badge>;
    };

    const getStatusBadge = () => {
        if (user.is_active === false) {
            return <Badge variant="destructive">Banned</Badge>;
        }
        return <Badge variant="default" className="bg-green-600">Active</Badge>;
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>User Details</SheetTitle>
                    <SheetDescription>
                        Complete information about this user
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {/* Profile Header */}
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={user.profile?.profile_picture || undefined} />
                            <AvatarFallback className="text-lg">
                                {user.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold">{user.username}</h3>
                            {user.first_name && user.last_name && (
                                <p className="text-sm text-muted-foreground">
                                    {user.first_name} {user.profile?.other_names || ''} {user.last_name}
                                </p>
                            )}
                            <div className="flex gap-2 mt-2">
                                {getRoleBadge()}
                                {getStatusBadge()}
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Contact Information */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                            Contact Information
                        </h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{user.email}</span>
                            </div>
                            {user.phone_number && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{user.phone_number}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Academic Information */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                            Academic Information
                        </h4>
                        <div className="space-y-2">
                            {user.profile?.student_id && (
                                <div className="flex items-center gap-2 text-sm">
                                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Student ID:</span>
                                    <span>{user.profile.student_id}</span>
                                </div>
                            )}
                            {user.profile?.college && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">College:</span>
                                    <span>{user.profile.college}</span>
                                </div>
                            )}
                            {user.profile?.program_of_study && (
                                <div className="flex items-center gap-2 text-sm">
                                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Program:</span>
                                    <span>{user.profile.program_of_study}</span>
                                </div>
                            )}
                            {user.profile?.year_group && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Year Group:</span>
                                    <span>{user.profile.year_group}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Residence Information */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                            Residence Information
                        </h4>
                        <div className="space-y-2">
                            {user.profile?.hall_of_residence && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Home className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Hall:</span>
                                    <span>{user.profile.hall_of_residence}</span>
                                </div>
                            )}
                            {user.profile?.hometown && (
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Hometown:</span>
                                    <span>{user.profile.hometown}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Account Status */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                            Account Status
                        </h4>
                        <div className="space-y-2">
                            {user.date_joined && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Joined:</span>
                                    <span>{format(new Date(user.date_joined), 'PPP')}</span>
                                </div>
                            )}
                            {user.last_login && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Last Login:</span>
                                    <span>{format(new Date(user.last_login), 'PPP')}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium">Student:</span>
                                <span>{user.is_student ? <Check className="h-4 w-4 text-green-600" /> : '—'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium">Alumni:</span>
                                <span>{user.is_alumni ? <Check className="h-4 w-4 text-green-600" /> : '—'}</span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Admin Actions */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                            Admin Actions
                        </h4>
                        <div className="space-y-2">
                            {!user.is_superuser && (
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={handlePromoteToAdmin}
                                    disabled={isUpdating}
                                >
                                    {user.is_staff ? (
                                        <>
                                            <ShieldOff className="mr-2 h-4 w-4" />
                                            Demote to Student
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck className="mr-2 h-4 w-4" />
                                            Promote to Admin
                                        </>
                                    )}
                                </Button>
                            )}
                            {!user.is_superuser && (
                                <Button
                                    variant="destructive"
                                    className="w-full justify-start"
                                    onClick={handleBanUser}
                                    disabled={isUpdating}
                                >
                                    <Ban className="mr-2 h-4 w-4" />
                                    {user.is_active ? 'Ban User' : 'Unban User'}
                                </Button>
                            )}
                            {user.is_superuser && (
                                <p className="text-xs text-muted-foreground">
                                    Superuser accounts cannot be modified.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
