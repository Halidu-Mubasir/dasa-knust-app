'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuthStore } from '@/store/useAuthStore';
import { AuthGuard } from '@/components/layout/AuthGuard';
import api from '@/lib/axios';
import { User } from '@/types';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PageHeader } from '@/components/ui/PageHeader';
import { Loader2 } from 'lucide-react';

function IDCardContent() {
    const { user } = useAuthStore();
    const [userData, setUserData] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const { data } = await api.get<User>('/users/me/');
                setUserData(data);
            } catch (err) {
                console.error('Error fetching user data:', err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchUserData();
        }
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading your ID card...</p>
                </div>
            </div>
        );
    }

    if (!userData || !userData.profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Card className="p-8 text-center bg-card">
                    <p className="text-muted-foreground">No profile data found</p>
                </Card>
            </div>
        );
    }

    const { profile } = userData;
    const qrData = JSON.stringify({
        id: profile.student_id,
        name: `${userData.first_name} ${userData.last_name}`,
        valid: true
    });

    return (
        <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-primary/5 to-purple-500/5 dark:from-primary/10 dark:to-purple-500/10">
            {/* Added PageHeader as requested */}
            <div className="container mx-auto mb-8">
                <PageHeader title="Digital ID" description="Your official membership card" />
            </div>

            <div className="flex justify-center">
                <div className="w-full max-w-md">

                    {/* ID Card */}
                    <div className="relative">
                        {/* Credit card style with gradient */}
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                            {/* Background gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary via-purple-600 to-pink-600"></div>

                            {/* Glassmorphism overlay */}
                            <div className="relative backdrop-blur-sm bg-white/10 p-8">
                                {/* Header */}
                                <div className="text-white mb-6">
                                    <h2 className="text-2xl font-bold">DASA</h2>
                                    <p className="text-sm opacity-90">Dagomba Students Association</p>
                                </div>

                                {/* Profile Section */}
                                <div className="flex items-start gap-6 mb-6">
                                    <Avatar className="h-24 w-24 border-4 border-yellow-400 shadow-lg">
                                        <AvatarImage
                                            src={profile.profile_picture || undefined}
                                            alt={`${userData.first_name} ${userData.last_name}`}
                                        />
                                        <AvatarFallback className="bg-white/20 text-white text-2xl">
                                            {userData.first_name?.[0]}{userData.last_name?.[0]}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 text-white">
                                        <h3 className="text-xl font-bold mb-1">
                                            {userData.first_name} {userData.last_name}
                                        </h3>
                                        <p className="text-sm opacity-90 mb-1">{profile.student_id}</p>
                                        <p className="text-xs opacity-80">{profile.program_of_study}</p>
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-4 mb-6 text-white">
                                    <div>
                                        <p className="text-xs opacity-70">College</p>
                                        <p className="text-sm font-semibold">{profile.college}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs opacity-70">Year Group</p>
                                        <p className="text-sm font-semibold">{profile.year_group}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs opacity-70">Hall</p>
                                        <p className="text-sm font-semibold">{profile.hall_of_residence}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs opacity-70">Hometown</p>
                                        <p className="text-sm font-semibold">{profile.hometown}</p>
                                    </div>
                                </div>

                                {/* QR Code */}
                                <div className="flex justify-center">
                                    <div className="bg-white p-3 rounded-lg shadow-lg">
                                        <QRCodeSVG value={qrData} size={120} level="H" />
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="mt-6 text-center text-white text-xs opacity-70">
                                    <p>Valid Membership Card</p>
                                    <p>KNUST - Kumasi, Ghana</p>
                                </div>
                            </div>
                        </div>

                        {/* Card shine effect */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/0 via-white/20 to-white/0 pointer-events-none"></div>
                    </div>

                    {/* Instructions */}
                    <Card className="mt-6 p-4 bg-card">
                        <p className="text-sm text-center text-muted-foreground">
                            Show this digital ID card at DASA events and activities
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function IDCardPage() {
    return (
        <AuthGuard>
            <IDCardContent />
        </AuthGuard>
    );
}
