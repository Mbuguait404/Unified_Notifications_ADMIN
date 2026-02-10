'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Search, MessageSquare, Mail, Phone, Loader2 } from 'lucide-react'
import { usageService, UsageStats, GlobalStats } from '@/services/usage.service'
import { toast } from 'sonner'


export function UsageTab() {
    const [usageData, setUsageData] = useState<UsageStats[]>([])
    const [globalStats, setGlobalStats] = useState<GlobalStats>({ smsCount: 0, emailCount: 0, whatsappCount: 0 })
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState('usage')

    const fetchData = async () => {
        try {
            setLoading(true)
            const [usage, global] = await Promise.all([
                usageService.getAllUsage(),
                usageService.getGlobalStats()
            ])
            setUsageData(usage)
            setGlobalStats(global)
        } catch (error) {
            console.error('Failed to fetch usage data:', error)
            toast.error('Failed to load usage statistics')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const filteredData = usageData
        .filter((org) =>
            org.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            org.organizationId.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            const totalA = a.remainingCredits + a.usedTokens
            const totalB = b.remainingCredits + b.usedTokens

            if (sortBy === 'usage') {
                return b.usedTokens - a.usedTokens
            } else if (sortBy === 'remaining') {
                return b.remainingCredits - a.remainingCredits
            } else if (sortBy === 'name') {
                return a.organizationName.localeCompare(b.organizationName)
            }
            return 0
        })

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Never'
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const calculateUsagePercentage = (used: number, remaining: number) => {
        const total = used + remaining
        if (total === 0) return 0
        return Math.round((used / total) * 100)
    }

    const getUsageColor = (percentage: number) => {
        if (percentage >= 90) return 'text-red-500' // High usage (almost depleted?) Wait, used/total. 90% used means little remaining.
        // If 'used' is what we track, high usage is actually good (activity).
        // But usually 'usage' bars warn when 'remaining' is low.
        // If the bar represents 'Quota Used', then 100% is bad (no quota left).
        // Here we have 'usedTokens' and 'remainingCredits'.
        // A high percentage means they have used most of their tokens.
        if (percentage >= 90) return 'text-red-500'
        if (percentage >= 70) return 'text-yellow-500'
        return 'text-green-500'
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-500/10 rounded-lg">
                                <MessageSquare className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total SMS Sent</p>
                                <p className="text-2xl font-bold">{globalStats.smsCount.toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-orange-500/10 rounded-lg">
                                <Mail className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Emails Sent</p>
                                <p className="text-2xl font-bold">{globalStats.emailCount.toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-500/10 rounded-lg">
                                <Phone className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total WhatsApp Sent</p>
                                <p className="text-2xl font-bold">{globalStats.whatsappCount.toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Usage Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                    <div>
                        <CardTitle className="text-xl font-bold">Organization Usage</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Track token usage and messaging activity by organization
                        </p>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search organizations..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="usage">Highest Usage</SelectItem>
                                <SelectItem value="remaining">Most Remaining</SelectItem>
                                <SelectItem value="name">Name (A-Z)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Table */}
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Organization</TableHead>
                                    <TableHead>Token Usage</TableHead>
                                    <TableHead>SMS</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>WhatsApp</TableHead>
                                    <TableHead>Last Activity</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-10">
                                            No organizations found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredData.map((org) => {
                                        const usagePercentage = calculateUsagePercentage(
                                            org.usedTokens,
                                            org.remainingCredits
                                        )
                                        return (
                                            <TableRow key={org.organizationId}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{org.organizationName}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            ID: {org.organizationId}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="w-[200px]">
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-xs">
                                                            <span>{org.usedTokens.toLocaleString()} used</span>
                                                            <span className="text-muted-foreground">
                                                                {org.remainingCredits.toLocaleString()} left
                                                            </span>
                                                        </div>
                                                        <Progress
                                                            value={usagePercentage}
                                                            className="h-2"
                                                        // Indicator className logic if supported, or rely on root color
                                                        // Progress component usually takes `className` for the root
                                                        // indicatorClassName for inner bar
                                                        />
                                                        <div className="flex justify-between text-xs">
                                                            <span className={getUsageColor(usagePercentage)}>
                                                                {usagePercentage}% Used
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{org.smsCount.toLocaleString()}</TableCell>
                                                <TableCell>{org.emailCount.toLocaleString()}</TableCell>
                                                <TableCell>{org.whatsappCount.toLocaleString()}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {formatDate(org.lastActivity)}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
