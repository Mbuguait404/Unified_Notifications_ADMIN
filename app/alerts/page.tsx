'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { Card } from '@/components/ui/card'

export default function AlertsPage() {
  return (
    <AppLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Alerts & Monitoring</h1>
        <p className="text-muted-foreground mb-8">Coming soon...</p>
        <Card className="p-12 border border-border text-center">
          <p className="text-muted-foreground">Alerts and monitoring will be available here.</p>
        </Card>
      </div>
    </AppLayout>
  )
}
