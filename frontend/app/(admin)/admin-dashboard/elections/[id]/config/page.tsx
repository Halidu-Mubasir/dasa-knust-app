"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, Plus, Trash2, Edit, Users, ArrowLeft, Check, ChevronsUpDown, UserCircle2 } from "lucide-react"
import api from "@/lib/axios"
import { toast } from "sonner"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface Election {
    id: number
    title: string
    start_date: string
    end_date: string
    is_active: boolean
    is_published: boolean
}

interface Position {
    id: number
    election: number
    election_title: string
    name: string
    rank: number
    max_votes_per_user: number
}

interface Candidate {
    id: number
    position: number
    position_name: string
    user: number
    user_details: {
        id: number
        username: string
        email: string
        first_name: string
        last_name: string
        profile?: {
            profile_picture: string
        }
    }
    manifesto: string
    photo: string
    total_votes?: number
}

interface User {
    id: number
    username: string
    email: string
    first_name: string
    last_name: string
    profile?: {
        profile_picture: string
        student_id: string
    }
}

export default function ElectionConfigPage() {
    const params = useParams()
    const router = useRouter()
    const electionId = params?.id as string

    const [election, setElection] = useState<Election | null>(null)
    const [positions, setPositions] = useState<Position[]>([])
    const [candidates, setCandidates] = useState<Candidate[]>([])
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Position Dialog State
    const [positionDialogOpen, setPositionDialogOpen] = useState(false)
    const [editingPosition, setEditingPosition] = useState<Position | null>(null)
    const [isPositionSubmitting, setIsPositionSubmitting] = useState(false)
    const [positionForm, setPositionForm] = useState({
        name: "",
        rank: 0,
        max_votes_per_user: 1,
    })

    // Candidate Dialog State
    const [candidateDialogOpen, setCandidateDialogOpen] = useState(false)
    const [selectedPositionForCandidate, setSelectedPositionForCandidate] = useState<Position | null>(null)
    const [isCandidateSubmitting, setIsCandidateSubmitting] = useState(false)
    const [candidateForm, setCandidateForm] = useState({
        user: null as User | null,
        manifesto: "",
        photo: null as File | null,
    })

    // User Search State
    const [userSearchOpen, setUserSearchOpen] = useState(false)
    const [userSearchQuery, setUserSearchQuery] = useState("")

    // Delete State
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deleteCandidateDialogOpen, setDeleteCandidateDialogOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<Position | Candidate | null>(null)

    // Edit Election State
    const [editElectionDialogOpen, setEditElectionDialogOpen] = useState(false)
    const [isElectionSubmitting, setIsElectionSubmitting] = useState(false)
    const [electionForm, setElectionForm] = useState({
        title: "",
        start_date: "",
        end_date: "",
    })

    // Fetch Data
    const fetchElection = async () => {
        try {
            const res = await api.get(`/elections/elections/${electionId}/`)
            setElection(res.data)
        } catch (error) {
            console.error(error)
            toast.error("Failed to load election")
        }
    }

    const fetchPositions = async () => {
        try {
            const res = await api.get('/elections/positions/', {
                params: { election: electionId }
            })
            const positionsData = (res.data.results || res.data || []).sort((a: Position, b: Position) => a.rank - b.rank)
            setPositions(positionsData)
        } catch (error) {
            console.error(error)
            toast.error("Failed to load positions")
        }
    }

    const fetchCandidates = async () => {
        try {
            // Fetch candidates scoped to THIS election only using query params
            const res = await api.get(`/elections/candidates/?election=${electionId}`)
            const electionCandidates = res.data.results || res.data || []
            setCandidates(electionCandidates)
        } catch (error) {
            console.error(error)
            toast.error("Failed to load candidates")
        } finally {
            setIsLoading(false)
        }
    }

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users/')
            setUsers(res.data.results || res.data || [])
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchElection()
        fetchPositions()
        fetchUsers()
    }, [electionId])

    useEffect(() => {
        if (positions.length > 0) {
            fetchCandidates()
        }
    }, [positions])

    // Position Handlers
    const handleCreatePosition = () => {
        setEditingPosition(null)
        setPositionForm({
            name: "",
            rank: positions.length > 0 ? Math.max(...positions.map(p => p.rank)) + 1 : 0,
            max_votes_per_user: 1,
        })
        setPositionDialogOpen(true)
    }

    const handleEditPosition = (position: Position) => {
        setEditingPosition(position)
        setPositionForm({
            name: position.name,
            rank: position.rank,
            max_votes_per_user: position.max_votes_per_user,
        })
        setPositionDialogOpen(true)
    }

    const handleSubmitPosition = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!positionForm.name) {
            toast.error("Position name is required")
            return
        }

        setIsPositionSubmitting(true)

        const payload = {
            ...positionForm,
            election: parseInt(electionId),
        }

        try {
            if (editingPosition) {
                await api.patch(`/elections/positions/${editingPosition.id}/`, payload)
                toast.success("Position updated successfully")
            } else {
                await api.post('/elections/positions/', payload)
                toast.success("Position created successfully")
            }
            setPositionDialogOpen(false)
            fetchPositions()
        } catch (error: any) {
            console.error(error)
            toast.error(error.response?.data?.detail || "Failed to save position")
        } finally {
            setIsPositionSubmitting(false)
        }
    }

    const handleDeletePosition = (position: Position) => {
        setItemToDelete(position)
        setDeleteDialogOpen(true)
    }

    const confirmDeletePosition = async () => {
        if (!itemToDelete || !('name' in itemToDelete)) return
        try {
            await api.delete(`/elections/positions/${itemToDelete.id}/`)
            toast.success("Position deleted")
            fetchPositions()
        } catch (error) {
            toast.error("Failed to delete position")
        } finally {
            setDeleteDialogOpen(false)
            setItemToDelete(null)
        }
    }

    // Election Edit Handlers
    const handleEditElection = () => {
        if (!election) return

        // Convert ISO strings to datetime-local format (YYYY-MM-DDTHH:mm)
        const formatDateTimeLocal = (isoString: string) => {
            const date = new Date(isoString)
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            const hours = String(date.getHours()).padStart(2, '0')
            const minutes = String(date.getMinutes()).padStart(2, '0')
            return `${year}-${month}-${day}T${hours}:${minutes}`
        }

        setElectionForm({
            title: election.title,
            start_date: formatDateTimeLocal(election.start_date),
            end_date: formatDateTimeLocal(election.end_date),
        })
        setEditElectionDialogOpen(true)
    }

    const handleSubmitElection = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!electionForm.title || !electionForm.start_date || !electionForm.end_date) {
            toast.error("Please fill all required fields")
            return
        }

        // Validate dates
        const startDate = new Date(electionForm.start_date)
        const endDate = new Date(electionForm.end_date)

        if (endDate <= startDate) {
            toast.error("End date must be after start date")
            return
        }

        setIsElectionSubmitting(true)

        const payload = {
            title: electionForm.title,
            start_date: new Date(electionForm.start_date).toISOString(),
            end_date: new Date(electionForm.end_date).toISOString(),
        }

        try {
            await api.patch(`/elections/elections/${electionId}/`, payload)
            toast.success("Election updated successfully")
            setEditElectionDialogOpen(false)
            fetchElection()
        } catch (error: any) {
            console.error(error)
            toast.error(error.response?.data?.detail || "Failed to update election")
        } finally {
            setIsElectionSubmitting(false)
        }
    }

    // Candidate Handlers
    const handleAddCandidate = (position: Position) => {
        setSelectedPositionForCandidate(position)
        setCandidateForm({
            user: null,
            manifesto: "",
            photo: null,
        })
        setCandidateDialogOpen(true)
    }

    const handleSubmitCandidate = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!candidateForm.user || !candidateForm.manifesto || !candidateForm.photo) {
            toast.error("Please fill all required fields")
            return
        }

        if (!selectedPositionForCandidate) return

        setIsCandidateSubmitting(true)

        const formData = new FormData()
        formData.append('position', selectedPositionForCandidate.id.toString())
        formData.append('user', candidateForm.user.id.toString())
        formData.append('manifesto', candidateForm.manifesto)
        formData.append('photo', candidateForm.photo)

        try {
            await api.post('/elections/candidates/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            toast.success("Candidate added successfully")
            setCandidateDialogOpen(false)
            fetchCandidates()
        } catch (error: any) {
            console.error(error)
            toast.error(error.response?.data?.detail || "Failed to add candidate")
        } finally {
            setIsCandidateSubmitting(false)
        }
    }

    const handleDeleteCandidate = (candidate: Candidate) => {
        setItemToDelete(candidate)
        setDeleteCandidateDialogOpen(true)
    }

    const confirmDeleteCandidate = async () => {
        if (!itemToDelete || !('manifesto' in itemToDelete)) return
        try {
            await api.delete(`/elections/candidates/${itemToDelete.id}/`)
            toast.success("Candidate removed")
            fetchCandidates()
        } catch (error) {
            toast.error("Failed to remove candidate")
        } finally {
            setDeleteCandidateDialogOpen(false)
            setItemToDelete(null)
        }
    }

    const getCandidatesForPosition = (positionId: number) => {
        return candidates.filter(c => c.position === positionId)
    }

    const filteredUsers = users.filter(user => {
        const query = userSearchQuery.toLowerCase()
        return (
            user.username.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            user.first_name?.toLowerCase().includes(query) ||
            user.last_name?.toLowerCase().includes(query) ||
            user.profile?.student_id?.toLowerCase().includes(query)
        )
    })

    if (!election) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/admin-dashboard/elections">
                        <Button variant="ghost" size="sm" className="cursor-pointer">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold tracking-tight">{election.title}</h2>
                        <p className="text-muted-foreground">
                            Configure positions and candidates for this election
                        </p>
                    </div>
                    <Button variant="outline" onClick={handleEditElection} type="button" className="cursor-pointer">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Election
                    </Button>
                </div>

                <Separator />

                {/* Positions Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold">Positions</h3>
                            <p className="text-sm text-muted-foreground">
                                Define positions students will vote for
                            </p>
                        </div>
                        <Button onClick={handleCreatePosition} type="button" className="cursor-pointer">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Position
                        </Button>
                    </div>

                    {isLoading ? (
                        <div className="flex h-[200px] items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : positions.length === 0 ? (
                        <Card>
                            <CardContent className="flex h-[200px] items-center justify-center">
                                <div className="text-center">
                                    <Users className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                                    <p className="text-muted-foreground">No positions yet</p>
                                    <p className="text-sm text-muted-foreground">
                                        Add positions to get started
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2">
                            {positions.map((position) => {
                                const positionCandidates = getCandidatesForPosition(position.id)
                                return (
                                    <Card key={position.id}>
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle className="flex items-center gap-2">
                                                        {position.name}
                                                        <Badge variant="outline">Rank {position.rank}</Badge>
                                                    </CardTitle>
                                                    <CardDescription>
                                                        Max votes: {position.max_votes_per_user}
                                                    </CardDescription>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditPosition(position)}
                                                        type="button"
                                                        className="cursor-pointer"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeletePosition(position)}
                                                        className="text-destructive hover:text-destructive cursor-pointer"
                                                        type="button"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <Separator />

                                            <div className="flex items-center justify-between">
                                                <h4 className="font-semibold text-sm">
                                                    Candidates ({positionCandidates.length})
                                                </h4>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleAddCandidate(position)}
                                                    type="button"
                                                    className="cursor-pointer"
                                                >
                                                    <Plus className="h-3 w-3 mr-1" />
                                                    Add
                                                </Button>
                                            </div>

                                            {positionCandidates.length === 0 ? (
                                                <p className="text-sm text-muted-foreground text-center py-4">
                                                    No candidates yet
                                                </p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {positionCandidates.map((candidate) => (
                                                        <div
                                                            key={candidate.id}
                                                            className="flex items-center gap-3 p-2 rounded-md border"
                                                        >
                                                            <Avatar className="h-10 w-10">
                                                                <AvatarImage src={candidate.photo || candidate.user_details?.profile?.profile_picture || undefined} />
                                                                <AvatarFallback>
                                                                    {candidate.user_details?.first_name?.[0]}
                                                                    {candidate.user_details?.last_name?.[0]}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-sm truncate">
                                                                    {candidate.user_details?.first_name} {candidate.user_details?.last_name}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground truncate">
                                                                    {candidate.user_details?.email}
                                                                </p>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteCandidate(candidate)}
                                                                className="text-destructive hover:text-destructive cursor-pointer"
                                                                type="button"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Position Dialog */}
            <Dialog open={positionDialogOpen} onOpenChange={setPositionDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingPosition ? "Edit Position" : "Add Position"}
                        </DialogTitle>
                        <DialogDescription>
                            Configure the position details and voting rules
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitPosition} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="position_name">Position Name *</Label>
                            <Input
                                id="position_name"
                                value={positionForm.name}
                                onChange={(e) => setPositionForm({ ...positionForm, name: e.target.value })}
                                placeholder="e.g., President, General Secretary"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="rank">Rank (Display Order) *</Label>
                                <Input
                                    id="rank"
                                    type="number"
                                    value={positionForm.rank}
                                    onChange={(e) => setPositionForm({ ...positionForm, rank: parseInt(e.target.value) })}
                                    placeholder="0"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Lower numbers appear first
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="max_votes">Max Votes Per User *</Label>
                                <Input
                                    id="max_votes"
                                    type="number"
                                    min="1"
                                    value={positionForm.max_votes_per_user}
                                    onChange={(e) => setPositionForm({ ...positionForm, max_votes_per_user: parseInt(e.target.value) })}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Usually 1
                                </p>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setPositionDialogOpen(false)}  className="cursor-pointer">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPositionSubmitting} className="cursor-pointer">
                                {isPositionSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingPosition ? "Update" : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Add Candidate Dialog */}
            <Dialog open={candidateDialogOpen} onOpenChange={setCandidateDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add Candidate</DialogTitle>
                        <DialogDescription>
                            Add a candidate for {selectedPositionForCandidate?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitCandidate} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Select User *</Label>
                            <Popover open={userSearchOpen} onOpenChange={setUserSearchOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={userSearchOpen}
                                        className="w-full justify-between"
                                    >
                                        {candidateForm.user ? (
                                            <div className="flex items-center gap-2">
                                                <UserCircle2 className="h-4 w-4" />
                                                <span>
                                                    {candidateForm.user.first_name} {candidateForm.user.last_name} ({candidateForm.user.username})
                                                </span>
                                            </div>
                                        ) : (
                                            "Select user..."
                                        )}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0">
                                    <Command>
                                        <CommandInput
                                            placeholder="Search by name, email, or student ID..."
                                            value={userSearchQuery}
                                            onValueChange={setUserSearchQuery}
                                        />
                                        <CommandEmpty>No user found.</CommandEmpty>
                                        <CommandGroup className="max-h-[300px] overflow-auto">
                                            {filteredUsers.map((user) => (
                                                <CommandItem
                                                    key={user.id}
                                                    value={user.id.toString()}
                                                    onSelect={() => {
                                                        setCandidateForm({ ...candidateForm, user })
                                                        setUserSearchOpen(false)
                                                        setUserSearchQuery("")
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            candidateForm.user?.id === user.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={user.profile?.profile_picture || undefined} />
                                                            <AvatarFallback>
                                                                {user.first_name?.[0]}{user.last_name?.[0]}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-sm font-medium">
                                                                {user.first_name} {user.last_name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {user.email} {user.profile?.student_id && `• ${user.profile.student_id}`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="manifesto">Manifesto *</Label>
                            <Textarea
                                id="manifesto"
                                value={candidateForm.manifesto}
                                onChange={(e) => setCandidateForm({ ...candidateForm, manifesto: e.target.value })}
                                placeholder="Candidate's campaign message and promises..."
                                className="min-h-[100px]"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="photo">Photo *</Label>
                            <Input
                                id="photo"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setCandidateForm({ ...candidateForm, photo: e.target.files?.[0] || null })}
                                required
                            />
                            {candidateForm.photo && (
                                <p className="text-xs text-muted-foreground">
                                    Selected: {candidateForm.photo.name}
                                </p>
                            )}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setCandidateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isCandidateSubmitting}>
                                {isCandidateSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Add Candidate
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Position Confirmation */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Position</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this position?
                            This will also delete all candidates and votes for this position. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeletePosition}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Candidate Confirmation */}
            <AlertDialog open={deleteCandidateDialogOpen} onOpenChange={setDeleteCandidateDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Candidate</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove this candidate?
                            This will also delete all votes for this candidate. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteCandidate}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Edit Election Dialog */}
            <Dialog open={editElectionDialogOpen} onOpenChange={setEditElectionDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Election</DialogTitle>
                        <DialogDescription>
                            Update the election title and timeline
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitElection} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-title">Election Title *</Label>
                            <Input
                                id="edit-title"
                                value={electionForm.title}
                                onChange={(e) => setElectionForm({ ...electionForm, title: e.target.value })}
                                placeholder="e.g., 2024/2025 Executive Elections"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-start-date">Start Date & Time *</Label>
                            <Input
                                id="edit-start-date"
                                type="datetime-local"
                                value={electionForm.start_date}
                                onChange={(e) => setElectionForm({ ...electionForm, start_date: e.target.value })}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                When voting should begin
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-end-date">End Date & Time *</Label>
                            <Input
                                id="edit-end-date"
                                type="datetime-local"
                                value={electionForm.end_date}
                                onChange={(e) => setElectionForm({ ...electionForm, end_date: e.target.value })}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                When voting should close
                            </p>
                        </div>

                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                            <p className="text-xs text-amber-900">
                                ⚠️ <strong>Warning:</strong> Changing dates may affect ongoing votes or scheduled elections.
                            </p>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditElectionDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isElectionSubmitting}>
                                {isElectionSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Update Election
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
