'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarPlus, MapPin, Clock, Loader2 } from 'lucide-react';
import api from '@/lib/axios';
import { Event } from '@/types';
import { toast } from 'sonner';

function EventCard({ event }: { event: Event }) {
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    // Parse date string to Date object
    const eventDate = new Date(event.date);
    const month = monthNames[eventDate.getMonth()];
    const day = eventDate.getDate();

    return (
        <Card className="hover:shadow-md transition-shadow overflow-hidden group">
            {event.event_image_url && (
                <div className="relative w-full h-48 bg-muted">
                    <img
                        src={event.event_image_url}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                </div>
            )}
            <CardContent className="p-6">
                <div className="flex gap-4">
                    {/* Date Box */}
                    <div className="shrink-0 w-16 h-16 bg-primary/10 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-xs font-bold text-primary">
                            {month}
                        </span>
                        <span className="text-2xl font-bold text-primary">
                            {day}
                        </span>
                    </div>

                    {/* Event Details */}
                    <div className="flex-1">
                        <h3 className="text-lg font-bold mb-2">{event.title}</h3>
                        <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{event.time_display}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{event.location}</span>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                            {event.description}
                        </p>
                    </div>

                    {/* Registration/Add to Calendar Button */}
                    <div className="shrink-0">
                        {event.registration_required && event.registration_link ? (
                            <a href={event.registration_link} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm" className='text-xs text-muted-foreground bg-blue-200 cursor-pointer'>
                                    Register
                                </Button>
                            </a>
                        ) : (
                            <Button variant="outline" size="sm">
                                <CalendarPlus className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function EventsPage() {
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                const response = await api.get('/events/');
                const eventData = response.data;
                // Handle pagination if present (DRF default is { results: [...] })
                const eventsList = Array.isArray(eventData) ? eventData : (eventData.results || []);
                setEvents(eventsList);
                setError(null);
            } catch (err) {
                console.error('Error fetching events:', err);
                // Avoid use of 'any'; provide a more specific check
                let errorMessage = 'Failed to load events';
                if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object') {
                    const response = err.response as { data?: { detail?: string } };
                    if (response.data && typeof response.data.detail === 'string') {
                        errorMessage = response.data.detail;
                    }
                }
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    // Extract event dates for calendar highlighting
    const eventDates = useMemo(() => {
        return events.map(event => new Date(event.date));
    }, [events]);

    // Filter events based on selected date
    const filteredEvents = useMemo(() => {
        if (!date) return events;
        return events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.toDateString() === date.toDateString();
        });
    }, [date, events]);

    if (loading) {
        return (
            <div className="min-h-screen py-16 bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading events...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen py-16 bg-background">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-md mx-auto">
                        <h2 className="text-2xl font-bold mb-4">Unable to Load Events</h2>
                        <p className="text-muted-foreground mb-6">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-16 bg-background">
            <div className="container mx-auto px-4">
                {/* Header */}
                {/* Header */}
                <PageHeader
                    title="Upcoming Events"
                    description="Stay updated with all DASA activities, meetings, and celebrations"
                />

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-8">
                    {/* Left Column - Calendar */}
                    <div className="lg:sticky lg:top-20 self-start">
                        <Card>
                            <CardHeader>
                                <h2 className="text-xl font-bold">Calendar</h2>
                            </CardHeader>
                            <CardContent>
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    modifiers={{ hasEvent: eventDates }}
                                    className="rounded-md border"
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Events List */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold">
                                {date ? `Events for ${date.toDateString()}` : 'All Upcoming Events'}
                            </h2>
                            {date && (
                                <Button variant="ghost" size="sm" onClick={() => setDate(undefined)}>
                                    View All
                                </Button>
                            )}
                        </div>

                        {filteredEvents.length > 0 ? (
                            filteredEvents.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))
                        ) : (
                            <Card className="p-12">
                                <div className="text-center text-muted-foreground">
                                    <CalendarPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg font-medium mb-2">No events on this date</p>
                                    <p className="text-sm">Select another date to view scheduled events</p>
                                    <Button variant="link" onClick={() => setDate(undefined)}>
                                        View all upcoming events
                                    </Button>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
