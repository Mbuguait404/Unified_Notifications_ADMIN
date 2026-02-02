'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Download,
  Zap,
} from 'lucide-react'

const deliveryData = [
  { time: '00:00', delivered: 1200, bounced: 150, failed: 80 },
  { time: '03:00', delivered: 900, bounced: 120, failed: 45 },
  { time: '06:00', delivered: 1400, bounced: 200, failed: 100 },
  { time: '09:00', delivered: 1100, bounced: 160, failed: 70 },
  { time: '12:00', delivered: 1600, bounced: 280, failed: 150 },
  { time: '15:00', delivered: 1200, bounced: 140, failed: 90 },
  { time: '18:00', delivered: 1300, bounced: 200, failed: 110 },
  { time: '21:00', delivered: 1050, bounced: 180, failed: 85 },
  { time: '23:59', delivered: 980, bounced: 120, failed: 60 },
]

const deliveryEvents = [
  {
    timestamp: '2023-11-24 14:22:31',
    organization: 'Acme Corp',
    channel: '📧',
    recipient: 'jo***@gmail.com',
    provider: 'SENDGRID',
    status: 'DELIVERED',
  },
  {
    timestamp: '2023-11-24 14:21:05',
    organization: 'Stripe Inc',
    channel: '📱',
    recipient: '+1•••••• 4421',
    provider: 'TWILIO',
    status: 'BOUNCED',
  },
  {
    timestamp: '2023-11-24 14:19:44',
    organization: 'Zapier',
    channel: '🔔',
    recipient: 'user_7721_id',
    provider: 'AWS SNS',
    status: 'FAILED',
  },
  {
    timestamp: '2023-11-24 14:18:12',
    organization: 'Acme Corp',
    channel: '📧',
    recipient: 'mi***@acme.com',
    provider: 'POSTMARK',
    status: 'QUEUED',
  },
  {
    timestamp: '2023-11-24 14:15:59',
    organization: 'Github',
    channel: '📧',
    recipient: 'de***@github.com',
    provider: 'SENDGRID',
    status: 'DELIVERED',
  },
]

const statusConfig: Record<string, { icon: any; color: string; bgColor: string }> = {
  DELIVERED: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  BOUNCED: {
    icon: AlertCircle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  FAILED: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  QUEUED: {
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
}

export default function AnalyticsPage() {
  return (
    <AppLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Notification Analytics & Logs</h1>
            <p className="text-muted-foreground">Real-time monitoring of production throughput and delivery health</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <Download className="w-4 h-4" />
              Export Logs
            </Button>
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <Zap className="w-4 h-4" />
              Live Mode
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 border border-border">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-green-100">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">Delivered</p>
                <h3 className="text-3xl font-bold text-foreground mt-1">1,240,582</h3>
                <p className="text-sm text-green-600 font-semibold mt-2">+12.4%</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-amber-100">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">Bounced</p>
                <h3 className="text-3xl font-bold text-foreground mt-1">12,402</h3>
                <p className="text-sm text-amber-600 font-semibold mt-2">+2.1%</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-red-100">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">Failed</p>
                <h3 className="text-3xl font-bold text-foreground mt-1">3,105</h3>
                <p className="text-sm text-red-600 font-semibold mt-2">-5.8%</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">Queued</p>
                <h3 className="text-3xl font-bold text-foreground mt-1">842</h3>
                <p className="text-sm text-blue-600 font-semibold mt-2">Stable Flow</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Chart */}
        <Card className="p-6 border border-border mb-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-1">Delivery Throughput</h2>
            <p className="text-sm text-muted-foreground">Hourly distribution of message status</p>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={deliveryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="time" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: `1px solid var(--color-border)`,
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="delivered" stackId="a" fill="var(--color-chart-1)" name="Delivered" />
              <Bar dataKey="bounced" stackId="a" fill="var(--color-chart-4)" name="Bounced" />
              <Bar dataKey="failed" stackId="a" fill="var(--color-destructive)" name="Failed" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Delivery Events Table */}
        <Card className="border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Delivery Events</h2>
            <p className="text-sm text-muted-foreground mt-1">Showing 1-15 of 24,502 events</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-3 px-6 text-sm font-semibold text-muted-foreground">Timestamp</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-muted-foreground">Organization</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-muted-foreground">Channel</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-muted-foreground">Recipient</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-muted-foreground">Provider</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {deliveryEvents.map((event, idx) => {
                  const config = statusConfig[event.status]
                  const StatusIcon = config.icon
                  return (
                    <tr key={idx} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-6 text-sm text-muted-foreground font-mono">{event.timestamp}</td>
                      <td className="py-4 px-6 text-sm font-medium text-foreground">{event.organization}</td>
                      <td className="py-4 px-6 text-center text-lg">{event.channel}</td>
                      <td className="py-4 px-6 text-sm text-foreground font-mono">{event.recipient}</td>
                      <td className="py-4 px-6 text-sm text-muted-foreground">{event.provider}</td>
                      <td className="py-4 px-6">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold ${config.color} ${config.bgColor}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {event.status}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Button variant="ghost" size="sm" className="text-primary text-xs">
                          {event.status === 'DELIVERED' ? 'View Data' : 'Debug'}
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 p-4 border-t border-border bg-muted/50">
            <Button variant="outline" size="sm">Previous</Button>
            <Button variant="default" size="sm" className="bg-primary">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <span className="text-muted-foreground">...</span>
            <Button variant="outline" size="sm">48</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}
