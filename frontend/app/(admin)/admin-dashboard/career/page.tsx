"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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
import { Loader2, Plus, Trash2, Pencil, Briefcase } from "lucide-react"
import api from "@/lib/axios"
import { toast } from "sonner"
import { CareerOpportunity } from "@/types"
import { format, isPast } from "date-fns"

export default function CareerPage() {
    const [data, setData] = useState<CareerOpportunity[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<CareerOpportunity | null>(null)
    const [editingItem, setEditingItem] = useState<CareerOpportunity | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        organization: "",
        location: "",
        type: "",
        description: "",
        application_link: "",
        deadline: "",
        is_active: true,
    })

    const fetchData = async () => {
        try {
            const res = await api.get('/career/opportunities/')
            setData(res.data.results || res.data || [])
        } catch (error) {
            console.error(error)
            toast.error("Failed to load opportunities")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleCreate = () => {
        setEditingItem(null)
        setFormData({
            title: "",
            organization: "",
            location: "",
            type: "",
            description: "",
            application_link: "",
            deadline: "",
            is_active: true,
        })
        setDialogOpen(true)
    }

    const handleEdit = (item: CareerOpportunity) => {
        setEditingItem(item)
        setFormData({
            title: item.title,
            organization: item.organization,
            location: item.location,
            type: item.type,
            description: item.description,
            application_link: item.application_link,
            deadline: item.deadline.slice(0, 16), // Format for datetime-local input
            is_active: item.is_active,
        })
        setDialogOpen(true)
    }

    const handleDelete = (item: CareerOpportunity) => {
        setItemToDelete(item)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!itemToDelete) return
        try {
            await api.delete(`/career/opportunities/${itemToDelete.id}/`)
            toast.success("Opportunity deleted")
            fetchData()
        } catch (error) {
            toast.error("Failed to delete opportunity")
        } finally {
            setDeleteDialogOpen(false)
            setItemToDelete(null)
        }
    }

    const toggleActive = async (item: CareerOpportunity) => {
        try {
            await api.patch(`/career/opportunities/${item.id}/`, { is_active: !item.is_active })
            toast.success(`Opportunity ${!item.is_active ? 'activated' : 'deactivated'}`)
            fetchData()
        } catch (error) {
            toast.error("Failed to update status")
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        if (!formData.title || !formData.organization || !formData.location || !formData.type || !formData.description || !formData.application_link || !formData.deadline) {
            toast.error("Please fill all required fields")
            return
        }

        setIsSubmitting(true)

        // Convert datetime-local to ISO format
        const deadlineISO = new Date(formData.deadline).toISOString()

        const payload = {
            ...formData,
            deadline: deadlineISO,
        }

        try {
            if (editingItem) {
                await api.patch(`/career/opportunities/${editingItem.id}/`, payload)
                toast.success("Opportunity updated successfully")
            } else {
                await api.post('/career/opportunities/', payload)
                toast.success("Opportunity posted successfully")
            }
            setDialogOpen(false)
            fetchData()
        } catch (error: any) {
            console.error(error)
            toast.error(error.response?.data?.detail || "Failed to save opportunity")
        } finally {
            setIsSubmitting(false)
        }
    }

    const columns: ColumnDef<CareerOpportunity>[] = [
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }) => {
                const opportunity = row.original
                return (
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                            <Briefcase className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-bold">{opportunity.title}</p>
                            <p className="text-xs text-muted-foreground">{opportunity.organization}</p>
                        </div>
                    </div>
                )
            }
        },
        {
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => (
                <Badge variant="outline">{row.original.type}</Badge>
            )
        },
        {
            accessorKey: "location",
            header: "Location",
            cell: ({ row }) => (
                <span className="text-sm">{row.original.location}</span>
            )
        },
        {
            accessorKey: "deadline",
            header: "Deadline",
            cell: ({ row }) => {
                const deadline = new Date(row.original.deadline)
                const isExpired = isPast(deadline)

                try {
                    return (
                        <span className={isExpired ? "text-red-500 font-medium" : "text-sm"}>
                            {format(deadline, "MMM d, yyyy h:mm a")}
                        </span>
                    )
                } catch {
                    return "Unknown"
                }
            }
        },
        {
            accessorKey: "is_active",
            header: "Status",
            cell: ({ row }) => {
                const opportunity = row.original
                return (
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={opportunity.is_active}
                            onCheckedChange={() => toggleActive(opportunity)}
                            className="cursor-pointer"
                        />
                        <span className="text-sm">
                            {opportunity.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                )
            }
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(row.original)}
                        className="cursor-pointer"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(row.original)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ]

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Career Opportunities</h2>
                        <p className="text-muted-foreground">Post and manage job opportunities, internships, and scholarships.</p>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={handleCreate} className="cursor-pointer">
                                <Plus className="mr-2 h-4 w-4" /> Post Opportunity
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingItem ? "Edit Opportunity" : "Post Opportunity"}</DialogTitle>
                                <DialogDescription>
                                    {editingItem ? "Update opportunity details" : "Add a new job or scholarship opportunity for students."}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title *</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g. Software Engineering Intern"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="organization">Organization *</Label>
                                        <Input
                                            id="organization"
                                            value={formData.organization}
                                            onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                                            placeholder="e.g. Google Inc."
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location *</Label>
                                        <Input
                                            id="location"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            placeholder="e.g. Accra, Ghana"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="type">Type *</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select opportunity type" />
                                        </SelectTrigger>
                                        <SelectContent position="popper" side="bottom" align="start" className="max-h-[300px]">
                                            <SelectItem value="Job">Job</SelectItem>
                                            <SelectItem value="Internship">Internship</SelectItem>
                                            <SelectItem value="NSS">NSS</SelectItem>
                                            <SelectItem value="Research">Research</SelectItem>
                                            <SelectItem value="Undergarduate">Undergraduate</SelectItem>
                                            <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                                            <SelectItem value="Masters">Masters</SelectItem>
                                            <SelectItem value="PhD">PhD</SelectItem>
                                            <SelectItem value="Workshop">Workshop</SelectItem>
                                            <SelectItem value="Conference">Conference</SelectItem>
                                            <SelectItem value="Scholarship">Scholarship</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description *</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Provide details about the opportunity..."
                                        className="min-h-[100px]"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="application_link">Application Link *</Label>
                                    <Input
                                        id="application_link"
                                        type="url"
                                        value={formData.application_link}
                                        onChange={(e) => setFormData({ ...formData, application_link: e.target.value })}
                                        placeholder="https://..."
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="deadline">Application Deadline *</Label>
                                    <Input
                                        id="deadline"
                                        type="datetime-local"
                                        value={formData.deadline}
                                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="is_active">Active Status</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Make this opportunity visible to students
                                        </p>
                                    </div>
                                    <Switch
                                        id="is_active"
                                        checked={formData.is_active}
                                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                        className="cursor-pointer"
                                    />
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="cursor-pointer">
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {editingItem ? "Update" : "Post"}
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
                        <AlertDialogTitle>Delete Opportunity</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{itemToDelete?.title}</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
