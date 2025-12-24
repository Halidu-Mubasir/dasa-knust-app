"use client"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { useEffect, useState } from "react"
import { Loader2, Shield, Eye, Trash2 } from "lucide-react"
import api from "@/lib/axios"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { WelfareReport } from "@/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { WelfareDetailSheet } from "@/components/admin/WelfareDetailSheet"
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

export default function WelfarePage() {
    const [data, setData] = useState<WelfareReport[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedReport, setSelectedReport] = useState<WelfareReport | null>(null)
    const [sheetOpen, setSheetOpen] = useState(false)
    const [selectedIds, setSelectedIds] = useState<number[]>([])
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const fetchData = async () => {
        try {
            const res = await api.get('/welfare/reports/')
            console.log("Welfare Data:", res.data)

            // Handle paginated response
            if (res.data.results && Array.isArray(res.data.results)) {
                setData(res.data.results)
            } else if (Array.isArray(res.data)) {
                setData(res.data)
            } else {
                setData([])
            }
        } catch (error) {
            console.error("Failed to load welfare reports:", error)
            toast.error("Failed to load welfare reports")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleViewDetails = (report: WelfareReport) => {
        setSelectedReport(report)
        setSheetOpen(true)
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
            await Promise.all(selectedIds.map(id => api.delete(`/welfare/reports/${id}/`)))
            toast.success(`${selectedIds.length} report(s) deleted`)
            setSelectedIds([])
            fetchData()
        } catch (error) {
            toast.error("Failed to delete some reports")
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

    const getStatusBadge = (status: string) => {
        const statusValue = status || 'Pending'

        if (statusValue === 'Pending') {
            return <Badge className="bg-yellow-200 text-yellow-900 hover:bg-yellow-200">Pending</Badge>
        }
        if (statusValue === 'Investigating') {
            return <Badge className="bg-blue-200 text-blue-900 hover:bg-blue-200">Investigating</Badge>
        }
        if (statusValue === 'Resolved') {
            return <Badge className="bg-green-200 text-green-900 hover:bg-green-200">Resolved</Badge>
        }
        return <Badge>{statusValue}</Badge>
    }

    const columns: ColumnDef<WelfareReport>[] = [
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
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => getStatusBadge(row.original.status || 'Pending')
        },
        {
            accessorKey: "category",
            header: "Category",
            cell: ({ row }) => (
                <span className="font-bold">{row.original.category}</span>
            )
        },
        {
            accessorKey: "reporter_details",
            header: "Reporter",
            cell: ({ row }) => {
                const report = row.original

                if (report.is_anonymous || !report.reporter_details) {
                    return (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Shield className="h-4 w-4" />
                            <span>Anonymous</span>
                        </div>
                    )
                }

                return (
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={report.reporter_details.avatar || undefined} />
                            <AvatarFallback>
                                {report.reporter_details.full_name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium text-sm">{report.reporter_details.full_name}</p>
                            <p className="text-xs text-muted-foreground">{report.reporter_details.username}</p>
                        </div>
                    </div>
                )
            }
        },
        {
            accessorKey: "created_at",
            header: "Date",
            cell: ({ row }) => {
                try {
                    return format(new Date(row.original.created_at!), 'dd MMM, hh:mm a')
                } catch {
                    return 'Invalid date'
                }
            }
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(row.original)}
                    type="button"
                    className="cursor-pointer hover:bg-secondary/90 hover:text-secondary-foreground"
                >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                </Button>
            )
        }
    ]

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Welfare Reports</h2>
                        <p className="text-muted-foreground">Manage student complaints and support requests.</p>
                    </div>
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
                </div>

                {isLoading ? (
                    <div className="flex h-[400px] items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <DataTable columns={columns} data={data} searchKey="category" onSelectionChange={(ids: number[]) => setSelectedIds(ids)} />
                )}
            </div>

            <WelfareDetailSheet
                report={selectedReport}
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                onUpdate={fetchData}
            />

            <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Multiple Reports</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedIds.length} welfare report(s)? This action cannot be undone.
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
