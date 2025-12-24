"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Calendar, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge" // Ensure Badge exists
import { format } from "date-fns"
import Link from "next/link"

// Define Election type shape
export type Election = {
    id: string
    title: string
    description?: string // optional
    start_date: string
    end_date: string
    is_active: boolean
    is_published?: boolean
    // add other fields if needed
}

export const columns: ColumnDef<Election>[] = [
    {
        accessorKey: "title",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Title
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const isActive = row.original.is_active;
            const now = new Date();
            const start = new Date(row.original.start_date);
            const end = new Date(row.original.end_date);

            let status = "Scheduled";
            let variant: "default" | "secondary" | "destructive" | "outline" = "outline";

            if (isActive) {
                status = "Voting Open";
                variant = "default"; // Green/Primary
            } else if (now > end) {
                status = "Completed";
                variant = "secondary";
            } else if (now < start) {
                status = "Upcoming";
                variant = "outline";
            } else {
                // Case where it's in time range but is_active is false (e.g. paused or setup)
                status = "Draft/Paused";
                variant = "destructive";
            }

            return <Badge variant={variant}>{status}</Badge>
        }
    },
    {
        accessorKey: "start_date",
        header: "Start Date",
        cell: ({ row }) => {
            return <div className="flex items-center gap-2"><Calendar className="h-3 w-3 text-muted-foreground" /> {format(new Date(row.original.start_date), "PPP")}</div>
        }
    },
    {
        accessorKey: "end_date",
        header: "End Date",
        cell: ({ row }) => {
            return <div className="flex items-center gap-2"><Calendar className="h-3 w-3 text-muted-foreground" /> {format(new Date(row.original.end_date), "PPP")}</div>
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const election = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link href={`/admin-dashboard/elections/${election.id}`}>
                                Manage Candidates
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(election.id)}>
                            Copy ID
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
