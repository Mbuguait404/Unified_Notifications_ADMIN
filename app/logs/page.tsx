'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
    Search,
    Filter,
    RefreshCcw,
    Wifi,
    WifiOff,
    MessageSquare,
    Mail,
    MessageCircle,
    Clock,
    ExternalLink,
    Download,
    Trash2,
    Pause,
    Play
} from 'lucide-react'
import { logsService, MessageLog } from '@/services/logs.service'
import { io, Socket } from 'socket.io-client'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3040'

export default function LogsPage() {
    const [logs, setLogs] = useState<MessageLog[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isLive, setIsLive] = useState(true)
    const [isPaused, setIsPaused] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [duration, setDuration] = useState('1h')
    const [filterChannel, setFilterChannel] = useState('all')

    const socketRef = useRef<Socket | null>(null)
    const logsRef = useRef<MessageLog[]>([])

    const fetchLogs = useCallback(async () => {
        setIsLoading(true)
        try {
            const filters: any = {}
            const now = new Date()
            if (duration === '1h') {
                filters.dateFrom = new Date(now.getTime() - 60 * 60 * 1000).toISOString()
            } else if (duration === '24h') {
                filters.dateFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
            } else if (duration === '7d') {
                filters.dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
            }

            if (filterChannel !== 'all') {
                filters.channel = filterChannel
            }

            const data = await logsService.getAllLogs(filters)
            setLogs(data)
            logsRef.current = data
        } catch (error) {
            console.error('Failed to fetch logs:', error)
        } finally {
            setIsLoading(false)
        }
    }, [duration, filterChannel])

    useEffect(() => {
        fetchLogs()
    }, [fetchLogs])

    useEffect(() => {
        if (isLive) {
            const token = document.cookie.match(new RegExp('(^| )token=([^;]+)'))?.[2]

            const socket = io(`${API_URL}/logs`, {
                auth: { token },
            })

            socket.on('connect', () => {
                console.log('Connected to logs gateway')
            })

            socket.on('new_log', (newLog: MessageLog) => {
                if (!isPaused) {
                    setLogs(prevLogs => {
                        const updatedLogs = [newLog, ...prevLogs].slice(0, 200) // Keep last 200
                        logsRef.current = updatedLogs
                        return updatedLogs
                    })
                }
            })

            socketRef.current = socket

            return () => {
                socket.disconnect()
            }
        }
    }, [isLive, isPaused])

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.messagePreview.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.senderOrgId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.senderUserId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.recipients.some(r => r.recipient.includes(searchQuery))

        return matchesSearch
    })

    const getChannelIcon = (channel: string) => {
        switch (channel) {
            case 'sms': return <MessageSquare className="w-4 h-4 text-blue-500" />
            case 'email': return <Mail className="w-4 h-4 text-purple-500" />
            case 'whatsapp': return <MessageCircle className="w-4 h-4 text-green-500" />
            default: return <MessageSquare className="w-4 h-4" />
        }
    }

    const getStatusBadge = (recipients: any[]) => {
        const successCount = recipients.filter(r => r.status === 'success').length
        const failedCount = recipients.filter(r => r.status === 'failed').length
        const total = recipients.length

        if (failedCount === total) return <Badge variant="destructive">Failed</Badge>
        if (successCount === total) return <Badge className="bg-green-500 hover:bg-green-600">Success</Badge>
        return <Badge variant="secondary">{successCount}/{total} Success</Badge>
    }

    return (
        <AppLayout>
            <div className="flex flex-col h-full bg-background/50">
                {/* Header */}
                <div className="p-6 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-bold text-foreground">System Logs</h1>
                                <div className="flex items-center gap-2">
                                    {isLive ? (
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                                            <Wifi className="w-3 h-3" />
                                            Live
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                                            <WifiOff className="w-3 h-3" />
                                            Offline
                                        </div>
                                    )}
                                    {isPaused && (
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-wider">
                                            <Pause className="w-3 h-3" />
                                            Paused
                                        </div>
                                    )}
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">Monitor all outgoing communications across organizations in real-time.</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsPaused(!isPaused)}
                                className={cn(isPaused && "bg-amber-500/10 text-amber-600 border-amber-200")}
                            >
                                {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                                {isPaused ? 'Resume' : 'Pause'}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setLogs([])
                                    logsRef.current = []
                                }}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Clear
                            </Button>
                            <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search logs by message, recipient, organization..."
                                className="pl-10 h-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
                            <div className="flex bg-muted p-1 rounded-lg">
                                {['1h', '24h', '7d', 'all'].map((d) => (
                                    <button
                                        key={d}
                                        onClick={() => {
                                            setDuration(d)
                                            setIsLive(d === '1h')
                                        }}
                                        className={cn(
                                            "px-3 py-1 text-xs font-medium rounded-md transition-all",
                                            duration === d ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        {d.toUpperCase()}
                                    </button>
                                ))}
                            </div>

                            <select
                                className="h-10 px-3 py-1 text-sm bg-muted border-none rounded-lg outline-none focus:ring-1 focus:ring-primary"
                                value={filterChannel}
                                onChange={(e) => setFilterChannel(e.target.value)}
                            >
                                <option value="all">All Channels</option>
                                <option value="sms">SMS</option>
                                <option value="email">Email</option>
                                <option value="whatsapp">WhatsApp</option>
                            </select>

                            <Button variant="ghost" size="icon" onClick={fetchLogs}>
                                <RefreshCcw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Log List */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="space-y-4 max-w-7xl mx-auto">
                        {isLoading && logs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <RefreshCcw className="w-8 h-8 text-primary animate-spin mb-4" />
                                <p className="text-muted-foreground">Loading system logs...</p>
                            </div>
                        ) : filteredLogs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-background rounded-xl border border-dashed border-border">
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                                    <Search className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold">No logs found</h3>
                                <p className="text-sm text-muted-foreground">Try adjusting your filters or search query.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredLogs.map((log) => (
                                    <Card key={log._id} className="group overflow-hidden border-border/50 hover:border-primary/50 transition-all hover:shadow-md">
                                        <div className="flex items-stretch">
                                            <div className={cn(
                                                "w-1.5",
                                                log.channel === 'sms' ? "bg-blue-500" :
                                                    log.channel === 'email' ? "bg-purple-500" :
                                                        "bg-green-500"
                                            )} />
                                            <div className="flex-1 p-4">
                                                <div className="flex items-start justify-between gap-4 mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/5 transition-colors">
                                                            {getChannelIcon(log.channel)}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-sm">{log.senderOrgId.name}</span>
                                                                <span className="text-xs text-muted-foreground">•</span>
                                                                <span className="text-xs text-muted-foreground">{log.senderUserId.name}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <Clock className="w-3 h-3 text-muted-foreground" />
                                                                <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-tight">
                                                                    {format(new Date(log.createdAt), 'MMM d, HH:mm:ss')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {getStatusBadge(log.recipients)}
                                                        <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <ExternalLink className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="bg-muted/30 rounded-lg p-3 border border-border/30">
                                                    <p className="text-sm text-foreground/90 line-clamp-2 leading-relaxed">
                                                        {log.messagePreview}
                                                    </p>
                                                </div>

                                                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-4">
                                                        <span>
                                                            <span className="font-medium text-foreground">{log.recipients.length}</span> recipients
                                                        </span>
                                                        <span>
                                                            Network: <span className="font-medium text-foreground uppercase">{log.network}</span>
                                                        </span>
                                                        <span>
                                                            Cost: <span className="font-medium text-foreground">{log.cost.toFixed(2)} tokens</span>
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {log.recipients.slice(0, 3).map((r, i) => (
                                                            <span key={i} className="px-2 py-0.5 rounded bg-muted text-[10px]">
                                                                {r.recipient}
                                                            </span>
                                                        ))}
                                                        {log.recipients.length > 3 && (
                                                            <span className="text-[10px]">+{log.recipients.length - 3} more</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {!isLoading && filteredLogs.length > 0 && (
                            <p className="text-center text-xs text-muted-foreground py-4">
                                Showing {filteredLogs.length} logs. {isLive ? 'Stay tuned for more updates.' : 'Change duration for more history.'}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
