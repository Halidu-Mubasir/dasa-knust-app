"use client"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { useEffect, useState } from "react"
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react"
import api from "@/lib/axios"
import { toast } from "sonner"
import { Executive } from "@/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ExecutiveFormDialog } from "@/components/admin/ExecutiveFormDialog"
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

export default function LeadershipPage() {
    const [data, setData] = useState<Executive[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingExecutive, setEditingExecutive] = useState<Executive | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [executiveToDelete, setExecutiveToDelete] = useState<Executive | null>(null)
    const [selectedIds, setSelectedIds] = useState<number[]>([])
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const fetchData = async () => {
        try {
            const res = await api.get('/leadership/')
            setData(res.data || [])
        } catch (error) {
            console.error(error)
            toast.error("Failed to load executives")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    const handleAdd = () => {
        setEditingExecutive(null)
        setDialogOpen(true)
    }

    const handleEdit = (executive: Executive) => {
        setEditingExecutive(executive)
        setDialogOpen(true)
    }

    const handleDelete = (executive: Executive) => {
        setExecutiveToDelete(executive)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!executiveToDelete) return

        try {
            await api.delete(`/leadership/${executiveToDelete.id}/`)
            toast.success("Executive deleted successfully")
            fetchData()
        } catch (error) {
            toast.error("Failed to delete executive")
        } finally {
            setDeleteDialogOpen(false)
            setExecutiveToDelete(null)
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
            await Promise.all(selectedIds.map(id => api.delete(`/leadership/${id}/`)))
            toast.success(`${selectedIds.length} executive(s) deleted`)
            setSelectedIds([])
            fetchData()
        } catch (error) {
            toast.error("Failed to delete some executives")
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

    const columns: ColumnDef<Executive>[] = [
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
            accessorKey: "full_name",
            header: "Executive",
            cell: ({ row }) => {
                const exec = row.original
                const avatarUrl = exec.image_url || exec.user_details?.avatar
                const fullName = exec.user_details?.full_name || exec.full_name

                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={avatarUrl || undefined} />
                            <AvatarFallback>
                                {fullName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium">{fullName}</p>
                            <p className="text-sm text-muted-foreground">{exec.username}</p>
                        </div>
                    </div>
                )
            }
        },
        {
            accessorKey: "title",
            header: "Position",
            cell: ({ row }) => (
                <span className="font-medium">{row.original.title}</span>
            )
        },
        {
            accessorKey: "rank",
            header: "Rank",
            cell: ({ row }) => (
                <Badge variant="outline">{row.original.rank}</Badge>
            )
        },
        {
            accessorKey: "academic_year",
            header: "Year",
        },
        {
            accessorKey: "is_current",
            header: "Status",
            cell: ({ row }) => {
                const isCurrent = row.original.is_current
                return (
                    <Badge variant={isCurrent ? "default" : "secondary"} className={isCurrent ? "bg-green-600" : ""}>
                        {isCurrent ? "Current" : "Past"}
                    </Badge>
                )
            }
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const exec = row.original
                return (
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(exec)}
                            className="cursor-pointer hover:bg-secondary/90 hover:text-secondary-foreground"
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(exec)}
                            className="text-destructive hover:text-destructive cursor-pointer"
                            type="button"
                        >
                            <Trash2 className="h-4 w-4 cursor-pointer" />
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
                        <h2 className="text-3xl font-bold tracking-tight">Leadership</h2>
                        <p className="text-muted-foreground">Manage student executives and council members.</p>
                    </div>
                    <div className="flex gap-2">
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
                        <Button onClick={handleAdd} className="cursor-pointer hover:bg-primary/90 hover:text-primary-foreground">
                            <Plus className="mr-2 h-4 w-4" /> Add Executive
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

            <ExecutiveFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                executive={editingExecutive}
                onSuccess={fetchData}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Executive</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{executiveToDelete?.full_name}</strong> ({executiveToDelete?.title})? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Multiple Executives</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedIds.length} executive(s)? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmBulkDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
