import { Card } from '@/components/ui/card'
import { ReactNode } from 'react'

interface StatCardProps {
  icon: ReactNode
  label: string
  value: string | number
  status?: 'success' | 'warning' | 'error' | 'info'
  change?: {
    value: number
    trend: 'up' | 'down'
    label?: string
  }
}

const statusColors = {
  success: 'bg-green-100',
  warning: 'bg-amber-100',
  error: 'bg-red-100',
  info: 'bg-blue-100',
}

const trendColors = {
  up: 'text-green-600',
  down: 'text-red-600',
}

export function StatCard({ icon, label, value, status = 'info', change }: StatCardProps) {
  return (
    <Card className="p-6 border border-border">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${statusColors[status]}`}>
          <div className="text-foreground">
            {icon}
          </div>
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase">{label}</p>
          <h3 className="text-2xl font-bold text-foreground mt-1">{value}</h3>
          {change && (
            <p className={`text-sm font-semibold mt-2 ${trendColors[change.trend]}`}>
              {change.trend === 'up' ? '+' : '-'}{change.value}%
              {change.label && ` ${change.label}`}
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}
