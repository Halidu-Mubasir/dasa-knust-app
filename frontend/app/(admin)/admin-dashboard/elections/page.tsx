"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
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
import { Loader2, Plus, Trash2, Settings, BarChart3, Vote } from "lucide-react"
import api from "@/lib/axios"
import { toast } from "sonner"
import { format, isPast, isFuture } from "date-fns"
import Link from "next/link"

interface Election {
    id: number
    title: string
    description?: string
    start_date: string
    end_date: string
    is_active: boolean
    is_published: boolean
    is_open?: boolean
}

export default function ElectionsPage() {
    const [data, setData] = useState<Election[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<Election | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
    })

    const fetchData = async () => {
        try {
            const res = await api.get('/elections/elections/')
            setData(res.data.results || res.data || [])
        } catch (error) {
            console.error(error)
            toast.error("Failed to load elections")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleCreate = () => {
        setFormData({
            title: "",
            description: "",
            start_date: "",
            end_date: "",
        })
        setDialogOpen(true)
    }

    const handleDelete = (item: Election) => {
        setItemToDelete(item)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!itemToDelete) return
        try {
            await api.delete(`/elections/elections/${itemToDelete.id}/`)
            toast.success("Election deleted")
            fetchData()
        } catch (error) {
            toast.error("Failed to delete election")
        } finally {
            setDeleteDialogOpen(false)
            setItemToDelete(null)
        }
    }

    const toggleActive = async (item: Election) => {
        try {
            await api.patch(`/elections/elections/${item.id}/`, { is_active: !item.is_active })
            toast.success(`Election ${!item.is_active ? 'activated' : 'stopped'}`)
            fetchData()
        } catch (error) {
            toast.error("Failed to update status")
        }
    }

    const togglePublished = async (item: Election) => {
        try {
            await api.patch(`/elections/elections/${item.id}/`, { is_published: !item.is_published })
            toast.success(`Results ${!item.is_published ? 'published' : 'hidden'}`)
            fetchData()
        } catch (error) {
            toast.error("Failed to update publication status")
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        if (!formData.title || !formData.start_date || !formData.end_date) {
            toast.error("Please fill all required fields")
            return
        }

        // Validate dates
        const startDate = new Date(formData.start_date)
        const endDate = new Date(formData.end_date)

        if (endDate <= startDate) {
            toast.error("End date must be after start date")
            return
        }

        setIsSubmitting(true)

        // Convert to ISO format for backend
        const payload = {
            title: formData.title,
            description: formData.description,
            start_date: new Date(formData.start_date).toISOString(),
            end_date: new Date(formData.end_date).toISOString(),
            is_active: false, // New elections start inactive
            is_published: false, // Results hidden by default
        }

        try {
            await api.post('/elections/elections/', payload)
            toast.success("Election created successfully")
            setDialogOpen(false)
            fetchData()
        } catch (error: any) {
            console.error(error)
            toast.error(error.response?.data?.detail || "Failed to create election")
        } finally {
            setIsSubmitting(false)
        }
    }

    const getStatusBadge = (election: Election) => {
        const now = new Date()
        const start = new Date(election.start_date)
        const end = new Date(election.end_date)

        if (election.is_active && now >= start && now <= end) {
            return <Badge className="bg-green-600">Active</Badge>
        } else if (isPast(end)) {
            return <Badge variant="secondary" className="bg-orange-600">Closed</Badge>
        } else if (isFuture(start)) {
            return <Badge variant="outline" className="bg-blue-600">Scheduled</Badge>
        } else {
            return <Badge variant="destructive">Inactive</Badge>
        }
    }

    const getPublishedBadge = (election: Election) => {
        if (election.is_published) {
            return <Badge className="bg-green-600">Published</Badge>
        }
        return <Badge className="bg-blue-600">Hidden</Badge>
    }

    const columns: ColumnDef<Election>[] = [
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }) => {
                const election = row.original
                return (
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                            <Vote className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-bold">{election.title}</p>
                            {election.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                    {election.description}
                                </p>
                            )}
                        </div>
                    </div>
                )
            }
        },
        {
            accessorKey: "timeline",
            header: "Timeline",
            cell: ({ row }) => {
                const election = row.original
                try {
                    return (
                        <div className="space-y-1 text-sm">
                            <div>
                                <span className="text-muted-foreground">Start: </span>
                                <span className="font-medium">
                                    {format(new Date(election.start_date), "MMM d, yyyy h:mm a")}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">End: </span>
                                <span className="font-medium">
                                    {format(new Date(election.end_date), "MMM d, yyyy h:mm a")}
                                </span>
                            </div>
                        </div>
                    )
                } catch {
                    return "Invalid dates"
                }
            }
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => getStatusBadge(row.original)
        },
        {
            accessorKey: "results",
            header: "Results",
            cell: ({ row }) => getPublishedBadge(row.original)
        },
        {
            accessorKey: "controls",
            header: "Quick Controls",
            cell: ({ row }) => {
                const election = row.original
                return (
                    <div className="space-y-2">
                        {/* Active Toggle */}
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={election.is_active}
                                onCheckedChange={() => toggleActive(election)}
                                type="button"
                                className="cursor-pointer"
                            />
                            <span className="text-xs text-muted-foreground">
                                {election.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>

                        {/* Published Toggle */}
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={election.is_published}
                                onCheckedChange={() => togglePublished(election)}
                                type="button"
                                className="cursor-pointer"
                            />
                            <span className="text-xs text-muted-foreground">
                                {election.is_published ? 'Published' : 'Hidden'}
                            </span>
                        </div>
                    </div>
                )
            }
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const election = row.original
                return (
                    <div className="flex gap-2">
                        <Link href={`/admin-dashboard/elections/${election.id}/config`}>
                            <Button variant="outline" size="sm" type="button" className="hover:bg-primary/90 cursor-pointer">
                                <Settings className="h-4 w-4 mr-2" />
                                Manage
                            </Button>
                        </Link>
                        <Link href={`/admin-dashboard/elections/${election.id}`}>
                            <Button variant="ghost" size="sm" type="button" className="hover:bg-primary/90 cursor-pointer">
                                <BarChart3 className="h-4 w-4 mr-2" />
                                Analytics
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(election)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                            type="button"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                )
            }
        }
    ]

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Election Management</h2>
                        <p className="text-muted-foreground">
                            Create and manage elections. Control voting access and publish results.
                        </p>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={handleCreate} type="button" className="cursor-pointer hover:bg-primary/90 hover:text-primary-foreground">
                                <Plus className="mr-2 h-4 w-4" /> New Election
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Create New Election</DialogTitle>
                                <DialogDescription>
                                    Set up a new election with voting timeline. You can configure positions and candidates after creation.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Election Title *</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g., 2024/2025 Executive Elections"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Brief description of the election"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="start_date">Start Date & Time *</Label>
                                    <Input
                                        id="start_date"
                                        type="datetime-local"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        When voting should begin
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="end_date">End Date & Time *</Label>
                                    <Input
                                        id="end_date"
                                        type="datetime-local"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        When voting should close
                                    </p>
                                </div>

                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                                    <p className="text-xs text-blue-900">
                                        💡 New elections are created in <strong>inactive</strong> state.
                                        Activate them when you&apos;re ready to open voting.
                                    </p>
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="cursor-pointer">
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Create Election
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {isLoading ? (
                    <div className="flex h-[400px] items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <DataTable columns={columns} data={data} searchKey="title" />
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Election</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{itemToDelete?.title}</strong>?
                            This will also delete all positions, candidates, and votes. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel type="button" className="cursor-pointer">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            type="button"
                            className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:text-destructive-foreground"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
