'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
    Play,
    Server,
    Terminal,
    Activity,
    ChevronRight,
    ChevronDown
} from 'lucide-react'
import { logsService, MessageLog, SystemLog } from '@/services/logs.service'
import { io, Socket } from 'socket.io-client'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3040'

export default function LogsPage() {
    const [activeTab, setActiveTab] = useState('communication')
    const [msgLogs, setMsgLogs] = useState<MessageLog[]>([])
    const [sysLogs, setSysLogs] = useState<SystemLog[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isLive, setIsLive] = useState(true)
    const [isPaused, setIsPaused] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [duration, setDuration] = useState('1h')
    const [filterChannel, setFilterChannel] = useState('all')
    const [expandedSysLogs, setExpandedSysLogs] = useState<Record<string, boolean>>({})

    const socketRef = useRef<Socket | null>(null)

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

            if (activeTab === 'communication') {
                if (filterChannel !== 'all') filters.channel = filterChannel
                const data = await logsService.getAllLogs(filters)
                setMsgLogs(data)
            } else {
                const data = await logsService.getSystemLogs(filters)
                setSysLogs(data)
            }
        } catch (error) {
            console.error('Failed to fetch logs:', error)
        } finally {
            setIsLoading(false)
        }
    }, [duration, filterChannel, activeTab])

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
                    setMsgLogs(prevLogs => [newLog, ...prevLogs].slice(0, 200))
                }
            })

            socket.on('new_system_log', (newLog: SystemLog) => {
                if (!isPaused) {
                    setSysLogs(prevLogs => [newLog, ...prevLogs].slice(0, 200))
                }
            })

            socketRef.current = socket

            return () => {
                socket.disconnect()
            }
        }
    }, [isLive, isPaused])

    const filteredMsgLogs = msgLogs.filter(log => {
        const matchesSearch =
            log.messagePreview.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.senderOrgId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.senderUserId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.recipients.some(r => r.recipient.includes(searchQuery))
        return matchesSearch
    })

    const filteredSysLogs = sysLogs.filter(log => {
        const matchesSearch =
            log.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.method.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.ip.includes(searchQuery) ||
            (log.userId?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (log.orgId?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
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

    const getHttpStatusCodeColor = (code: number) => {
        if (code >= 200 && code < 300) return "text-green-500 bg-green-500/10"
        if (code >= 300 && code < 400) return "text-blue-500 bg-blue-500/10"
        if (code >= 400 && code < 500) return "text-amber-500 bg-amber-500/10"
        return "text-red-500 bg-red-500/10"
    }

    const toggleExpand = (id: string) => {
        setExpandedSysLogs(prev => ({ ...prev, [id]: !prev[id] }))
    }

    return (
        <AppLayout>
            <div className="flex flex-col h-full bg-background/50">
                {/* Header */}
                <div className="p-6 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-bold text-foreground">Central Logs</h1>
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
                            <p className="text-sm text-muted-foreground">Unified monitoring for communications and backend API requests.</p>
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
                                    setMsgLogs([])
                                    setSysLogs([])
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

                    <div className="mt-6 flex flex-col lg:flex-row gap-4 items-center">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full lg:w-auto">
                            <TabsList className="grid grid-cols-2 lg:w-[400px]">
                                <TabsTrigger value="communication" className="flex items-center gap-2">
                                    <Activity className="w-4 h-4" />
                                    Communication
                                </TabsTrigger>
                                <TabsTrigger value="backend" className="flex items-center gap-2">
                                    <Terminal className="w-4 h-4" />
                                    Backend API
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder={`Search ${activeTab === 'communication' ? 'messages, recipients...' : 'endpoints, methods, IPs...'}`}
                                className="pl-10 h-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto">
                            <div className="flex bg-muted p-1 rounded-lg">
                                {['1h', '24h', '7d', 'all'].map((d) => (
                                    <button
                                        key={d}
                                        onClick={() => {
                                            setDuration(d)
                                            setIsLive(d === '1h')
                                        }}
                                        className={cn(
                                            "px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap",
                                            duration === d ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        {d.toUpperCase()}
                                    </button>
                                ))}
                            </div>

                            {activeTab === 'communication' && (
                                <select
                                    className="h-10 px-3 py-1 text-sm bg-muted border-none rounded-lg outline-none focus:ring-1 focus:ring-primary min-w-[120px]"
                                    value={filterChannel}
                                    onChange={(e) => setFilterChannel(e.target.value)}
                                >
                                    <option value="all">Channels</option>
                                    <option value="sms">SMS</option>
                                    <option value="email">Email</option>
                                    <option value="whatsapp">WhatsApp</option>
                                </select>
                            )}

                            <Button variant="ghost" size="icon" onClick={fetchLogs} className="flex-shrink-0">
                                <RefreshCcw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Log List */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="space-y-4 max-w-7xl mx-auto">
                        {isLoading && (activeTab === 'communication' ? msgLogs.length === 0 : sysLogs.length === 0) ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <RefreshCcw className="w-8 h-8 text-primary animate-spin mb-4" />
                                <p className="text-muted-foreground">Loading {activeTab} logs...</p>
                            </div>
                        ) : (activeTab === 'communication' ? filteredMsgLogs.length === 0 : filteredSysLogs.length === 0) ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-background rounded-xl border border-dashed border-border">
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                                    <Search className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold">No {activeTab} logs found</h3>
                                <p className="text-sm text-muted-foreground">Try adjusting your filters or search query.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {activeTab === 'communication' ? (
                                    /* Communication Logs */
                                    filteredMsgLogs.map((log) => (
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
                                    ))
                                ) : (
                                    /* Backend System Logs */
                                    filteredSysLogs.map((log) => (
                                        <Card key={log._id} className="group overflow-hidden border-border/50 hover:border-primary/50 transition-all">
                                            <div className="flex flex-col">
                                                <div
                                                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                                                    onClick={() => toggleExpand(log._id)}
                                                >
                                                    <div className={cn(
                                                        "px-2 py-1 rounded text-[10px] font-bold uppercase",
                                                        log.method === 'GET' ? "bg-blue-500/10 text-blue-600" :
                                                            log.method === 'POST' ? "bg-green-500/10 text-green-600" :
                                                                log.method === 'PATCH' || log.method === 'PUT' ? "bg-amber-500/10 text-amber-600" :
                                                                    "bg-red-500/10 text-red-600"
                                                    )}>
                                                        {log.method}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-mono truncate text-foreground/90">{log.url}</p>
                                                    </div>

                                                    <div className={cn(
                                                        "px-2 py-1 rounded text-xs font-semibold",
                                                        getHttpStatusCodeColor(log.statusCode)
                                                    )}>
                                                        {log.statusCode}
                                                    </div>

                                                    <div className="text-xs text-muted-foreground font-mono hidden md:block">
                                                        {log.duration}ms
                                                    </div>

                                                    <div className="text-xs text-muted-foreground hidden lg:block">
                                                        {format(new Date(log.createdAt), 'HH:mm:ss.SSS')}
                                                    </div>

                                                    {expandedSysLogs[log._id] ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                                                </div>

                                                {expandedSysLogs[log._id] && (
                                                    <div className="p-4 bg-muted/50 border-t border-border/50 space-y-4 animate-in slide-in-from-top-2 duration-200">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                                                            <div className="space-y-1">
                                                                <p className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">Organization</p>
                                                                <p className="font-semibold">{log.orgId?.name || 'Public'}</p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">User</p>
                                                                <p className="font-semibold">{log.userId?.name || 'Guest'}</p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">IP Address</p>
                                                                <p className="font-mono">{log.ip}</p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">User Agent</p>
                                                                <p className="truncate" title={log.userAgent}>{log.userAgent}</p>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Request Body</p>
                                                                <pre className="p-3 rounded bg-zinc-950 text-zinc-300 text-[11px] overflow-auto max-h-[200px] font-mono whitespace-pre-wrap">
                                                                    {JSON.stringify(log.body, null, 2)}
                                                                </pre>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Query Parameters</p>
                                                                <pre className="p-3 rounded bg-zinc-950 text-zinc-300 text-[11px] overflow-auto max-h-[200px] font-mono whitespace-pre-wrap">
                                                                    {JSON.stringify(log.query, null, 2)}
                                                                </pre>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    ))
                                )}
                            </div>
                        )}

                        {!isLoading && (activeTab === 'communication' ? filteredMsgLogs.length > 0 : filteredSysLogs.length > 0) && (
                            <p className="text-center text-xs text-muted-foreground py-4">
                                Showing {activeTab === 'communication' ? filteredMsgLogs.length : filteredSysLogs.length} logs.
                                {isLive ? ' Stay tuned for more updates.' : ' Change duration for more history.'}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
