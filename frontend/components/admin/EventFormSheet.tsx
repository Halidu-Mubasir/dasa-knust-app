"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { useEffect, useState } from "react"
import { Event } from "@/types"
import { Loader2, CalendarIcon, Clock, MapPin, Image as ImageIcon } from "lucide-react"
import api from "@/lib/axios"
import { toast } from "sonner"
import Image from "next/image"

const eventSchema = z.object({
    title: z.string().min(2, "Title is required"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    location: z.string().min(2, "Location is required"),
    date: z.string().min(1, "Date is required"),
    start_time: z.string().min(1, "Start time is required"),
    end_time: z.string().min(1, "End time is required"),
    is_featured: z.boolean().default(false),
    registration_required: z.boolean().default(false),
    registration_link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    external_registration_link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
})

type EventFormValues = z.infer<typeof eventSchema>

interface EventFormSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    event?: Event | null
    onSuccess: () => void
}

export function EventFormSheet({ open, onOpenChange, event, onSuccess }: EventFormSheetProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [image, setImage] = useState<File | null>(null)

    const form = useForm<EventFormValues>({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            title: "",
            description: "",
            location: "",
            date: "",
            start_time: "",
            end_time: "",
            is_featured: false,
            registration_required: false,
            registration_link: "",
            external_registration_link: "",
        },
    })

    useEffect(() => {
        if (event) {
            form.reset({
                title: event.title,
                description: event.description,
                location: event.location,
                date: event.date,
                start_time: event.start_time,
                end_time: event.end_time,
                is_featured: event.is_featured,
                registration_required: event.registration_required,
                registration_link: event.registration_link || "",
            })
            setImagePreview(event.event_image_url)
        } else {
            form.reset({
                title: "",
                description: "",
                location: "",
                date: "",
                start_time: "",
                end_time: "",
                is_featured: false,
                registration_required: false,
                registration_link: "",
                external_registration_link: "",
            })
            setImagePreview(null)
        }
    }, [event, form, open])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImage(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const onSubmit = async (values: EventFormValues) => {
        setIsLoading(true)
        const formData = new FormData()
        Object.entries(values).forEach(([key, value]) => {
            formData.append(key, value.toString())
        })
        if (image) {
            formData.append('event_image', image)
        }

        try {
            if (event) {
                await api.patch(`/events/${event.id}/`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                toast.success("Event updated successfully")
            } else {
                await api.post('/events/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                toast.success("Event created successfully")
            }
            onSuccess()
            onOpenChange(false)
        } catch (error) {
            console.error(error)
            toast.error("Failed to save event")
        } finally {
            setIsLoading(false)
        }
    }

    const registrationRequired = form.watch("registration_required")

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{event ? "Edit Event" : "Create New Event"}</SheetTitle>
                    <SheetDescription>
                        {event ? "Update event details and schedule." : "Add a new event to the calendar."}
                    </SheetDescription>
                </SheetHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Event Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Annual Tech Symposium" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Describe the event..." className="min-h-[100px]" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                        Date
                                    </FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        Location
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. KNUST Great Hall" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="start_time"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            Start Time
                                        </FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="end_time"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            End Time
                                        </FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-4 rounded-lg border p-4">
                            <h4 className="font-medium text-sm">Settings</h4>

                            <FormField
                                control={form.control}
                                name="is_featured"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>Feature on Homepage</FormLabel>
                                            <FormDescription>
                                                Show this event in the featured section
                                            </FormDescription>
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

                            <FormField
                                control={form.control}
                                name="registration_required"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>Requires Registration</FormLabel>
                                            <FormDescription>
                                                Users need to sign up for this event
                                            </FormDescription>
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

                            {registrationRequired && (
                                <FormField
                                    control={form.control}
                                    name="registration_link"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Registration Link (Optional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://..." {...field} />
                                            </FormControl>
                                            <FormDescription>If empty, internal registration will be used.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        <div className="space-y-3">
                            <Label className="flex items-center gap-2">
                                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                Event Image
                            </Label>
                            {imagePreview && (
                                <div className="relative h-32 w-full rounded-lg overflow-hidden border bg-muted">
                                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                                </div>
                            )}
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="cursor-pointer"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {event ? "Save Changes" : "Create Event"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    )
}
