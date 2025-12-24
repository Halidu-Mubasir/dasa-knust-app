"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Loader2, Plus, Trash2, Download, FileText } from "lucide-react"
import api from "@/lib/axios"
import { toast } from "sonner"
import { AcademicResource } from "@/types"
import { format } from "date-fns"

export default function PascoPage() {
    const [data, setData] = useState<AcademicResource[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<AcademicResource | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        course_code: "",
        college: "",
        level: "",
        semester: "",
        file: null as File | null,
    })

    const fetchData = async () => {
        try {
            const res = await api.get('/resources/')
            setData(res.data.results || res.data || [])
        } catch (error) {
            console.error(error)
            toast.error("Failed to load resources")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleDelete = (item: AcademicResource) => {
        setItemToDelete(item)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!itemToDelete) return
        try {
            await api.delete(`/resources/${itemToDelete.id}/`)
            toast.success("Resource deleted")
            fetchData()
        } catch (error) {
            toast.error("Failed to delete resource")
        } finally {
            setDeleteDialogOpen(false)
            setItemToDelete(null)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        if (!formData.title || !formData.course_code || !formData.college || !formData.level || !formData.semester || !formData.file) {
            toast.error("Please fill all required fields")
            return
        }

        setIsSubmitting(true)

        const data = new FormData()
        data.append('title', formData.title)
        data.append('course_code', formData.course_code)
        data.append('college', formData.college)
        data.append('level', formData.level)
        data.append('semester', formData.semester)
        data.append('file', formData.file)

        try {
            await api.post('/resources/', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            toast.success("Resource uploaded successfully")
            setDialogOpen(false)
            setFormData({
                title: "",
                course_code: "",
                college: "",
                level: "",
                semester: "",
                file: null,
            })
            fetchData()
        } catch (error: any) {
            console.error(error)
            toast.error(error.response?.data?.detail || "Failed to upload resource")
        } finally {
            setIsSubmitting(false)
        }
    }

    const columns: ColumnDef<AcademicResource>[] = [
        {
            accessorKey: "title",
            header: "Resource",
            cell: ({ row }) => {
                const resource = row.original
                return (
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                            <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-bold">{resource.title}</p>
                            <p className="text-xs text-muted-foreground">{resource.course_code}</p>
                        </div>
                    </div>
                )
            }
        },
        {
            accessorKey: "context",
            header: "Context",
            cell: ({ row }) => {
                const resource = row.original
                return (
                    <div className="flex gap-1.5 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                            {resource.college_display}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                            Lvl {resource.level}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                            Sem {resource.semester}
                        </Badge>
                    </div>
                )
            }
        },
        {
            accessorKey: "downloads",
            header: "Downloads",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{row.original.downloads}</span>
                </div>
            )
        },
        {
            accessorKey: "uploaded_at",
            header: "Date",
            cell: ({ row }) => {
                try {
                    return format(new Date(row.original.uploaded_at), "MMM d, yyyy")
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
                        <h2 className="text-3xl font-bold tracking-tight">Academic Resources (Pasco)</h2>
                        <p className="text-muted-foreground">Upload and manage PDF resources for students.</p>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="cursor-pointer">
                                <Plus className="mr-2 h-4 w-4" /> Upload Resource
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Upload Academic Resource</DialogTitle>
                                <DialogDescription>
                                    Add a new PDF resource for students to access.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title *</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g. Calculus I Lecture Notes"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="course_code">Course Code *</Label>
                                    <Input
                                        id="course_code"
                                        value={formData.course_code}
                                        onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                                        placeholder="e.g. MATH 151"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="college">College *</Label>
                                        <Select
                                            value={formData.college}
                                            onValueChange={(value) => setFormData({ ...formData, college: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="CoS">CoS</SelectItem>
                                                <SelectItem value="CoE">CoE</SelectItem>
                                                <SelectItem value="CoHS">CoHS</SelectItem>
                                                <SelectItem value="CABE">CABE</SelectItem>
                                                <SelectItem value="CoHSS">CoHSS</SelectItem>
                                                <SelectItem value="CANR">CANR</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="level">Level *</Label>
                                        <Select
                                            value={formData.level}
                                            onValueChange={(value) => setFormData({ ...formData, level: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="100">100</SelectItem>
                                                <SelectItem value="200">200</SelectItem>
                                                <SelectItem value="300">300</SelectItem>
                                                <SelectItem value="400">400</SelectItem>
                                                <SelectItem value="500">500</SelectItem>
                                                <SelectItem value="600">600</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="semester">Semester *</Label>
                                        <Select
                                            value={formData.semester}
                                            onValueChange={(value) => setFormData({ ...formData, semester: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sem" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">1</SelectItem>
                                                <SelectItem value="2">2</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="file">File (PDF/PPT) *</Label>
                                    <Input
                                        id="file"
                                        type="file"
                                        accept=".pdf,.ppt,.pptx"
                                        onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                                        required
                                    />
                                    {formData.file && (
                                        <p className="text-xs text-muted-foreground">
                                            Selected: {formData.file.name}
                                        </p>
                                    )}
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="cursor-pointer">
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Upload
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
                        <AlertDialogTitle>Delete Resource</AlertDialogTitle>
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
