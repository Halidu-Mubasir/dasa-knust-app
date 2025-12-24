'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CalendarProps {
    mode?: 'single';
    selected?: Date;
    onSelect?: (date: Date | undefined) => void;
    modifiers?: {
        hasEvent?: Date[];
    };
    className?: string;
}

function Calendar({ mode, selected, onSelect, modifiers, className }: CalendarProps) {
    const [currentMonth, setCurrentMonth] = React.useState(new Date());

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isToday = (date: Date) => {
        return date.toDateString() === today.toDateString();
    };

    const isSelected = (date: Date) => {
        if (!selected) return false;
        return date.toDateString() === selected.toDateString();
    };

    const hasEvent = (date: Date) => {
        if (!modifiers?.hasEvent) return false;
        return modifiers.hasEvent.some(eventDate =>
            eventDate.toDateString() === date.toDateString()
        );
    };

    const previousMonth = () => {
        setCurrentMonth(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(year, month + 1, 1));
    };

    // Build calendar grid
    const calendarDays: (Date | null)[] = [];

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        calendarDays.push(new Date(year, month - 1, daysInPrevMonth - i));
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push(new Date(year, month, i));
    }

    // Next month days to fill grid
    const remainingDays = 42 - calendarDays.length;
    for (let i = 1; i <= remainingDays; i++) {
        calendarDays.push(new Date(year, month + 1, i));
    }

    return (
        <div className={cn('p-3', className)}>
            {/* Header with navigation */}
            <div className="flex items-center justify-between mb-4">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={previousMonth}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-medium">
                    {monthNames[month]} {year}
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={nextMonth}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                    <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, index) => {
                    if (!date) return <div key={index} />;

                    const isCurrentMonth = date.getMonth() === month;
                    const isTodayDate = isToday(date);
                    const isSelectedDate = isSelected(date);
                    const hasEventDate = hasEvent(date);

                    return (
                        <button
                            key={index}
                            onClick={() => onSelect?.(date)}
                            className={cn(
                                'h-9 w-full p-0 font-normal text-sm rounded-md hover:bg-accent transition-colors',
                                !isCurrentMonth && 'text-muted-foreground opacity-50',
                                isTodayDate && 'bg-yellow-100 font-bold border-2 border-yellow-500',
                                isSelectedDate && 'bg-primary text-primary-foreground hover:bg-primary',
                                hasEventDate && !isSelectedDate && 'bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90'
                            )}
                        >
                            {date.getDate()}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

Calendar.displayName = 'Calendar';

export { Calendar };
