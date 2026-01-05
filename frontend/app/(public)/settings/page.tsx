'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { getProxiedImageUrl } from '@/lib/imageProxy';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Upload, Lock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Validation schema matching Django backend
const profileSchema = z.object({
    first_name: z.string().min(2, 'First name must be at least 2 characters').optional().or(z.literal('')),
    last_name: z.string().min(2, 'Last name must be at least 2 characters').optional().or(z.literal('')),
    other_names: z.string().optional().or(z.literal('')),
    phone_number: z.string().min(10, 'Phone number must be at least 10 digits').optional().or(z.literal('')),
    student_id: z.string().optional().or(z.literal('')),
    gender: z.enum(['M', 'F', '']).optional(),
    program_of_study: z.string().optional().or(z.literal('')),
    hometown: z.string().optional().or(z.literal('')),
    hall_of_residence: z.enum(['Katanga', 'Conti', 'Queens', 'Republic', 'Africa', 'Indece', 'Off-Campus', '']).optional(),
    college: z.enum(['CoS', 'CoE', 'CoHS', 'CABE', 'CoHSS', 'CANR', '']).optional(),
    year_group: z.string().optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function SettingsProfileContent() {
    const { user, setUser } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Password change state
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            first_name: '',
            last_name: '',
            other_names: '',
            phone_number: '',
            student_id: '',
            gender: '',
            program_of_study: '',
            hometown: '',
            hall_of_residence: '',
            college: '',
            year_group: '',
        },
    });

    // Fetch user data on mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const { data } = await api.get('/users/me/');

                // Reset form with fetched data
                form.reset({
                    first_name: data.first_name || '',
                    last_name: data.last_name || '',
                    other_names: data.profile?.other_names || '',
                    phone_number: data.phone_number || '',
                    student_id: data.profile?.student_id || '',
                    gender: data.profile?.gender || '',
                    program_of_study: data.profile?.program_of_study || '',
                    hometown: data.profile?.hometown || '',
                    hall_of_residence: data.profile?.hall_of_residence || '',
                    college: data.profile?.college || '',
                    year_group: data.profile?.year_group?.toString() || '',
                });

                // Set preview URL if profile picture exists
                if (data.profile?.profile_picture_url || data.profile?.profile_picture) {
                    const pictureUrl = data.profile.profile_picture_url || data.profile.profile_picture;
                    setPreviewUrl(getProxiedImageUrl(pictureUrl) || '');
                }

                // Update user in store
                setUser(data);
            } catch (error) {
                console.error('Error fetching user data:', error);
                toast.error('Failed to load profile data');
            } finally {
                setIsFetching(false);
            }
        };

        if (user) {
            fetchUserData();
        }
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (data: ProfileFormValues) => {
        setIsLoading(true);

        try {
            const formData = new FormData();

            // Append User model fields (first_name, last_name, phone_number)
            if (data.first_name) formData.append('first_name', data.first_name);
            if (data.last_name) formData.append('last_name', data.last_name);
            if (data.phone_number) formData.append('phone_number', data.phone_number);

            // Append Profile model fields (Flat structure)
            const profileFields = ['student_id', 'other_names', 'gender', 'program_of_study', 'hometown', 'hall_of_residence', 'college', 'year_group'];
            profileFields.forEach((key) => {
                const value = (data as any)[key];
                if (value) {
                    formData.append(key, value);
                }
            });

            // Append profile picture if selected
            if (selectedImage) {
                formData.append('profile_picture', selectedImage);
            }

            // Use PATCH as requested
            const response = await api.patch('/users/me/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Update user in store
            setUser(response.data);

            toast.success('Profile updated successfully!');
        } catch (error: any) {
            console.error('Profile update error:', error.response?.data || error);

            if (error.response?.data) {
                const errors = error.response.data;
                Object.keys(errors).forEach((key) => {
                    const messages = errors[key];
                    if (Array.isArray(messages)) {
                        messages.forEach((msg) => toast.error(`${key}: ${msg}`));
                    } else {
                        toast.error(`${key}: ${messages}`);
                    }
                });
            } else {
                toast.error('Failed to update profile');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!passwordForm.old_password || !passwordForm.new_password || !passwordForm.confirm_password) {
            toast.error('All fields are required');
            return;
        }

        if (passwordForm.new_password !== passwordForm.confirm_password) {
            toast.error('New passwords do not match');
            return;
        }

        if (passwordForm.new_password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        setIsPasswordLoading(true);

        const payload = {
            old_password: passwordForm.old_password,
            new_password: passwordForm.new_password,
            confirm_password: passwordForm.confirm_password
        };

        console.log('Password change payload:', payload);
        console.log('Password form state:', passwordForm);

        try {
            await api.post('/auth/change-password/', payload);
            toast.success('Password changed successfully');
            setPasswordForm({
                old_password: '',
                new_password: '',
                confirm_password: ''
            });
        } catch (error: any) {
            console.error(error);
            const errorMessage = error.response?.data?.error || error.response?.data?.detail || 'Failed to change password';
            toast.error(errorMessage);
        } finally {
            setIsPasswordLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Profile</h3>
                <p className="text-sm text-muted-foreground">
                    Update your personal information and profile picture.
                </p>
            </div>
            <Separator />

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Profile Picture Section */}
                    <div className="flex items-center space-x-4">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={previewUrl || undefined} alt={user?.username || 'Profile'} />
                            <AvatarFallback className="text-2xl">
                                {user?.username?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                className="hidden"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                Change Photo
                            </Button>
                            <p className="text-sm text-muted-foreground mt-2">
                                JPG, PNG or GIF. Max size 5MB.
                            </p>
                        </div>
                    </div>

                    {/* Read-only fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                                <Input value={user?.username || ''} disabled />
                            </FormControl>
                            <FormDescription>Your username cannot be changed.</FormDescription>
                        </FormItem>

                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input value={user?.email || ''} disabled />
                            </FormControl>
                            <FormDescription>Your email address cannot be changed.</FormDescription>
                        </FormItem>
                    </div>

                    {/* Editable fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="first_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your first name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="last_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your last name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="other_names"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Other Names (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Middle name or nickname" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone_number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="0XX XXX XXXX" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="student_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Student ID</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your student ID" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Gender</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select your gender" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="M">Male</SelectItem>
                                            <SelectItem value="F">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="program_of_study"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Program of Study</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., BSc. Computer Science" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="hometown"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Hometown</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your hometown" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="year_group"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Year Group</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., 2024" type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="hall_of_residence"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Hall of Residence</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select your hall" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Katanga">Katanga</SelectItem>
                                            <SelectItem value="Conti">Conti</SelectItem>
                                            <SelectItem value="Queens">Queens</SelectItem>
                                            <SelectItem value="Republic">Republic</SelectItem>
                                            <SelectItem value="Africa">Africa</SelectItem>
                                            <SelectItem value="Indece">Indece</SelectItem>
                                            <SelectItem value="Off-Campus">Off-Campus</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="college"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>College</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select your college" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="CoS">College of Science (CoS)</SelectItem>
                                            <SelectItem value="CoE">College of Engineering (CoE)</SelectItem>
                                            <SelectItem value="CoHS">College of Health Sciences (CoHS)</SelectItem>
                                            <SelectItem value="CABE">College of Art & Built Environment (CABE)</SelectItem>
                                            <SelectItem value="CoHSS">College of Humanities & Social Sciences (CoHSS)</SelectItem>
                                            <SelectItem value="CANR">College of Agriculture & Natural Resources (CANR)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            'Update Profile'
                        )}
                    </Button>
                </form>
            </Form>

            {/* Password Change Section */}
            <div className="space-y-6 mt-8">
                <div>
                    <h3 className="text-lg font-medium">Change Password</h3>
                    <p className="text-sm text-muted-foreground">
                        Update your password to keep your account secure.
                    </p>
                </div>
                <Separator />

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Lock className="mr-2 h-5 w-5" />
                            Password Settings
                        </CardTitle>
                        <CardDescription>
                            Enter your current password and choose a new one.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Current Password
                                </label>
                                <Input
                                    type="password"
                                    placeholder="Enter your current password"
                                    value={passwordForm.old_password}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    New Password
                                </label>
                                <Input
                                    type="password"
                                    placeholder="Enter your new password"
                                    value={passwordForm.new_password}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                                    required
                                />
                                <p className="text-sm text-muted-foreground">
                                    Password must be at least 8 characters long.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Confirm New Password
                                </label>
                                <Input
                                    type="password"
                                    placeholder="Confirm your new password"
                                    value={passwordForm.confirm_password}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                                    required
                                />
                            </div>

                            <Button type="submit" disabled={isPasswordLoading}>
                                {isPasswordLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Changing Password...
                                    </>
                                ) : (
                                    'Change Password'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function SettingsProfilePage() {
    return (
        <AuthGuard>
            <SettingsProfileContent />
        </AuthGuard>
    );
}
