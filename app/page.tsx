'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { MetricCard } from '@/components/dashboard/metric-card'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import {
  Building2,
  Users,
  Mail,
  DollarSign,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react'
import { dashboardService } from '@/services/dashboard.service'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [globalStats, setGlobalStats] = useState<any>(null)
  const [usageStats, setUsageStats] = useState<any>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const colors = ['bg-purple-500', 'bg-blue-500', 'bg-pink-500', 'bg-green-500', 'bg-orange-500']

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [stats, logs, usage] = await Promise.all([
          dashboardService.getGlobalStats(),
          dashboardService.getMessageLogsChartData(),
          dashboardService.getUsageStats(),
        ])

        setGlobalStats(stats)
        setUsageStats(usage)
        setChartData(logs && logs.length > 0 ? logs : getDefaultChartData())
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
        setError('Failed to load dashboard data. Please try again.')
        // Set default data on error to show something
        setGlobalStats(getDefaultStats())
        setUsageStats(getDefaultUsageStats())
        setChartData(getDefaultChartData())
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (!globalStats) {
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </AppLayout>
    )
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
    return num.toString()
  }

  const formatCurrency = (num: number) => {
    return '$' + num.toLocaleString('en-US', { maximumFractionDigits: 2 })
  }

  const healthData = [
    {
      metric: 'API Gateway',
      status: globalStats?.systemHealth?.apiGateway?.status || 'Healthy',
      value: `${globalStats?.systemHealth?.apiGateway?.latency || 24}ms avg`,
      color: 'bg-green-500',
    },
    {
      metric: 'Message Queue',
      status: globalStats?.systemHealth?.messageQueue?.status || 'Healthy',
      value: `${globalStats?.systemHealth?.messageQueue?.load || '12k/s'} load`,
      color: 'bg-green-500',
    },
    {
      metric: 'Primary DB',
      status: globalStats?.systemHealth?.primaryDb?.status || 'Healthy',
      value: `${globalStats?.systemHealth?.primaryDb?.uptime || 99.99}% uptime`,
      color: 'bg-green-500',
    },
  ]

  const recentOrganizations = globalStats?.recentOrganizations?.map((org: any, idx: number) => ({
    id: org._id,
    name: org.name,
    plan: org.plan,
    signupDate: new Date(org.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    status: org.status || 'Active',
    color: colors[idx % colors.length],
  })) || []

  return (
    <AppLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-1">Overview</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your platform today.</p>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Total Organizations"
            value={globalStats?.totalOrganizations?.toLocaleString() || '0'}
            icon={<Building2 className="w-6 h-6" />}
            trend={{ value: 12, direction: 'up', label: 'this month' }}
          />
          <MetricCard
            title="Total Notifications (30d)"
            value={formatNumber(globalStats?.totalNotifications || 0)}
            icon={<Mail className="w-6 h-6" />}
            trend={{ value: 5.2, direction: 'up', label: 'vs last month' }}
          />
          <MetricCard
            title="Success Rate"
            value={`${globalStats?.successRate || 0}%`}
            icon={<TrendingUp className="w-6 h-6" />}
            trend={{ value: 0.02, direction: 'up', label: 'this week' }}
          />
          <MetricCard
            title="MRR"
            value={formatCurrency(globalStats?.mrr || 0)}
            icon={<DollarSign className="w-6 h-6" />}
            trend={{ value: 8, direction: 'up', label: 'vs last month' }}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 p-6 border border-border">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-foreground mb-1">Notification Volume by Channel</h2>
              <p className="text-sm text-muted-foreground">Traffic distribution over the last 30 days</p>

              {/* Usage Stats Lines */}
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
                <div className="text-center">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Email</p>
                  <p className="text-2xl font-bold text-foreground">{usageStats?.emailCount || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-muted-foreground mb-1">SMS</p>
                  <p className="text-2xl font-bold text-foreground">{usageStats?.smsCount || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-muted-foreground mb-1">WhatsApp</p>
                  <p className="text-2xl font-bold text-foreground">{usageStats?.whatsappCount || 0}</p>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="date"
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: `1px solid var(--color-border)`,
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="email"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                  name="Email"
                />
                <Line
                  type="monotone"
                  dataKey="sms"
                  stroke="var(--color-chart-2)"
                  strokeWidth={2}
                  name="SMS"
                />
                <Line
                  type="monotone"
                  dataKey="push"
                  stroke="var(--color-chart-3)"
                  strokeWidth={2}
                  name="WhatsApp"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">System Health</h2>
            <div className="space-y-3">
              {healthData.map((item) => (
                <div key={item.metric} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${item.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{item.metric}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.value}</p>
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t border-border mt-3">
                <p className="text-xs font-semibold text-foreground">GLOBAL UPTIME</p>
                <p className="text-lg font-bold text-green-600 mt-1">99.998%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Organizations */}
        <Card className="p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Recent New Organizations</h2>
            </div>
            <Button variant="ghost" className="text-primary">
              View All <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Organization</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Plan</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Signup Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrganizations.map((org) => (
                  <tr key={org._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${org.color} flex items-center justify-center text-white text-xs font-semibold`}>
                          {org.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-foreground">{org.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary">{org.plan}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{org.signupDate}</td>
                    <td className="py-3 px-4">
                      <Badge className="bg-green-100 text-green-700">{org.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}

// Default data fallbacks
function getDefaultStats() {
  return {
    totalOrganizations: 0,
    totalNotifications: 0,
    totalSms: 0,
    totalEmail: 0,
    totalWhatsapp: 0,
    successRate: 0,
    mrr: 0,
    recentOrganizations: [],
    systemHealth: {
      apiGateway: { status: 'Checking', latency: 0 },
      messageQueue: { status: 'Checking', load: '0' },
      primaryDb: { status: 'Checking', uptime: 0 },
    },
  }
}

function getDefaultUsageStats() {
  return {
    _id: null,
    smsCount: 0,
    emailCount: 0,
    whatsappCount: 0,
  }
}

function getDefaultChartData() {
  return [
    { date: 'Day 1', email: 0, sms: 0, push: 0 },
    { date: 'Day 5', email: 0, sms: 0, push: 0 },
    { date: 'Day 10', email: 0, sms: 0, push: 0 },
    { date: 'Day 15', email: 0, sms: 0, push: 0 },
    { date: 'Day 20', email: 0, sms: 0, push: 0 },
    { date: 'Day 25', email: 0, sms: 0, push: 0 },
    { date: 'Day 30', email: 0, sms: 0, push: 0 },
  ]
}
