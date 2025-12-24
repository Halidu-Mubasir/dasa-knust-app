"use client"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { useEffect, useState } from "react"
import { Loader2, Plus, CheckCircle2, XCircle, Pencil, Trash2 } from "lucide-react"
import api from "@/lib/axios"
import { toast } from "sonner"
import { Event } from "@/types"
import { EventFormSheet } from "@/components/admin/EventFormSheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { format } from "date-fns"
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

export default function EventsPage() {
    const [data, setData] = useState<Event[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [sheetOpen, setSheetOpen] = useState(false)
    const [editingEvent, setEditingEvent] = useState<Event | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [eventToDelete, setEventToDelete] = useState<Event | null>(null)
    const [selectedIds, setSelectedIds] = useState<number[]>([])
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const fetchData = async () => {
        try {
            const res = await api.get('/events/?all=true')
            setData(res.data.results || res.data || [])
        } catch (error) {
            console.error(error)
            toast.error("Failed to load events")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleCreate = () => {
        setEditingEvent(null)
        setSheetOpen(true)
    }

    const handleEdit = (event: Event) => {
        setEditingEvent(event)
        setSheetOpen(true)
    }

    const handleDelete = (event: Event) => {
        setEventToDelete(event)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!eventToDelete) return
        try {
            await api.delete(`/events/${eventToDelete.id}/`)
            toast.success("Event deleted")
            fetchData()
        } catch (error) {
            const axiosError = error as { response?: { status?: number } }
            if (axiosError.response?.status === 404) {
                toast.error("Event not found. It may have been already deleted.")
                fetchData() // Refresh to sync with server
            } else {
                toast.error("Failed to delete event")
            }
        } finally {
            setDeleteDialogOpen(false)
            setEventToDelete(null)
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
            const deleteResults = await Promise.allSettled(
                selectedIds.map(id => api.delete(`/events/${id}/`))
            )

            const successCount = deleteResults.filter(r => r.status === 'fulfilled').length
            const failedCount = deleteResults.filter(r => r.status === 'rejected').length

            if (successCount > 0) {
                toast.success(`${successCount} event(s) deleted`)
            }
            if (failedCount > 0) {
                toast.error(`${failedCount} event(s) could not be deleted (may not exist)`)
            }

            setSelectedIds([])
            fetchData()
        } catch (error) {
            toast.error("Failed to delete events")
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

    const columns: ColumnDef<Event>[] = [
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
            accessorKey: "event_image_url",
            header: "Image",
            cell: ({ row }) => (
                <Avatar className="h-12 w-12 rounded-md">
                    <AvatarImage src={row.original.event_image_url || undefined} className="object-cover" />
                    <AvatarFallback className="rounded-md">📅</AvatarFallback>
                </Avatar>
            )
        },
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }) => <span className="font-bold">{row.original.title}</span>
        },
        {
            accessorKey: "date",
            header: "Date/Time",
            cell: ({ row }) => {
                try {
                    const dateStr = format(new Date(row.original.date), "MMM d, yyyy")
                    const timeStr = row.original.start_time.slice(0, 5)
                    return (
                        <div className="text-sm">
                            <div className="font-medium">{dateStr}</div>
                            <div className="text-muted-foreground">🕐 {timeStr}</div>
                        </div>
                    )
                } catch { return "Invalid Date" }
            }
        },
        {
            accessorKey: "is_featured",
            header: "Status",
            cell: ({ row }) => row.original.is_featured ? (
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">⭐ Featured</Badge>
            ) : null
        },
        {
            accessorKey: "registration_required",
            header: "Registration",
            cell: ({ row }) => (
                row.original.registration_required ?
                    <CheckCircle2 className="h-5 w-5 text-green-600" /> :
                    <XCircle className="h-5 w-5 text-gray-300" />
            )
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(row.original)} type="button" className="cursor-pointer hover:bg-secondary/90 hover:text-secondary-foreground">
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(row.original)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                        type="button"
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
                        <h2 className="text-3xl font-bold tracking-tight">Events</h2>
                        <p className="text-muted-foreground">Manage upcoming events and calendar.</p>
                    </div>
                    <div className="flex gap-2">
                        {selectedIds.length > 0 && (
                            <Button
                                variant="destructive"
                                onClick={handleBulkDelete}
                                type="button"
                                className="cursor-pointer hover:bg-destructive/90 hover:text-destructive-foreground"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete {selectedIds.length} Selected
                            </Button>
                        )}
                        <Button onClick={handleCreate} type="button" className="cursor-pointer hover:bg-primary/90 hover:text-primary-foreground">
                            <Plus className="mr-2 h-4 w-4" /> Create Event
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

            <EventFormSheet
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                event={editingEvent}
                onSuccess={fetchData}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Event</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{eventToDelete?.title}</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel type="button" className="cursor-pointer hover:bg-secondary/90 hover:text-secondary-foreground">Cancel</AlertDialogCancel>
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

            <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Multiple Events</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedIds.length} event(s)? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting} type="button" className="cursor-pointer hover:bg-secondary/90 hover:text-secondary-foreground">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmBulkDelete}
                            disabled={isDeleting}
                            type="button"
                            className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:text-destructive-foreground"
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
