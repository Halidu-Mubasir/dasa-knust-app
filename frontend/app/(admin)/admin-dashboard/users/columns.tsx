"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, User as UserIcon, ShieldAlert, ShieldCheck, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "@/types"
import api from "@/lib/axios"
import { toast } from "sonner"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type UserColumn = {
    id: string
    username: string
    email: string
    is_staff: boolean
    is_superuser: boolean
    is_active: boolean // Assuming we have this, or infer from somewhere
    profile_picture?: string
    student_id?: string // Assuming frontend has this mapping or we use profile
}

// Create columns factory to support callbacks
export const createColumns = (onViewDetails: (user: User) => void): ColumnDef<User>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
                className="cursor-pointer"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="cursor-pointer"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "username",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    User
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const user = row.original
            return (
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profile?.profile_picture || undefined} />
                        <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium">{user.username}</span>
                        <span className="text-xs text-muted-foreground">{user.profile?.student_id || "No ID"}</span>
                    </div>
                </div>
            )
        }
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
            const isStaff = row.original.is_staff;
            const isSuperUser = row.original.is_superuser;

            if (isSuperUser) return <Badge variant="destructive" className="flex w-fit items-center gap-1"><ShieldAlert className="h-3 w-3" /> Superuser</Badge>
            if (isStaff) return <Badge variant="default" className="flex w-fit items-center gap-1"><ShieldCheck className="h-3 w-3" /> Admin</Badge>
            return <Badge variant="secondary">Student</Badge>
        }
    },
    {
        accessorKey: "profile.hall_of_residence",
        header: "Hall",
        cell: ({ row }) => {
            const hall = row.original.profile?.hall_of_residence;
            return <span className="text-sm">{hall || "—"}</span>;
        }
    },
    {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => {
            const isActive = row.original.is_active;
            if (isActive === false) {
                return <Badge variant="destructive">Banned</Badge>;
            }
            return <Badge variant="default" className="bg-green-600">Active</Badge>;
        }
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const user = row.original

            return (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(user)}
                    className="cursor-pointer hover:bg-secondary/90 hover:text-secondary-foreground"
                >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                </Button>
            )
        },
    },
]

// Export default columns for backward compatibility (will show basic view without detail sheet)
export const columns = createColumns(() => {});
