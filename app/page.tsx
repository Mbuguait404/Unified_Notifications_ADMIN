'use client'

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

const chartData = [
  { date: 'Oct 01', email: 400, sms: 240, push: 100 },
  { date: 'Oct 08', email: 600, sms: 390, push: 200 },
  { date: 'Oct 15', email: 800, sms: 490, push: 300 },
  { date: 'Oct 22', email: 1100, sms: 590, push: 450 },
  { date: 'Oct 29', email: 900, sms: 680, push: 350 },
]

const healthData = [
  { metric: 'API Gateway', status: 'Healthy', value: '24ms avg', color: 'bg-green-500' },
  { metric: 'Message Queue', status: 'Healthy', value: '12k/s load', color: 'bg-green-500' },
  { metric: 'Primary DB', status: 'Healthy', value: '99.99% uptime', color: 'bg-green-500' },
]

const recentOrganizations = [
  {
    id: 1,
    name: 'Acme Corp',
    plan: 'Enterprise',
    signupDate: 'Oct 24, 2023',
    status: 'Active',
    color: 'bg-purple-500',
  },
  {
    id: 2,
    name: 'Globex',
    plan: 'Pro',
    signupDate: 'Oct 23, 2023',
    status: 'Active',
    color: 'bg-blue-500',
  },
  {
    id: 3,
    name: 'Soylent Corp',
    plan: 'Starter',
    signupDate: 'Oct 22, 2023',
    status: 'Active',
    color: 'bg-pink-500',
  },
]

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-1">Overview</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your platform today.</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Total Organizations"
            value="1,240"
            icon={<Building2 className="w-6 h-6" />}
            trend={{ value: 12, direction: 'up', label: 'this month' }}
          />
          <MetricCard
            title="Total Notifications (30d)"
            value="8.4M"
            icon={<Mail className="w-6 h-6" />}
            trend={{ value: 5.2, direction: 'up', label: 'vs last month' }}
          />
          <MetricCard
            title="Success Rate"
            value="99.85%"
            icon={<TrendingUp className="w-6 h-6" />}
            trend={{ value: 0.02, direction: 'up', label: 'this week' }}
          />
          <MetricCard
            title="MRR"
            value="$42,500"
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
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis stroke="var(--color-muted-foreground)" />
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
                  name="Push"
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
                  <tr key={org.id} className="border-b border-border hover:bg-muted/50 transition-colors">
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
