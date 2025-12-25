"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Users, Vote, TrendingUp, Clock, ArrowLeft, Settings, RefreshCw } from "lucide-react"
import api from "@/lib/axios"
import { toast } from "sonner"
import Link from "next/link"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from "recharts"
import { differenceInSeconds, differenceInMinutes, differenceInHours, differenceInDays, format } from "date-fns"

interface Election {
    id: number
    title: string
    start_date: string
    end_date: string
    is_active: boolean
    is_published: boolean
}

interface CandidateResult {
    candidate_id: number
    candidate_name: string
    candidate_username: string
    photo: string | null
    vote_count: number
}

interface PositionResult {
    position_id: number
    position_name: string
    rank: number
    total_votes: number
    candidates: CandidateResult[]
}

interface ElectionStats {
    election_id: number
    election_title: string
    is_active: boolean
    is_published: boolean
    total_votes_cast: number
    total_voters: number
    total_registered_users: number
    turnout_percentage: number
    results_by_position: PositionResult[]
}

export default function ElectionAnalyticsPage() {
    const params = useParams()
    const router = useRouter()
    const electionId = params?.id as string

    const [election, setElection] = useState<Election | null>(null)
    const [stats, setStats] = useState<ElectionStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [timeRemaining, setTimeRemaining] = useState<string>("")
    const [isRefreshing, setIsRefreshing] = useState(false)

    // Fetch election details
    const fetchElection = async () => {
        try {
            const res = await api.get(`/elections/elections/${electionId}/`)
            setElection(res.data)
        } catch (error) {
            console.error(error)
            toast.error("Failed to load election")
        }
    }

    // Fetch stats
    const fetchStats = async (showToast = false) => {
        try {
            setIsRefreshing(true)
            const res = await api.get(`/elections/elections/${electionId}/stats/`)
            setStats(res.data)
            if (showToast) {
                toast.success("Stats refreshed")
            }
        } catch (error) {
            console.error(error)
            if (showToast) {
                toast.error("Failed to refresh stats")
            }
        } finally {
            setIsRefreshing(false)
            setIsLoading(false)
        }
    }

    // Initial load
    useEffect(() => {
        fetchElection()
        fetchStats()
    }, [electionId])

    // Auto-refresh polling for active elections (every 15 seconds)
    useEffect(() => {
        if (!election?.is_active) return

        const interval = setInterval(() => {
            fetchStats()
        }, 15000) // 15 seconds

        return () => clearInterval(interval)
    }, [election?.is_active, electionId])

    // Countdown timer
    useEffect(() => {
        if (!election) return

        const updateCountdown = () => {
            const now = new Date()
            const endDate = new Date(election.end_date)
            const secondsLeft = differenceInSeconds(endDate, now)

            if (secondsLeft <= 0) {
                setTimeRemaining("Ended")
                return
            }

            const days = differenceInDays(endDate, now)
            const hours = differenceInHours(endDate, now) % 24
            const minutes = differenceInMinutes(endDate, now) % 60
            const seconds = secondsLeft % 60

            if (days > 0) {
                setTimeRemaining(`${days}d ${hours}h ${minutes}m`)
            } else if (hours > 0) {
                setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`)
            } else if (minutes > 0) {
                setTimeRemaining(`${minutes}m ${seconds}s`)
            } else {
                setTimeRemaining(`${seconds}s`)
            }
        }

        updateCountdown()
        const interval = setInterval(updateCountdown, 1000)

        return () => clearInterval(interval)
    }, [election])

    // Chart colors
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#8DD1E1']
    const GOLD = '#FFD700'

    if (isLoading || !election || !stats) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin-dashboard/elections">
                    <Button variant="ghost" size="sm" type="button" className="cursor-pointer">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </Link>
                <div className="flex-1">
                    <h2 className="text-3xl font-bold tracking-tight">{election.title}</h2>
                    <p className="text-muted-foreground">Live election analytics and monitoring</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchStats(true)}
                        disabled={isRefreshing}
                        type="button"
                        className="cursor-pointer"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Link href={`/admin-dashboard/elections/${electionId}/config`}>
                        <Button variant="outline" size="sm" type="button" className="cursor-pointer">
                            <Settings className="h-4 w-4 mr-2" />
                            Configure
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Top Metrics Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                {/* Voter Turnout */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Voter Turnout</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-primary">
                            {stats.turnout_percentage.toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            {stats.total_voters} of {stats.total_registered_users} students voted
                        </p>
                        <div className="mt-2">
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all"
                                    style={{ width: `${Math.min(stats.turnout_percentage, 100)}%` }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Ballots Cast */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Ballots</CardTitle>
                        <Vote className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{stats.total_votes_cast}</div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Across {stats.results_by_position.length} positions
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                                {stats.total_voters} unique voters
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Time Remaining */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {election.is_active ? "Time Remaining" : "Status"}
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {election.is_active ? (
                            <>
                                <div className="text-4xl font-bold text-green-600">{timeRemaining}</div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Until {format(new Date(election.end_date), "MMM d, h:mm a")}
                                </p>
                                <Badge className="mt-2 bg-green-600">Active - Voting Open</Badge>
                            </>
                        ) : (
                            <>
                                <div className="text-4xl font-bold text-muted-foreground">Ended</div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Closed on {format(new Date(election.end_date), "MMM d, yyyy")}
                                </p>
                                <Badge variant="secondary" className="mt-2">
                                    {election.is_published ? "Results Published" : "Results Hidden"}
                                </Badge>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Results Section */}
            <Tabs defaultValue="bar" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="bar" type="button" className="cursor-pointer">Bar Charts</TabsTrigger>
                    <TabsTrigger value="pie" type="button" className="cursor-pointer">Pie Charts</TabsTrigger>
                </TabsList>

                {/* Bar Charts Tab */}
                <TabsContent value="bar" className="space-y-4">
                    {stats.results_by_position.length === 0 ? (
                        <Card>
                            <CardContent className="flex h-[300px] items-center justify-center">
                                <div className="text-center">
                                    <Vote className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                                    <p className="text-muted-foreground">No positions configured yet</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        stats.results_by_position.map((position) => {
                            const chartData = position.candidates.map(c => ({
                                name: c.candidate_name.split(' ').slice(-1)[0] || c.candidate_username, // Last name
                                votes: c.vote_count,
                                fullName: c.candidate_name,
                            }))

                            const maxVotes = Math.max(...chartData.map(d => d.votes), 0)
                            const hasVotes = position.total_votes > 0

                            return (
                                <Card key={position.position_id}>
                                    <CardHeader>
                                        <CardTitle>{position.position_name}</CardTitle>
                                        <CardDescription>
                                            {position.total_votes} {position.total_votes === 1 ? 'vote' : 'votes'} cast
                                            {position.candidates.length > 0 && ` • ${position.candidates.length} candidates`}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {position.candidates.length === 0 ? (
                                            <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                                                No candidates for this position
                                            </div>
                                        ) : !hasVotes ? (
                                            <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                                                No votes yet
                                            </div>
                                        ) : (
                                            <ResponsiveContainer width="100%" height={300}>
                                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="name" />
                                                    <YAxis allowDecimals={false} />
                                                    <Tooltip
                                                        content={({ active, payload }) => {
                                                            if (active && payload && payload.length) {
                                                                return (
                                                                    <div className="bg-background border rounded-lg p-3 shadow-lg">
                                                                        <p className="font-semibold">{payload[0].payload.fullName}</p>
                                                                        <p className="text-sm text-muted-foreground">
                                                                            Votes: <span className="font-bold text-foreground">{payload[0].value}</span>
                                                                        </p>
                                                                    </div>
                                                                )
                                                            }
                                                            return null
                                                        }}
                                                    />
                                                    <Legend />
                                                    <Bar dataKey="votes" name="Vote Count" radius={[8, 8, 0, 0]}>
                                                        {chartData.map((entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={entry.votes === maxVotes && maxVotes > 0 ? GOLD : COLORS[index % COLORS.length]}
                                                            />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                    </CardContent>
                                </Card>
                            )
                        })
                    )}
                </TabsContent>

                {/* Pie Charts Tab */}
                <TabsContent value="pie" className="space-y-4">
                    {stats.results_by_position.length === 0 ? (
                        <Card>
                            <CardContent className="flex h-[300px] items-center justify-center">
                                <div className="text-center">
                                    <Vote className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                                    <p className="text-muted-foreground">No positions configured yet</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {stats.results_by_position.map((position) => {
                                const pieData = position.candidates.map((c, index) => ({
                                    name: c.candidate_name,
                                    value: c.vote_count,
                                    color: COLORS[index % COLORS.length],
                                }))

                                const hasVotes = position.total_votes > 0

                                return (
                                    <Card key={position.position_id}>
                                        <CardHeader>
                                            <CardTitle>{position.position_name}</CardTitle>
                                            <CardDescription>
                                                Vote distribution
                                                {position.total_votes > 0 && ` • ${position.total_votes} total votes`}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {position.candidates.length === 0 ? (
                                                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                                                    No candidates
                                                </div>
                                            ) : !hasVotes ? (
                                                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                                                    No votes yet
                                                </div>
                                            ) : (
                                                <ResponsiveContainer width="100%" height={300}>
                                                    <PieChart>
                                                        <Pie
                                                            data={pieData}
                                                            cx="50%"
                                                            cy="50%"
                                                            labelLine={false}
                                                            label={({ name, percent }) => (name && percent !== undefined) ? `${name.split(' ').slice(-1)[0]} ${(percent * 100).toFixed(0)}%` : ''}
                                                            outerRadius={80}
                                                            fill="#8884d8"
                                                            dataKey="value"
                                                        >
                                                            {pieData.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip
                                                            content={({ active, payload }) => {
                                                                if (active && payload && payload.length) {
                                                                    const data = payload[0].payload
                                                                    const percentage = ((data.value / position.total_votes) * 100).toFixed(1)
                                                                    return (
                                                                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                                                                            <p className="font-semibold">{data.name}</p>
                                                                            <p className="text-sm text-muted-foreground">
                                                                                {data.value} votes ({percentage}%)
                                                                            </p>
                                                                        </div>
                                                                    )
                                                                }
                                                                return null
                                                            }}
                                                        />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            )}

                                            {/* Legend */}
                                            {hasVotes && position.candidates.length > 0 && (
                                                <div className="mt-4 space-y-2">
                                                    {position.candidates.map((candidate, index) => {
                                                        const percentage = position.total_votes > 0
                                                            ? ((candidate.vote_count / position.total_votes) * 100).toFixed(1)
                                                            : 0
                                                        return (
                                                            <div key={candidate.candidate_id} className="flex items-center gap-2 text-sm">
                                                                <div
                                                                    className="w-3 h-3 rounded-full"
                                                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                                                />
                                                                <span className="flex-1">{candidate.candidate_name}</span>
                                                                <span className="font-medium">
                                                                    {candidate.vote_count} ({percentage}%)
                                                                </span>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Auto-refresh indicator */}
            {election.is_active && (
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span>Auto-refreshing every 15 seconds</span>
                </div>
            )}
        </div>
    )
}
