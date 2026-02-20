'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CreditCard,
  TrendingUp,
  Smartphone,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { PaymentsTab } from '@/components/billing/payments-tab'
import { UsageTab } from '@/components/billing/usage-tab'
import { PaymentMethodsTab } from '@/components/billing/payment-methods-tab'
import { transactionsService } from '@/services/transactions.service'
import { paymentMethodsService } from '@/services/payment-methods.service'

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState('payments')
  const [stats, setStats] = useState([
    {
      title: 'Total Revenue',
      value: 'KES 0',
      change: '0%',
      trend: 'neutral' as const,
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'This Month',
      value: 'KES 0',
      change: '0%',
      trend: 'neutral' as const,
      icon: TrendingUp,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total Transactions',
      value: '0',
      change: '0%',
      trend: 'neutral' as const,
      icon: CreditCard,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Active Payment Methods',
      value: '0',
      change: '0',
      trend: 'neutral' as const,
      icon: Smartphone,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [transactions, paymentMethods] = await Promise.all([
          transactionsService.getAllTransactions(),
          paymentMethodsService.getAllPaymentMethods(),
        ])

        // Calculate total revenue
        const totalRevenue = transactions
          .filter(t => t.status === 'completed')
          .reduce((sum, t) => sum + (t.amount || 0), 0)

        // Calculate this month's revenue
        const now = new Date()
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

        const thisMonthTransactions = transactions.filter(t => t.status === 'completed' && new Date(t.createdAt) >= firstDayOfMonth)
        const thisMonthRevenue = thisMonthTransactions.reduce((sum, t) => sum + (t.amount || 0), 0)

        const lastMonthTransactions = transactions.filter(t => t.status === 'completed' && new Date(t.createdAt) >= firstDayOfLastMonth && new Date(t.createdAt) < firstDayOfMonth)
        const lastMonthRevenue = lastMonthTransactions.reduce((sum, t) => sum + (t.amount || 0), 0)

        const revenueChange = lastMonthRevenue > 0
          ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
          : 0

        // Calculate transaction count change
        const totalTransactionsCount = transactions.length
        const lastMonthCount = transactions.filter(t => new Date(t.createdAt) >= firstDayOfLastMonth && new Date(t.createdAt) < firstDayOfMonth).length
        const thisMonthCount = transactions.filter(t => new Date(t.createdAt) >= firstDayOfMonth).length
        const transactionChange = lastMonthCount > 0
          ? ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100
          : 0

        const activeMethods = paymentMethods.filter(m => m.isActive).length

        setStats([
          {
            title: 'Total Revenue',
            value: `KES ${totalRevenue.toLocaleString()}`,
            change: `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}%`,
            trend: (revenueChange > 0 ? 'up' : revenueChange < 0 ? 'down' : 'neutral') as any,
            icon: DollarSign,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
          },
          {
            title: 'This Month',
            value: `KES ${thisMonthRevenue.toLocaleString()}`,
            change: `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}%`,
            trend: (revenueChange > 0 ? 'up' : revenueChange < 0 ? 'down' : 'neutral') as any,
            icon: TrendingUp,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
          },
          {
            title: 'Total Transactions',
            value: totalTransactionsCount.toLocaleString(),
            change: `${transactionChange >= 0 ? '+' : ''}${transactionChange.toFixed(1)}%`,
            trend: (transactionChange > 0 ? 'up' : transactionChange < 0 ? 'down' : 'neutral') as any,
            icon: CreditCard,
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10',
          },
          {
            title: 'Active Payment Methods',
            value: activeMethods.toString(),
            change: '0',
            trend: 'neutral' as const,
            icon: Smartphone,
            color: 'text-orange-500',
            bgColor: 'bg-orange-500/10',
          },
        ])
      } catch (error) {
        console.error('Error fetching billing stats:', error)
      }
    }

    fetchStats()
  }, [])

  return (
    <AppLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Billing & Payments</h1>
          <p className="text-muted-foreground">
            Manage payments, track usage, and configure payment methods
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground font-medium">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      {stat.change !== '0' && stat.change !== '0.0%' && (
                        <div className="flex items-center gap-1">
                          {stat.trend === 'up' ? (
                            <ArrowUpRight className="w-4 h-4 text-green-500" />
                          ) : stat.trend === 'down' ? (
                            <ArrowDownRight className="w-4 h-4 text-red-500" />
                          ) : null}
                          <span
                            className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-500' : stat.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
                              }`}
                          >
                            {stat.change}
                          </span>
                          <span className="text-xs text-muted-foreground">vs last month</span>
                        </div>
                      )}
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="methods">Payment Methods</TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="space-y-4">
            <PaymentsTab />
          </TabsContent>

          <TabsContent value="usage" className="space-y-4">
            <UsageTab />
          </TabsContent>

          <TabsContent value="methods" className="space-y-4">
            <PaymentMethodsTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
