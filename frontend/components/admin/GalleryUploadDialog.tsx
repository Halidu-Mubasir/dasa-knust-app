"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useEffect, useState } from "react"
import { Loader2, Image as ImageIcon, Video, UploadCloud } from "lucide-react"
import api from "@/lib/axios"
import { toast } from "sonner"
import Image from "next/image"

const gallerySchema = z.object({
    title: z.string().min(2, "Title is required"),
    category: z.enum(['General', 'Sports', 'Cultural', 'Politics', 'Excursion']),
    media_type: z.enum(['Image', 'Video']),
})

type GalleryFormValues = z.infer<typeof gallerySchema>

interface GalleryUploadDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function GalleryUploadDialog({ open, onOpenChange, onSuccess }: GalleryUploadDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [preview, setPreview] = useState<string | null>(null)
    const [file, setFile] = useState<File | null>(null)
    const [videoThumbnail, setVideoThumbnail] = useState<File | null>(null)
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)

    const form = useForm<GalleryFormValues>({
        resolver: zodResolver(gallerySchema),
        defaultValues: {
            title: "",
            category: "General",
            media_type: "Image",
        },
    })

    // Reset when dialog opens/closes
    useEffect(() => {
        if (!open) {
            form.reset()
            setFile(null)
            setVideoThumbnail(null)
            setPreview(null)
            setThumbnailPreview(null)
        }
    }, [open, form])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader()
                reader.onloadend = () => setPreview(reader.result as string)
                reader.readAsDataURL(selectedFile)
            } else {
                setPreview(null) // No preview for video file directly
            }
        }
    }

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setVideoThumbnail(file)
            const reader = new FileReader()
            reader.onloadend = () => setThumbnailPreview(reader.result as string)
            reader.readAsDataURL(file)
        }
    }

    const onSubmit = async (values: GalleryFormValues) => {
        if (!file) return toast.error("Please select a file to upload")
        if (values.media_type === 'Video' && !videoThumbnail) return toast.error("Video thumbnail is required")

        setIsLoading(true)
        const formData = new FormData()
        formData.append('title', values.title)
        formData.append('category', values.category)
        formData.append('media_type', values.media_type)

        if (values.media_type === 'Image') {
            formData.append('image', file)
        } else {
            formData.append('video', file)
            if (videoThumbnail) {
                formData.append('video_thumbnail', videoThumbnail)
            }
        }

        try {
            await api.post('/gallery/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            toast.success("Media uploaded successfully")
            onSuccess()
            onOpenChange(false)
        } catch (error) {
            console.error(error)
            toast.error("Upload failed")
        } finally {
            setIsLoading(false)
        }
    }

    const mediaType = form.watch("media_type")

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Upload to Gallery</DialogTitle>
                    <DialogDescription>
                        Share photos or videos from campus events.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 pb-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title / Caption</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Freshers' Akwaaba Night" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="General">General</SelectItem>
                                            <SelectItem value="Sports">Sports</SelectItem>
                                            <SelectItem value="Cultural">Cultural</SelectItem>
                                            <SelectItem value="Politics">Politics</SelectItem>
                                            <SelectItem value="Excursion">Excursion</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="media_type"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Media Type</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex flex-col space-y-1"
                                        >
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="Image" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Image (Photo)
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="Video" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Video (MP4 / WebM)
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid gap-4 p-4 border rounded-lg bg-muted/50">
                            <div className="space-y-2">
                                <Label>{mediaType === 'Image' ? 'Select Image' : 'Select Video File'}</Label>
                                <Input
                                    type="file"
                                    accept={mediaType === 'Image' ? "image/*" : "video/*"}
                                    onChange={handleFileChange}
                                />
                                {mediaType === 'Image' && preview && (
                                    <div className="relative h-32 w-full rounded overflow-hidden">
                                        <Image src={preview} alt="Preview" fill className="object-contain" />
                                    </div>
                                )}
                            </div>

                            {mediaType === 'Video' && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <Label>Video Caption / Cover Image</Label>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleThumbnailChange}
                                    />
                                    {thumbnailPreview && (
                                        <div className="relative h-32 w-full rounded overflow-hidden">
                                            <Image src={thumbnailPreview} alt="Thumbnail Preview" fill className="object-cover" />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Upload Media
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
