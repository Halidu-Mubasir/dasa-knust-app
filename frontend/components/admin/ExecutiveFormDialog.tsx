'use client';

import { useState, useEffect } from 'react';
import { Executive, User } from '@/types';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';
import { toast } from 'sonner';

interface ExecutiveFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    executive: Executive | null;
    onSuccess: () => void;
}

export function ExecutiveFormDialog({
    open,
    onOpenChange,
    executive,
    onSuccess
}: ExecutiveFormDialogProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [usersOpen, setUsersOpen] = useState(false);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [title, setTitle] = useState('');
    const [rank, setRank] = useState('1');
    const [academicYear, setAcademicYear] = useState('2024/2025');
    const [bio, setBio] = useState('');
    const [isCurrent, setIsCurrent] = useState(true);
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [twitterUrl, setTwitterUrl] = useState('');
    const [photo, setPhoto] = useState<File | null>(null);

    // Load users for dropdown
    useEffect(() => {
        const loadUsers = async () => {
            setIsLoadingUsers(true);
            try {
                const response = await api.get('/users/');
                const userData = Array.isArray(response.data) ? response.data : response.data.results || [];
                setUsers(userData);
            } catch (error) {
                console.error('Failed to load users:', error);
            } finally {
                setIsLoadingUsers(false);
            }
        };

        if (open) {
            loadUsers();
        }
    }, [open]);

    // Populate form when editing
    useEffect(() => {
        if (executive) {
            setSelectedUserId(executive.user);
            setTitle(executive.title);
            setRank(executive.rank.toString());
            setAcademicYear(executive.academic_year);
            setBio(executive.bio || '');
            setIsCurrent(executive.is_current);
            setLinkedinUrl(executive.social_links?.linkedin || '');
            setTwitterUrl(executive.social_links?.twitter || '');
            setPhoto(null);
        } else {
            // Reset form for new executive
            setSelectedUserId(null);
            setTitle('');
            setRank('1');
            setAcademicYear('2024/2025');
            setBio('');
            setIsCurrent(true);
            setLinkedinUrl('');
            setTwitterUrl('');
            setPhoto(null);
        }
    }, [executive, open]);

    const handleSubmit = async () => {
        if (!selectedUserId) {
            toast.error('Please select a user');
            return;
        }

        if (!title) {
            toast.error('Please enter a position title');
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('user', selectedUserId.toString());
            formData.append('title', title);
            formData.append('rank', rank);
            formData.append('academic_year', academicYear);
            formData.append('bio', bio);
            formData.append('is_current', isCurrent.toString());

            // Build social_links JSON
            const socialLinks: Record<string, string> = {};
            if (linkedinUrl) socialLinks.linkedin = linkedinUrl;
            if (twitterUrl) socialLinks.twitter = twitterUrl;
            formData.append('social_links', JSON.stringify(socialLinks));

            if (photo) {
                formData.append('official_photo', photo);
            }

            if (executive) {
                // Update existing executive
                await api.patch(`/leadership/${executive.id}/`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Executive updated successfully');
            } else {
                // Create new executive
                await api.post('/leadership/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Executive added successfully');
            }

            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || error.response?.data?.non_field_errors?.[0] || 'Failed to save executive';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedUser = users.find((u) => u.id === selectedUserId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{executive ? 'Edit Executive' : 'Add Executive'}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* User Select */}
                    <div className="grid gap-2">
                        <Label>User</Label>
                        <Popover open={usersOpen} onOpenChange={setUsersOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={usersOpen}
                                    className="w-full justify-between"
                                    disabled={isLoadingUsers}
                                >
                                    {isLoadingUsers ? (
                                        <span className="flex items-center">
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Loading users...
                                        </span>
                                    ) : selectedUser ? (
                                        <span>
                                            {selectedUser.first_name && selectedUser.last_name
                                                ? `${selectedUser.first_name} ${selectedUser.last_name}`
                                                : selectedUser.username}
                                            {selectedUser.profile?.student_id && ` (${selectedUser.profile.student_id})`}
                                        </span>
                                    ) : (
                                        "Select user..."
                                    )}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[400px] p-0">
                                <Command>
                                    <CommandInput placeholder="Search user..." />
                                    <CommandEmpty>No user found.</CommandEmpty>
                                    <CommandList>
                                        <CommandGroup>
                                            {users.map((user) => (
                                                <CommandItem
                                                    key={user.id}
                                                    value={`${user.username} ${user.first_name} ${user.last_name} ${user.profile?.student_id || ''}`}
                                                    onSelect={() => {
                                                        setSelectedUserId(user.id);
                                                        setUsersOpen(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedUserId === user.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    <div>
                                                        <p className="font-medium">
                                                            {user.first_name && user.last_name
                                                                ? `${user.first_name} ${user.last_name}`
                                                                : user.username}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {user.profile?.student_id || user.email}
                                                        </p>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Title */}
                    <div className="grid gap-2">
                        <Label>Position Title</Label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., President"
                        />
                    </div>

                    {/* Rank */}
                    <div className="grid gap-2">
                        <Label>Rank (Sorting Order)</Label>
                        <Input
                            type="number"
                            value={rank}
                            onChange={(e) => setRank(e.target.value)}
                            placeholder="1 = Highest"
                            min="1"
                        />
                    </div>

                    {/* Academic Year */}
                    <div className="grid gap-2">
                        <Label>Academic Year</Label>
                        <Input
                            value={academicYear}
                            onChange={(e) => setAcademicYear(e.target.value)}
                            placeholder="e.g., 2024/2025"
                        />
                    </div>

                    {/* Bio */}
                    <div className="grid gap-2">
                        <Label>Bio / Manifesto Snippet</Label>
                        <Textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Short quote or manifesto snippet"
                            rows={3}
                        />
                    </div>

                    {/* Social Links */}
                    <div className="grid gap-2">
                        <Label>LinkedIn URL</Label>
                        <Input
                            type="url"
                            value={linkedinUrl}
                            onChange={(e) => setLinkedinUrl(e.target.value)}
                            placeholder="https://linkedin.com/in/..."
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Twitter URL</Label>
                        <Input
                            type="url"
                            value={twitterUrl}
                            onChange={(e) => setTwitterUrl(e.target.value)}
                            placeholder="https://twitter.com/..."
                        />
                    </div>

                    {/* Photo Upload */}
                    <div className="grid gap-2">
                        <Label>Official Photo</Label>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                        />
                        {executive?.image_url && !photo && (
                            <p className="text-xs text-muted-foreground">
                                Current photo will be kept if no new file is uploaded
                            </p>
                        )}
                    </div>

                    {/* Is Current */}
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="is_current"
                            checked={isCurrent}
                            onCheckedChange={(checked) => setIsCurrent(checked as boolean)}
                        />
                        <Label htmlFor="is_current" className="cursor-pointer">
                            Is Current Administration?
                        </Label>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} type="button" className="cursor-pointer hover:bg-secondary/90 hover:text-secondary-foreground">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} type="button" className="cursor-pointer hover:bg-primary/90 hover:text-primary-foreground">
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : executive ? (
                            'Update'
                        ) : (
                            'Add Executive'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
