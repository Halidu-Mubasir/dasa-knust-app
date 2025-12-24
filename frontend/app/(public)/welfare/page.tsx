'use client';

import { useState } from 'react';
import { WelfareReport } from '@/types';
import api from '@/lib/axios';
import { PageHeader } from '@/components/ui/PageHeader';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Heart, Shield, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = [
    { value: 'Harassment', label: 'Harassment' },
    { value: 'Academic', label: 'Academic Issues' },
    { value: 'Accommodation', label: 'Accommodation' },
    { value: 'Financial', label: 'Financial Difficulty' },
    { value: 'Other', label: 'Other' },
];

function WelfareContent() {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<WelfareReport>({
        category: 'Other',
        description: '',
        location: '',
        is_anonymous: false,
        contact_info: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.description.trim()) {
            toast.error('Please provide a description');
            return;
        }

        try {
            setLoading(true);

            // Prepare data - remove contact_info if anonymous
            const submitData: WelfareReport = {
                ...formData,
                contact_info: formData.is_anonymous ? undefined : formData.contact_info,
            };

            await api.post('/welfare/reports/', submitData);

            setSubmitted(true);
            toast.success('Report submitted successfully', {
                description: 'The Welfare Committee will review your submission.',
            });
        } catch (err: any) {
            console.error('Error submitting report:', err);
            toast.error('Failed to submit report', {
                description: err.response?.data?.detail || 'Please try again later.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setSubmitted(false);
        setFormData({
            category: 'Other',
            description: '',
            location: '',
            is_anonymous: false,
            contact_info: '',
        });
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 flex items-center justify-center p-4">
                <Card className="max-w-lg w-full">
                    <CardContent className="pt-12 pb-8 text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="rounded-full bg-green-100 p-4">
                                <CheckCircle2 className="h-12 w-12 text-green-600" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold mb-3">Thank You</h2>
                        <p className="text-muted-foreground mb-6">
                            Your report has been securely received by the Welfare Committee. We take all submissions seriously and will handle your report with the utmost care and confidentiality.
                        </p>
                        <p className="text-sm text-muted-foreground mb-6">
                            {formData.is_anonymous
                                ? 'Your report was submitted anonymously.'
                                : 'We may reach out to you if additional information is needed.'}
                        </p>
                        <Button onClick={handleReset} variant="outline">
                            Submit Another Report
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 py-12 px-4">
            <div className="container mx-auto max-w-3xl">
                {/* Header */}
                {/* Header */}
                <PageHeader
                    title="Welfare & Support"
                    description="Your safety and well-being are our priority. Reports are handled with strict confidentiality by the DASA Welfare Committee."
                />

                {/* Info Card */}
                <Card className="mb-8 border-blue-200 bg-blue-50/50">
                    <CardContent className="pt-6">
                        <div className="flex gap-3">
                            <Shield className="h-5 w-5 text-blue-600 shrink-0 mt-1" />
                            <div className="text-sm text-gray-700">
                                <p className="font-medium mb-1">Confidentiality Guarantee</p>
                                <p>
                                    All reports are encrypted and accessible only to authorized Welfare Committee members. You can submit anonymously if you prefer.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Submit a Report</CardTitle>
                        <CardDescription>
                            Please provide as much detail as you're comfortable sharing. This helps us understand and address the issue effectively.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Anonymous Toggle */}
                            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                                <div className="space-y-0.5">
                                    <Label htmlFor="anonymous" className="text-base font-medium">
                                        Submit Anonymously
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Your identity will not be recorded
                                    </p>
                                </div>
                                <Switch
                                    id="anonymous"
                                    checked={formData.is_anonymous}
                                    onCheckedChange={(checked) =>
                                        setFormData({ ...formData, is_anonymous: checked })
                                    }
                                />
                            </div>

                            {/* Category */}
                            <div className="space-y-2">
                                <Label htmlFor="category">Category *</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value: any) =>
                                        setFormData({ ...formData, category: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map((cat) => (
                                            <SelectItem key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description *</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Please describe the issue in detail..."
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    rows={6}
                                    className="resize-none"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Include relevant details such as what happened, when, and any other pertinent information.
                                </p>
                            </div>

                            {/* Location */}
                            <div className="space-y-2">
                                <Label htmlFor="location">Location (Optional)</Label>
                                <Input
                                    id="location"
                                    placeholder="e.g., Katanga Block B, Library, etc."
                                    value={formData.location}
                                    onChange={(e) =>
                                        setFormData({ ...formData, location: e.target.value })
                                    }
                                />
                            </div>

                            {/* Contact Info - Only if not anonymous */}
                            {!formData.is_anonymous && (
                                <div className="space-y-2">
                                    <Label htmlFor="contact_info">Contact Information (Optional)</Label>
                                    <Input
                                        id="contact_info"
                                        placeholder="Email or phone number for follow-up"
                                        value={formData.contact_info}
                                        onChange={(e) =>
                                            setFormData({ ...formData, contact_info: e.target.value })
                                        }
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Provide this if you'd like us to contact you about your report.
                                    </p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button type="submit" className="w-full" size="lg" disabled={loading}>
                                {loading ? 'Submitting...' : 'Submit Report'}
                            </Button>

                            <p className="text-xs text-center text-muted-foreground">
                                By submitting this form, you acknowledge that the information will be reviewed by the DASA Welfare Committee.
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function WelfarePage() {
    return (
        <AuthGuard>
            <WelfareContent />
        </AuthGuard>
    );
}
