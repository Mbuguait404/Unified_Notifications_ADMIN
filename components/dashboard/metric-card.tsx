import { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  icon: ReactNode
  trend?: {
    value: number
    direction: 'up' | 'down'
    label?: string
  }
  description?: string
}

export function MetricCard({ title, value, icon, trend, description }: MetricCardProps) {
  return (
    <Card className="p-6 border border-border hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-foreground">{value}</h3>
          </div>
          {description && (
            <p className="text-xs text-muted-foreground mt-2">{description}</p>
          )}
          {trend && (
            <div className="mt-4 flex items-center gap-1">
              <span className={`flex items-center gap-0.5 text-sm font-semibold ${
                trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend.direction === 'up' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {trend.direction === 'up' ? '+' : ''}{trend.value}%
              </span>
              {trend.label && (
                <span className="text-xs text-muted-foreground">{trend.label}</span>
              )}
            </div>
          )}
        </div>
        <div className="ml-4 p-3 rounded-lg bg-primary/10">
          <div className="text-primary">
            {icon}
          </div>
        </div>
      </div>
    </Card>
  )
}
