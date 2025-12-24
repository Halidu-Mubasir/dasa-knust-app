"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { createColumns } from "./columns"
import api from "@/lib/axios"
import { User } from "@/types"
import { Loader2, Trash2, UserPlus } from "lucide-react"
import { UserDetailSheet } from "@/components/admin/UserDetailSheet"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function UserManagementPage() {
    const [data, setData] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [selectedIds, setSelectedIds] = useState<number[]>([])
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [addUserOpen, setAddUserOpen] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [newUser, setNewUser] = useState({
        username: "",
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        phone_number: "",
        is_student: true,
        is_alumni: false,
    })

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users/')
            if (Array.isArray(response.data)) {
                setData(response.data)
            } else if (response.data.results && Array.isArray(response.data.results)) {
                setData(response.data.results)
            } else {
                setData([])
            }
        } catch (error) {
            console.error("Failed to fetch users", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const handleViewDetails = (user: User) => {
        setSelectedUser(user)
        setIsSheetOpen(true)
    }

    const handleUserUpdate = () => {
        fetchUsers()
    }

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) {
            toast.error("Please select users to delete")
            return
        }
        setBulkDeleteOpen(true)
    }

    const confirmBulkDelete = async () => {
        setIsDeleting(true)
        try {
            const response = await api.post('/users/bulk_delete/', {
                user_ids: selectedIds
            })
            toast.success(response.data.message || `${selectedIds.length} user(s) deleted`)
            setSelectedIds([])
            fetchUsers()
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || "Failed to delete users"
            toast.error(errorMsg)
        } finally {
            setIsDeleting(false)
            setBulkDeleteOpen(false)
        }
    }

    const handleAddUser = () => {
        setAddUserOpen(true)
    }

    const handleCreateUser = async () => {
        // Validation
        if (!newUser.username || !newUser.email || !newUser.password) {
            toast.error("Username, email, and password are required")
            return
        }

        if (newUser.password.length < 8) {
            toast.error("Password must be at least 8 characters")
            return
        }

        setIsCreating(true)
        try {
            const response = await api.post('/users/create_user/', newUser)
            toast.success(response.data.message || "User created successfully")
            setNewUser({
                username: "",
                email: "",
                password: "",
                first_name: "",
                last_name: "",
                phone_number: "",
                is_student: true,
                is_alumni: false,
            })
            setAddUserOpen(false)
            fetchUsers()
        } catch (error: any) {
            const errors = error.response?.data
            if (errors) {
                Object.keys(errors).forEach((key) => {
                    const messages = errors[key]
                    if (Array.isArray(messages)) {
                        messages.forEach((msg) => toast.error(`${key}: ${msg}`))
                    } else {
                        toast.error(`${key}: ${messages}`)
                    }
                })
            } else {
                toast.error("Failed to create user")
            }
        } finally {
            setIsCreating(false)
        }
    }

    const columns = createColumns(handleViewDetails)

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
                        <p className="text-muted-foreground">Manage user roles and access.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedIds.length > 0 && (
                            <Button
                                variant="destructive"
                                onClick={handleBulkDelete}
                                className="cursor-pointer hover:bg-destructive/90 hover:text-destructive-foreground"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete {selectedIds.length} Selected
                            </Button>
                        )}
                        <Button onClick={handleAddUser} className="cursor-pointer hover:bg-primary/90 hover:text-primary-foreground">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add User
                        </Button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex h-[400px] items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={data}
                        searchKey="username"
                        onSelectionChange={(ids: number[]) => setSelectedIds(ids)}
                    />
                )}
            </div>

            <UserDetailSheet
                user={selectedUser}
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                onUserUpdate={handleUserUpdate}
            />

            <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Multiple Users</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedIds.length} user(s)? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting} className="cursor-pointer">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmBulkDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete All'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>
                            Create a new user account. Admin can assign passwords and configure user roles.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="username">Username *</Label>
                            <Input
                                id="username"
                                value={newUser.username}
                                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                placeholder="Enter username"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                placeholder="user@example.com"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password * (min 8 characters)</Label>
                            <Input
                                id="password"
                                type="password"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                placeholder="Enter password"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="first_name">First Name</Label>
                                <Input
                                    id="first_name"
                                    value={newUser.first_name}
                                    onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                                    placeholder="First name"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="last_name">Last Name</Label>
                                <Input
                                    id="last_name"
                                    value={newUser.last_name}
                                    onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                                    placeholder="Last name"
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone_number">Phone Number</Label>
                            <Input
                                id="phone_number"
                                value={newUser.phone_number}
                                onChange={(e) => setNewUser({ ...newUser, phone_number: e.target.value })}
                                placeholder="+233 XXX XXX XXX"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="is_student">User Type</Label>
                                <Select
                                    value={newUser.is_student ? "student" : "alumni"}
                                    onValueChange={(value) => setNewUser({
                                        ...newUser,
                                        is_student: value === "student",
                                        is_alumni: value === "alumni"
                                    })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="student">Student</SelectItem>
                                        <SelectItem value="alumni">Alumni</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setAddUserOpen(false)}
                            disabled={isCreating}
                            className="cursor-pointer hover:bg-secondary/90 hover:text-secondary-foreground"
                            type="button"
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleCreateUser} disabled={isCreating} className="cursor-pointer hover:bg-primary/90 hover:text-primary-foreground">
                            {isCreating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create User'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
