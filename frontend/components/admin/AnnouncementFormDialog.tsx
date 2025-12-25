"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormDescription,
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
import { useEffect, useState } from "react"
import { Announcement } from "@/types"
import { Loader2 } from "lucide-react"
import api from "@/lib/axios"
import { toast } from "sonner"

const announcementSchema = z.object({
    title: z.string().min(2, "Title is required"),
    message: z.string().min(5, "Message must be at least 5 characters"),
    priority: z.enum(['Normal', 'High']),
    related_link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    is_active: z.boolean(),
})

type AnnouncementFormValues = z.infer<typeof announcementSchema>

interface AnnouncementFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    announcement?: Announcement | null
    onSuccess: () => void
}

export function AnnouncementFormDialog({ open, onOpenChange, announcement, onSuccess }: AnnouncementFormDialogProps) {
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<AnnouncementFormValues>({
        resolver: zodResolver(announcementSchema),
        defaultValues: {
            title: "",
            message: "",
            priority: "Normal",
            related_link: "",
            is_active: true,
        },
    })

    useEffect(() => {
        if (announcement) {
            form.reset({
                title: announcement.title,
                message: announcement.message,
                priority: announcement.priority,
                related_link: announcement.related_link || "",
                is_active: announcement.is_active,
            })
        } else {
            form.reset({
                title: "",
                message: "",
                priority: "Normal",
                related_link: "",
                is_active: true,
            })
        }
    }, [announcement, form, open])

    const onSubmit = async (values: AnnouncementFormValues) => {
        setIsLoading(true)
        try {
            if (announcement) {
                await api.patch(`/announcements/${announcement.id}/`, values)
                toast.success("Announcement updated")
            } else {
                await api.post('/announcements/', values)
                toast.success("Announcement posted")
            }
            onSuccess()
            onOpenChange(false)
        } catch (error) {
            console.error(error)
            toast.error("Failed to save announcement")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{announcement ? "Edit Announcement" : "Post Announcement"}</DialogTitle>
                    <DialogDescription>
                        Broadcast a new message to the student body ticker.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Exam Schedule Release" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Message</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Type your announcement here..."
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Priority</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select priority" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Normal">Normal</SelectItem>
                                                <SelectItem value="High">High</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="is_active"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm h-[74px]">
                                        <div className="space-y-0.5">
                                            <FormLabel>Active?</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="related_link"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Related Link (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">Cancel</Button>
                            <Button type="submit" disabled={isLoading} className="cursor-pointer">
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {announcement ? "Save Changes" : "Post Announcement"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
