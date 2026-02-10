'use client'

import { useState } from 'react'
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

// Mock stats data
const stats = [
  {
    title: 'Total Revenue',
    value: 'KES 1,245,890',
    change: '+12.5%',
    trend: 'up' as const,
    icon: DollarSign,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    title: 'This Month',
    value: 'KES 245,670',
    change: '+8.2%',
    trend: 'up' as const,
    icon: TrendingUp,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    title: 'Total Transactions',
    value: '1,847',
    change: '+23.1%',
    trend: 'up' as const,
    icon: CreditCard,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    title: 'Active Payment Methods',
    value: '3',
    change: '0',
    trend: 'neutral' as const,
    icon: Smartphone,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
]

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState('payments')

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
                      {stat.change !== '0' && (
                        <div className="flex items-center gap-1">
                          {stat.trend === 'up' ? (
                            <ArrowUpRight className="w-4 h-4 text-green-500" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-red-500" />
                          )}
                          <span
                            className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
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
