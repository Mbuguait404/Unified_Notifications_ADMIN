'use client'

import { useState } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Search, MessageSquare, Mail, Phone, TrendingUp, TrendingDown } from 'lucide-react'

// Mock usage data
const mockUsageData = [
    {
        organizationId: 'org-001',
        organizationName: 'Acme Corporation',
        totalTokens: 50000,
        usedTokens: 32450,
        smsCount: 15230,
        emailCount: 8940,
        whatsappCount: 8280,
        lastActivity: '2024-02-10T10:30:00Z',
        trend: 'up',
        trendValue: '+12.5%',
    },
    {
        organizationId: 'org-002',
        organizationName: 'Tech Solutions Ltd',
        totalTokens: 25000,
        usedTokens: 18750,
        smsCount: 8920,
        emailCount: 5640,
        whatsappCount: 4190,
        lastActivity: '2024-02-10T09:15:00Z',
        trend: 'up',
        trendValue: '+8.3%',
    },
    {
        organizationId: 'org-003',
        organizationName: 'Global Enterprises',
        totalTokens: 100000,
        usedTokens: 45600,
        smsCount: 21340,
        emailCount: 15280,
        whatsappCount: 8980,
        lastActivity: '2024-02-10T08:45:00Z',
        trend: 'down',
        trendValue: '-3.2%',
    },
    {
        organizationId: 'org-004',
        organizationName: 'Innovation Hub',
        totalTokens: 15000,
        usedTokens: 12890,
        smsCount: 6120,
        emailCount: 4230,
        whatsappCount: 2540,
        lastActivity: '2024-02-09T16:20:00Z',
        trend: 'up',
        trendValue: '+15.7%',
    },
    {
        organizationId: 'org-005',
        organizationName: 'Digital Ventures',
        totalTokens: 75000,
        usedTokens: 23450,
        smsCount: 11230,
        emailCount: 7840,
        whatsappCount: 4380,
        lastActivity: '2024-02-09T14:10:00Z',
        trend: 'up',
        trendValue: '+5.1%',
    },
]

export function UsageTab() {
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState('usage')

    const filteredData = mockUsageData
        .filter((org) =>
            org.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            org.organizationId.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === 'usage') {
                return b.usedTokens - a.usedTokens
            } else if (sortBy === 'remaining') {
                return (b.totalTokens - b.usedTokens) - (a.totalTokens - a.usedTokens)
            } else if (sortBy === 'name') {
                return a.organizationName.localeCompare(b.organizationName)
            }
            return 0
        })

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const calculateUsagePercentage = (used: number, total: number) => {
        return Math.round((used / total) * 100)
    }

    const getUsageColor = (percentage: number) => {
        if (percentage >= 90) return 'text-red-500'
        if (percentage >= 70) return 'text-yellow-500'
        return 'text-green-500'
    }

    // Calculate totals
    const totals = mockUsageData.reduce(
        (acc, org) => ({
            totalTokens: acc.totalTokens + org.totalTokens,
            usedTokens: acc.usedTokens + org.usedTokens,
            smsCount: acc.smsCount + org.smsCount,
            emailCount: acc.emailCount + org.emailCount,
            whatsappCount: acc.whatsappCount + org.whatsappCount,
        }),
        { totalTokens: 0, usedTokens: 0, smsCount: 0, emailCount: 0, whatsappCount: 0 }
    )

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
                                <p className="text-2xl font-bold">{totals.smsCount.toLocaleString()}</p>
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
                                <p className="text-2xl font-bold">{totals.emailCount.toLocaleString()}</p>
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
                                <p className="text-2xl font-bold">{totals.whatsappCount.toLocaleString()}</p>
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
                                    <TableHead>Trend</TableHead>
                                    <TableHead>Last Activity</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-10">
                                            No organizations found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredData.map((org) => {
                                        const usagePercentage = calculateUsagePercentage(
                                            org.usedTokens,
                                            org.totalTokens
                                        )
                                        return (
                                            <TableRow key={org.organizationId}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{org.organizationName}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {org.organizationId}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-2 min-w-[200px]">
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="font-medium">
                                                                {org.usedTokens.toLocaleString()} /{' '}
                                                                {org.totalTokens.toLocaleString()}
                                                            </span>
                                                            <span className={getUsageColor(usagePercentage)}>
                                                                {usagePercentage}%
                                                            </span>
                                                        </div>
                                                        <Progress value={usagePercentage} className="h-2" />
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="font-mono">
                                                        {org.smsCount.toLocaleString()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="font-mono">
                                                        {org.emailCount.toLocaleString()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="font-mono">
                                                        {org.whatsappCount.toLocaleString()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        {org.trend === 'up' ? (
                                                            <TrendingUp className="w-4 h-4 text-green-500" />
                                                        ) : (
                                                            <TrendingDown className="w-4 h-4 text-red-500" />
                                                        )}
                                                        <span
                                                            className={`text-sm font-medium ${org.trend === 'up' ? 'text-green-500' : 'text-red-500'
                                                                }`}
                                                        >
                                                            {org.trendValue}
                                                        </span>
                                                    </div>
                                                </TableCell>
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

                    {/* Summary */}
                    <div className="flex items-center justify-between pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                            Showing {filteredData.length} of {mockUsageData.length} organizations
                        </p>
                        <div className="flex gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Total Used: </span>
                                <span className="font-semibold">
                                    {totals.usedTokens.toLocaleString()} tokens
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Total Available: </span>
                                <span className="font-semibold">
                                    {totals.totalTokens.toLocaleString()} tokens
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
