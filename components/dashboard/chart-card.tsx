import { Card } from '@/components/ui/card'
import { ReactNode } from 'react'

interface ChartCardProps {
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
}

export function ChartCard({ title, description, children, footer }: ChartCardProps) {
  return (
    <Card className="p-6 border border-border">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="w-full">
        {children}
      </div>
      {footer && (
        <div className="mt-6 pt-6 border-t border-border">
          {footer}
        </div>
      )}
    </Card>
  )
}
