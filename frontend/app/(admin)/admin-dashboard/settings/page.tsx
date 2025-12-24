"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Download, Database, Shield, AlertTriangle, Check } from "lucide-react"
import api from "@/lib/axios"
import { toast } from "sonner"
import { SystemConfig } from "@/types"

export default function SettingsPage() {
    // Password Change State
    const [passwordForm, setPasswordForm] = useState({
        current_password: "",
        new_password: "",
        confirm_password: ""
    })
    const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false)

    // System Config State
    const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null)
    const [isConfigLoading, setIsConfigLoading] = useState(true)
    const [isConfigSubmitting, setIsConfigSubmitting] = useState(false)

    // Fetch System Config
    const fetchSystemConfig = async () => {
        try {
            const res = await api.get('/users/system-config/')
            setSystemConfig(res.data)
        } catch (error) {
            console.error(error)
            toast.error("Failed to load system configuration")
        } finally {
            setIsConfigLoading(false)
        }
    }

    useEffect(() => {
        fetchSystemConfig()
    }, [])

    // Handle Password Change
    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        if (!passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password) {
            toast.error("Please fill all password fields")
            return
        }

        if (passwordForm.new_password !== passwordForm.confirm_password) {
            toast.error("New passwords do not match")
            return
        }

        if (passwordForm.new_password.length < 8) {
            toast.error("Password must be at least 8 characters")
            return
        }

        setIsPasswordSubmitting(true)

        try {
            await api.post('/auth/change-password/', {
                old_password: passwordForm.current_password,
                new_password: passwordForm.new_password,
                confirm_password: passwordForm.confirm_password
            })
            toast.success("Password changed successfully")
            setPasswordForm({
                current_password: "",
                new_password: "",
                confirm_password: ""
            })
        } catch (error: any) {
            console.error(error)
            const errorMessage = error.response?.data?.error || error.response?.data?.detail || "Failed to change password"
            toast.error(errorMessage)
        } finally {
            setIsPasswordSubmitting(false)
        }
    }

    // Handle System Config Update
    const handleSystemConfigUpdate = async () => {
        if (!systemConfig) return

        setIsConfigSubmitting(true)

        try {
            const res = await api.patch('/users/system-config/', {
                maintenance_mode: systemConfig.maintenance_mode,
                allow_registration: systemConfig.allow_registration,
                current_academic_year: systemConfig.current_academic_year,
                current_semester: systemConfig.current_semester,
            })
            setSystemConfig(res.data)
            toast.success("System configuration updated successfully")
        } catch (error: any) {
            console.error(error)
            toast.error(error.response?.data?.detail || "Failed to update configuration")
        } finally {
            setIsConfigSubmitting(false)
        }
    }

    // Handle CSV Downloads
    const handleDownloadUsers = async () => {
        try {
            const response = await api.get('/users/export/users/', {
                responseType: 'blob'
            })

            // Create a blob URL and trigger download
            const blob = new Blob([response.data], { type: 'text/csv' })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'users_export.csv')
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)

            toast.success("User data downloaded successfully")
        } catch (error: any) {
            console.error(error)
            toast.error(error.response?.data?.detail || "Failed to download user data")
        }
    }

    const handleDownloadElectionData = () => {
        // TODO: Implement election data export endpoint
        toast.info("Election data export will be available soon")
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">Manage your admin account and system configuration.</p>
            </div>

            <Tabs defaultValue="account" className="space-y-6">
                <TabsList className="flex w-full justify-start overflow-x-auto rounded-md bg-muted p-1">
                    <TabsTrigger value="account" className="min-w-[120px]">My Account</TabsTrigger>
                    <TabsTrigger value="system" className="min-w-[120px]">System Controls</TabsTrigger>
                    <TabsTrigger value="export" className="min-w-[120px]">Data Export</TabsTrigger>
                </TabsList>

                {/* Tab 1: My Account */}
                <TabsContent value="account" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Change Password
                            </CardTitle>
                            <CardDescription>Update your admin account password.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="current_password">Current Password</Label>
                                    <Input
                                        id="current_password"
                                        type="password"
                                        value={passwordForm.current_password}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                                        placeholder="Enter current password"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="new_password">New Password</Label>
                                    <Input
                                        id="new_password"
                                        type="password"
                                        value={passwordForm.new_password}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                                        placeholder="Enter new password (min 8 characters)"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirm_password">Confirm New Password</Label>
                                    <Input
                                        id="confirm_password"
                                        type="password"
                                        value={passwordForm.confirm_password}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                                        placeholder="Confirm new password"
                                    />
                                </div>

                                <Button type="submit" disabled={isPasswordSubmitting}>
                                    {isPasswordSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Update Password
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab 2: System Controls */}
                <TabsContent value="system" className="space-y-6">
                    {isConfigLoading ? (
                        <Card>
                            <CardContent className="flex h-[400px] items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </CardContent>
                        </Card>
                    ) : systemConfig ? (
                        <>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                                        System Controls
                                    </CardTitle>
                                    <CardDescription>
                                        Control system-wide features and access. Changes take effect immediately.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Maintenance Mode */}
                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="maintenance_mode" className="text-base font-semibold">
                                                Maintenance Mode
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                Shut down user access temporarily. Admins can still access the system.
                                            </p>
                                            <p className="text-xs text-orange-600 mt-2">
                                                ⚠️ TODO: Implement middleware to check maintenance_mode and restrict user access
                                            </p>
                                        </div>
                                        <Switch
                                            id="maintenance_mode"
                                            checked={systemConfig.maintenance_mode}
                                            onCheckedChange={(checked) =>
                                                setSystemConfig({ ...systemConfig, maintenance_mode: checked })
                                            }
                                        />
                                    </div>

                                    {/* Allow Registration */}
                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="allow_registration" className="text-base font-semibold">
                                                Allow Registration
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                Prevent new users from signing up. Existing users can still login.
                                            </p>
                                            <p className="text-xs text-orange-600 mt-2">
                                                ⚠️ TODO: Implement registration guard to check allow_registration before signup
                                            </p>
                                        </div>
                                        <Switch
                                            id="allow_registration"
                                            checked={systemConfig.allow_registration}
                                            onCheckedChange={(checked) =>
                                                setSystemConfig({ ...systemConfig, allow_registration: checked })
                                            }
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Academic Context</CardTitle>
                                    <CardDescription>
                                        Configure the current academic year and semester for the system.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="academic_year">Current Academic Year</Label>
                                            <Input
                                                id="academic_year"
                                                value={systemConfig.current_academic_year}
                                                onChange={(e) =>
                                                    setSystemConfig({ ...systemConfig, current_academic_year: e.target.value })
                                                }
                                                placeholder="e.g., 2024/2025"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="current_semester">Current Semester</Label>
                                            <Select
                                                value={systemConfig.current_semester.toString()}
                                                onValueChange={(value) =>
                                                    setSystemConfig({
                                                        ...systemConfig,
                                                        current_semester: parseInt(value) as 1 | 2
                                                    })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select semester" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="1">Semester 1</SelectItem>
                                                    <SelectItem value="2">Semester 2</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex items-center gap-4">
                                <Button
                                    onClick={handleSystemConfigUpdate}
                                    disabled={isConfigSubmitting}
                                    className="w-fit"
                                >
                                    {isConfigSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Check className="mr-2 h-4 w-4" />
                                    Save Changes
                                </Button>
                                <p className="text-xs text-muted-foreground">
                                    Last updated: {new Date(systemConfig.updated_at).toLocaleString()}
                                </p>
                            </div>
                        </>
                    ) : (
                        <Card>
                            <CardContent className="flex h-[400px] items-center justify-center">
                                <p className="text-muted-foreground">Failed to load system configuration</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Tab 3: Data Export */}
                <TabsContent value="export" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="h-5 w-5" />
                                Membership Registry
                            </CardTitle>
                            <CardDescription>
                                Download a comprehensive list of all verified students with their details.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-start gap-4">
                                <div className="flex-1">
                                    <h4 className="font-medium mb-2">Export Includes:</h4>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                        <li>• Student Name</li>
                                        <li>• Student ID</li>
                                        <li>• Hall of Residence</li>
                                        <li>• Phone Number</li>
                                    </ul>
                                </div>
                                <Button onClick={handleDownloadUsers}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download CSV
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="h-5 w-5" />
                                Election Audit
                            </CardTitle>
                            <CardDescription>
                                Download raw voting data for auditing and analysis purposes.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-start gap-4">
                                <div className="flex-1">
                                    <h4 className="font-medium mb-2">Export Includes:</h4>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                        <li>• Election Title</li>
                                        <li>• Position Name</li>
                                        <li>• Candidate Name</li>
                                        <li>• Voter Username (anonymized)</li>
                                        <li>• Vote Timestamp</li>
                                    </ul>
                                </div>
                                <Button onClick={handleDownloadElectionData} variant="outline">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download CSV
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                        <div className="flex gap-3">
                            <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-orange-900 mb-1">Data Privacy Notice</h4>
                                <p className="text-sm text-orange-800">
                                    Exported data contains sensitive student information. Handle with care and ensure
                                    compliance with data protection policies. Only download when necessary.
                                </p>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
