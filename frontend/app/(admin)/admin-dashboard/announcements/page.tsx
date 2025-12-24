"use client"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { useEffect, useState } from "react"
import { Loader2, Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import api from "@/lib/axios"
import { toast } from "sonner"
import { Announcement } from "@/types"
import { AnnouncementFormDialog } from "@/components/admin/AnnouncementFormDialog"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function AnnouncementsPage() {
    const [data, setData] = useState<Announcement[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<Announcement | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<Announcement | null>(null)
    const [selectedIds, setSelectedIds] = useState<number[]>([])
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const fetchData = async () => {
        try {
            const res = await api.get('/announcements/')
            setData(res.data.results || res.data || [])
        } catch (error) {
            console.error(error)
            toast.error("Failed to load announcements")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleCreate = () => {
        setEditingItem(null)
        setDialogOpen(true)
    }

    const handleEdit = (item: Announcement) => {
        setEditingItem(item)
        setDialogOpen(true)
    }

    const handleDelete = (item: Announcement) => {
        setItemToDelete(item)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!itemToDelete) return
        try {
            await api.delete(`/announcements/${itemToDelete.id}/`)
            toast.success("Announcement deleted")
            fetchData()
        } catch (error) {
            toast.error("Failed to delete")
        } finally {
            setDeleteDialogOpen(false)
            setItemToDelete(null)
        }
    }

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) {
            toast.error("Please select items to delete")
            return
        }
        setBulkDeleteOpen(true)
    }

    const confirmBulkDelete = async () => {
        setIsDeleting(true)
        try {
            await Promise.all(selectedIds.map(id => api.delete(`/announcements/${id}/`)))
            toast.success(`${selectedIds.length} announcement(s) deleted`)
            setSelectedIds([])
            fetchData()
        } catch (error) {
            toast.error("Failed to delete some announcements")
        } finally {
            setIsDeleting(false)
            setBulkDeleteOpen(false)
        }
    }

    const toggleSelectAll = () => {
        if (selectedIds.length === data.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(data.map(item => item.id))
        }
    }

    const toggleSelect = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const toggleActive = async (item: Announcement) => {
        try {
            // Optimistic update
            const newData = data.map(d => d.id === item.id ? { ...d, is_active: !d.is_active } : d)
            setData(newData)

            await api.patch(`/announcements/${item.id}/`, { is_active: !item.is_active })
            toast.success("Status updated")
        } catch (error) {
            toast.error("Failed to update status")
            fetchData() // Revert on error
        }
    }

    const columns: ColumnDef<Announcement>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={selectedIds.length === data.length && data.length > 0}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                    className="cursor-pointer"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={selectedIds.includes(row.original.id)}
                    onCheckedChange={() => toggleSelect(row.original.id)}
                    aria-label="Select row"
                    className="cursor-pointer"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }) => <span className="font-bold">{row.original.title}</span>
        },
        {
            accessorKey: "message",
            header: "Message",
            cell: ({ row }) => (
                <TooltipProvider>
                    <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                            <span className="block max-w-[300px] truncate cursor-help text-sm">
                                {row.original.message}
                            </span>
                        </TooltipTrigger>
                        <TooltipContent
                            side="top"
                            className="max-w-[400px] whitespace-pre-wrap bg-white text-gray-900 border shadow-lg p-3"
                        >
                            {row.original.message}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )
        },
        {
            accessorKey: "priority",
            header: "Priority",
            cell: ({ row }) => {
                const isHigh = row.original.priority === 'High'
                return (
                    <Badge className={isHigh ? "bg-red-100 text-red-800 hover:bg-red-100" : "bg-blue-100 text-blue-800 hover:bg-blue-100"}>
                        {row.original.priority}
                    </Badge>
                )
            }
        },
        {
            accessorKey: "is_active",
            header: "Active",
            cell: ({ row }) => (
                <Switch
                    checked={row.original.is_active}
                    onCheckedChange={() => toggleActive(row.original)}
                    className="cursor-pointer"
                />
            )
        },
        {
            accessorKey: "created_at",
            header: "Date",
            cell: ({ row }) => {
                try {
                    return new Date(row.original.created_at).toLocaleDateString()
                } catch {
                    return "Unknown"
                }
            }
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(row.original)} className="cursor-pointer">
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
                        <h2 className="text-3xl font-bold tracking-tight">Announcements</h2>
                        <p className="text-muted-foreground">Broadcast messages to the ticker.</p>
                    </div>
                    <div className="flex gap-2">
                        {selectedIds.length > 0 && (
                            <Button
                                variant="destructive"
                                onClick={handleBulkDelete}
                                className="cursor-pointer"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete {selectedIds.length} Selected
                            </Button>
                        )}
                        <Button onClick={handleCreate} className="cursor-pointer">
                            <Plus className="mr-2 h-4 w-4" /> Post Announcement
                        </Button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex h-[400px] items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <DataTable columns={columns} data={data} searchKey="title" onSelectionChange={(ids: number[]) => setSelectedIds(ids)} />
                )}
            </div>

            <AnnouncementFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                announcement={editingItem}
                onSuccess={fetchData}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
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

            <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Multiple Announcements</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedIds.length} announcement(s)? This action cannot be undone.
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
        </>
    )
}
