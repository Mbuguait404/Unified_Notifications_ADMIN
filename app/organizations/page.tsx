import { AppLayout } from '@/components/layout/app-layout'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowUpRight } from 'lucide-react'
import { cookies } from 'next/headers'

async function getOrganizations() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) return []

  try {
    const res = await fetch('http://localhost:3040/organizations', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store' // Ensure fresh data
    })

    if (!res.ok) {
      if (res.status === 403) {
        console.error('Forbidden: Super Admin access required')
        return []
      }
      console.error('Failed to fetch organizations', await res.text())
      return []
    }

    return res.json()
  } catch (error) {
    console.error('Error fetching organizations:', error)
    return []
  }
}

export default async function OrganizationsPage() {
  const organizations = await getOrganizations()

  return (
    <AppLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-1">Organizations</h1>
          <p className="text-muted-foreground">Manage and view all registered organizations.</p>
        </div>

        <Card className="p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">All Organizations</h2>
            </div>
            {/* 
            <Button variant="outline">
               Export CSV
            </Button>
            */}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Organization</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Plan ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Created At</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Sector</th>
                </tr>
              </thead>
              <tbody>
                {organizations.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                      No organizations found or access denied.
                    </td>
                  </tr>
                ) : (
                  organizations.map((org: any) => (
                    <tr key={org._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                            {org.name?.substring(0, 2).toUpperCase() || 'NA'}
                          </div>
                          <span className="text-sm font-medium text-foreground">{org.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{org.planId || 'Free'}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(org.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {org.sector || 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}
