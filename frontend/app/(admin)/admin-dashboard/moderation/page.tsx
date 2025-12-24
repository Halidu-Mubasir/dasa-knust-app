"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Trash2, Package, Shield, ImageIcon } from "lucide-react"
import api from "@/lib/axios"
import { toast } from "sonner"
import { Product, LostItem } from "@/types"
import { format } from "date-fns"
import Image from "next/image"

export default function ModerationPage() {
    // Marketplace State
    const [marketData, setMarketData] = useState<Product[]>([])
    const [isMarketLoading, setIsMarketLoading] = useState(true)
    const [marketItemToDelete, setMarketItemToDelete] = useState<Product | null>(null)
    const [marketDeleteOpen, setMarketDeleteOpen] = useState(false)

    // Lost & Found State
    const [lostFoundData, setLostFoundData] = useState<LostItem[]>([])
    const [isLostFoundLoading, setIsLostFoundLoading] = useState(true)
    const [lostFoundItemToDelete, setLostFoundItemToDelete] = useState<LostItem | null>(null)
    const [lostFoundDeleteOpen, setLostFoundDeleteOpen] = useState(false)

    // Image Preview State
    const [imagePreviewOpen, setImagePreviewOpen] = useState(false)
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)

    // Fetch Marketplace Data
    const fetchMarketData = async () => {
        try {
            const res = await api.get('/market/products/?admin=true')
            setMarketData(res.data.results || res.data || [])
        } catch (error) {
            console.error(error)
            toast.error("Failed to load marketplace listings")
        } finally {
            setIsMarketLoading(false)
        }
    }

    // Fetch Lost & Found Data
    const fetchLostFoundData = async () => {
        try {
            const res = await api.get('/lost-found/items/?admin=true')
            setLostFoundData(res.data.results || res.data || [])
        } catch (error) {
            console.error(error)
            toast.error("Failed to load lost & found reports")
        } finally {
            setIsLostFoundLoading(false)
        }
    }

    useEffect(() => {
        fetchMarketData()
        fetchLostFoundData()
    }, [])

    // Image Preview Handler
    const handleImagePreview = (imageUrl: string | null) => {
        if (imageUrl) {
            setPreviewImageUrl(imageUrl)
            setImagePreviewOpen(true)
        }
    }

    // Marketplace Handlers
    const handleMarketDelete = (item: Product) => {
        setMarketItemToDelete(item)
        setMarketDeleteOpen(true)
    }

    const confirmMarketDelete = async () => {
        if (!marketItemToDelete) return
        try {
            await api.delete(`/market/products/${marketItemToDelete.id}/`)
            toast.success("Listing deleted")
            fetchMarketData()
        } catch (error) {
            toast.error("Failed to delete listing")
        } finally {
            setMarketDeleteOpen(false)
            setMarketItemToDelete(null)
        }
    }

    const toggleMarketSold = async (item: Product) => {
        try {
            await api.patch(`/market/products/${item.id}/`, { is_sold: !item.is_sold })
            toast.success(`Marked as ${!item.is_sold ? 'Sold' : 'Available'}`)
            fetchMarketData()
        } catch (error) {
            toast.error("Failed to update status")
        }
    }

    // Lost & Found Handlers
    const handleLostFoundDelete = (item: LostItem) => {
        setLostFoundItemToDelete(item)
        setLostFoundDeleteOpen(true)
    }

    const confirmLostFoundDelete = async () => {
        if (!lostFoundItemToDelete) return
        try {
            await api.delete(`/lost-found/items/${lostFoundItemToDelete.id}/`)
            toast.success("Report deleted")
            fetchLostFoundData()
        } catch (error) {
            toast.error("Failed to delete report")
        } finally {
            setLostFoundDeleteOpen(false)
            setLostFoundItemToDelete(null)
        }
    }

    const toggleLostFoundResolved = async (item: LostItem) => {
        try {
            await api.patch(`/lost-found/items/${item.id}/`, { is_resolved: !item.is_resolved })
            toast.success(`Marked as ${!item.is_resolved ? 'Resolved' : 'Unresolved'}`)
            fetchLostFoundData()
        } catch (error) {
            toast.error("Failed to update status")
        }
    }

    // Marketplace Columns
    const marketColumns: ColumnDef<Product>[] = [
        {
            accessorKey: "title",
            header: "Item",
            cell: ({ row }) => {
                const product = row.original
                return (
                    <div className="flex items-center gap-3">
                        <div
                            className="relative h-12 w-12 rounded-md overflow-hidden bg-muted border cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handleImagePreview(product.image_url)}
                        >
                            {product.image_url ? (
                                <Image
                                    src={product.image_url}
                                    alt={product.title}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Package className="h-5 w-5 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="font-bold">{product.title}</p>
                            <p className="text-xs text-muted-foreground">
                                {product.category_display}
                            </p>
                        </div>
                    </div>
                )
            }
        },
        {
            accessorKey: "seller",
            header: "Seller",
            cell: ({ row }) => {
                const seller = row.original.seller_details
                if (!seller) {
                    return <span className="text-muted-foreground">Unknown</span>
                }
                return (
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={seller.avatar || undefined} />
                            <AvatarFallback>
                                {seller.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{seller.username}</span>
                    </div>
                )
            }
        },
        {
            accessorKey: "price",
            header: "Price",
            cell: ({ row }) => (
                <span className="font-bold text-green-700">
                    GHS {parseFloat(row.original.price).toFixed(2)}
                </span>
            )
        },
        {
            accessorKey: "condition",
            header: "Condition",
            cell: ({ row }) => (
                <Badge variant="outline">{row.original.condition_display}</Badge>
            )
        },
        {
            accessorKey: "is_sold",
            header: "Status",
            cell: ({ row }) => {
                const product = row.original
                return (
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={product.is_sold}
                            onCheckedChange={() => toggleMarketSold(product)}
                            className="cursor-pointer"
                        />
                        <span className="text-sm">
                            {product.is_sold ? 'Sold' : 'Available'}
                        </span>
                    </div>
                )
            }
        },
        {
            accessorKey: "created_at",
            header: "Date",
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
                    onClick={() => handleMarketDelete(row.original)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            )
        }
    ]

    // Lost & Found Columns
    const lostFoundColumns: ColumnDef<LostItem>[] = [
        {
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => {
                const isLost = row.original.type === 'Lost'
                return (
                    <Badge className={isLost ? "bg-red-100 text-red-800 hover:bg-red-100" : "bg-green-100 text-green-800 hover:bg-green-100"}>
                        {row.original.type_display}
                    </Badge>
                )
            }
        },
        {
            accessorKey: "category",
            header: "Item",
            cell: ({ row }) => {
                const item = row.original
                return (
                    <div className="flex items-center gap-3">
                        <div
                            className="relative h-12 w-12 rounded-md overflow-hidden bg-muted border cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handleImagePreview(item.image_url || null)}
                        >
                            {item.image_url ? (
                                <Image
                                    src={item.image_url}
                                    alt={item.category_display || 'Item'}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="font-bold">{item.category_display}</p>
                            {item.category === 'Student ID' && item.student_name && (
                                <p className="text-xs text-muted-foreground">{item.student_name}</p>
                            )}
                        </div>
                    </div>
                )
            }
        },
        {
            accessorKey: "description",
            header: "Details",
            cell: ({ row }) => {
                const item = row.original
                if (item.category === 'Student ID' && item.student_name) {
                    return <span className="font-medium">{item.student_name}</span>
                }
                return (
                    <span className="text-sm max-w-[200px] truncate block">
                        {item.description}
                    </span>
                )
            }
        },
        {
            accessorKey: "reporter",
            header: "Reporter",
            cell: ({ row }) => {
                const reporter = row.original.reporter_details
                if (!reporter) {
                    return (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Shield className="h-4 w-4" />
                            <span className="text-sm">Anonymous</span>
                        </div>
                    )
                }
                return (
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={reporter.avatar || undefined} />
                            <AvatarFallback>
                                {reporter.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{reporter.username}</span>
                    </div>
                )
            }
        },
        {
            accessorKey: "contact_info",
            header: "Contact",
            cell: ({ row }) => (
                <span className="text-sm">{row.original.contact_info}</span>
            )
        },
        {
            accessorKey: "is_resolved",
            header: "Status",
            cell: ({ row }) => {
                const item = row.original
                return (
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={item.is_resolved || false}
                            onCheckedChange={() => toggleLostFoundResolved(item)}
                            className="cursor-pointer"
                        />
                        <span className="text-sm">
                            {item.is_resolved ? 'Resolved' : 'Open'}
                        </span>
                    </div>
                )
            }
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLostFoundDelete(row.original)}
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
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Content Moderation</h2>
                    <p className="text-muted-foreground">Manage marketplace listings and lost & found reports.</p>
                </div>

                <Tabs defaultValue="market" className="w-full">
                    <TabsList>
                        <TabsTrigger value="market" className="cursor-pointer">Marketplace Listings</TabsTrigger>
                        <TabsTrigger value="lostfound" className="cursor-pointer">Lost & Found Reports</TabsTrigger>
                    </TabsList>

                    <TabsContent value="market" className="space-y-4">
                        {isMarketLoading ? (
                            <div className="flex h-[400px] items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <DataTable columns={marketColumns} data={marketData} searchKey="title" />
                        )}
                    </TabsContent>

                    <TabsContent value="lostfound" className="space-y-4">
                        {isLostFoundLoading ? (
                            <div className="flex h-[400px] items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <DataTable columns={lostFoundColumns} data={lostFoundData} searchKey="description" />
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Image Preview Dialog */}
            <Dialog open={imagePreviewOpen} onOpenChange={setImagePreviewOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Image Preview</DialogTitle>
                    </DialogHeader>
                    {previewImageUrl && (
                        <div className="relative w-full h-[500px] bg-muted rounded-lg overflow-hidden">
                            <Image
                                src={previewImageUrl}
                                alt="Preview"
                                fill
                                className="object-contain"
                                unoptimized
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Marketplace Delete Dialog */}
            <AlertDialog open={marketDeleteOpen} onOpenChange={setMarketDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Marketplace Listing</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove <strong>{marketItemToDelete?.title}</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmMarketDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Lost & Found Delete Dialog */}
            <AlertDialog open={lostFoundDeleteOpen} onOpenChange={setLostFoundDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Lost & Found Report</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove this report? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmLostFoundDelete}
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
