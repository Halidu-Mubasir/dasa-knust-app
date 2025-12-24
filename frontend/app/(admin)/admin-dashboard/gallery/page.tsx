"use client"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { useEffect, useState } from "react"
import { Loader2, Plus, Play, Trash2, Pencil } from "lucide-react"
import api from "@/lib/axios"
import { toast } from "sonner"
import { GalleryItem } from "@/types"
import { GalleryUploadDialog } from "@/components/admin/GalleryUploadDialog"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"
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
import { format } from "date-fns"

// Category badge color mapping
const categoryColors: Record<string, string> = {
    'General': 'bg-gray-100 text-gray-800 hover:bg-gray-100',
    'Sports': 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    'Cultural': 'bg-purple-100 text-purple-800 hover:bg-purple-100',
    'Politics': 'bg-red-100 text-red-800 hover:bg-red-100',
    'Excursion': 'bg-green-100 text-green-800 hover:bg-green-100',
}

export default function GalleryPage() {
    const [data, setData] = useState<GalleryItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<GalleryItem | null>(null)
    const [selectedIds, setSelectedIds] = useState<number[]>([])
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const fetchData = async () => {
        try {
            const res = await api.get('/gallery/')
            setData(res.data.results || res.data || [])
        } catch (error) {
            console.error(error)
            toast.error("Failed to load gallery")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleDelete = (item: GalleryItem) => {
        setItemToDelete(item)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!itemToDelete) return
        try {
            await api.delete(`/gallery/${itemToDelete.id}/`)
            toast.success("Item deleted")
            fetchData()
        } catch (error) {
            toast.error("Failed to delete item")
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
            await Promise.all(selectedIds.map(id => api.delete(`/gallery/${id}/`)))
            toast.success(`${selectedIds.length} item(s) deleted`)
            setSelectedIds([])
            fetchData()
        } catch (error) {
            toast.error("Failed to delete some items")
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

    const columns: ColumnDef<GalleryItem>[] = [
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
            accessorKey: "thumbnail_url",
            header: "Preview",
            cell: ({ row }) => {
                const item = row.original
                const imageUrl = item.image_url
                const thumbnailUrl = item.thumbnail_url
                const isVideo = item.media_type === 'Video'
                const displayUrl = isVideo ? thumbnailUrl : imageUrl

                return (
                    <div className="relative h-16 w-28 rounded-md overflow-hidden bg-muted border">
                        {displayUrl ? (
                            <>
                                <Image
                                    src={displayUrl}
                                    alt={item.title || 'Gallery item'}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                                {isVideo && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                        <Play className="h-8 w-8 text-white" fill="currentColor" />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                                No Preview
                            </div>
                        )}
                    </div>
                )
            }
        },
        {
            accessorKey: "title",
            header: "Caption",
            cell: ({ row }) => <span className="font-medium">{row.original.title}</span>
        },
        {
            accessorKey: "category",
            header: "Category",
            cell: ({ row }) => {
                const category = row.original.category
                return (
                    <Badge className={categoryColors[category] || categoryColors['General']}>
                        {category}
                    </Badge>
                )
            }
        },
        {
            accessorKey: "media_type",
            header: "Type",
            cell: ({ row }) => {
                const isVideo = row.original.media_type === 'Video'
                return (
                    <Badge variant={isVideo ? 'destructive' : 'default'}>
                        {row.original.media_type}
                    </Badge>
                )
            }
        },
        {
            accessorKey: "created_at",
            header: "Uploaded",
            cell: ({ row }) => {
                try {
                    return format(new Date(row.original.created_at), "MMM d, yyyy")
                } catch {
                    return "Unknown"
                }
            }
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(row.original)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            )
        }
    ]

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Gallery</h2>
                        <p className="text-muted-foreground">Manage photos and video highlights.</p>
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
                        <Button onClick={() => setDialogOpen(true)} className="cursor-pointer">
                            <Plus className="mr-2 h-4 w-4" /> Upload Media
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

            <GalleryUploadDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSuccess={fetchData}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Media</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{itemToDelete?.title}</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
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
                        <AlertDialogTitle>Delete Multiple Items</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedIds.length} item(s)? This action cannot be undone.
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
