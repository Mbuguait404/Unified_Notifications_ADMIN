'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { MetricCard } from '@/components/dashboard/metric-card'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Building2,
  Filter,
  Download,
  Plus,
  Search,
  AlertTriangle,
  Award,
  TrendingUp,
  MoreVertical,
  Loader2,
  LogIn,
  ShieldBan,
  ShieldCheck,
  KeyRound,
  Edit,
} from 'lucide-react'
import { organizationService, Organization } from '@/services/organizations.service'
import { format } from 'date-fns'

export default function OrganizationsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')
  const [organizations, setOrganizations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrg, setSelectedOrg] = useState<any | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [credentialsForm, setCredentialsForm] = useState<any | null>(null)

  useEffect(() => {
    async function fetchOrganizations() {
      try {
        const data = await organizationService.getAllOrganizations()
        // Map backend data to UI format
        const mappedOrgs = data.map((org: Organization & {
          sector?: string
          country?: string
          credits?: number
          emailFromName?: string | null
          updatedAt?: string
          credentials?: any
        }) => ({
          id: org._id,
          name: org.name,
          subdomain: org.slug || org.sector || 'N/A', // Use sector if slug missing
          createdDate: org.createdAt ? format(new Date(org.createdAt), 'MMM dd, yyyy') : 'N/A',
          plan: org.plan || 'Free', // Default to Free if undefined
          notificationsMTD: org.notificationsMTD?.toLocaleString() || '0',
          status: org.status || 'Active',
          color: getRandomColor(org.name), // Helper for color
          sector: org.sector,
          country: org.country,
          credits: org.credits ?? 0,
          emailFromName: org.emailFromName,
          createdAtRaw: org.createdAt,
          updatedAtRaw: org.updatedAt,
          credentials: org.credentials ?? {},
          raw: org,
        }))
        setOrganizations(mappedOrgs)
      } catch (err) {
        console.error('Failed to fetch organizations:', err)
        setError('Failed to load organizations. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrganizations()
  }, [])

  function getRandomColor(name: string) {
    const colors = ['bg-purple-500', 'bg-pink-500', 'bg-red-500', 'bg-orange-500', 'bg-blue-500', 'bg-green-500']
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  function handleOpenDetails(org: any) {
    setSelectedOrg(org)
    setCredentialsForm(org.credentials ?? {})
    setIsDetailsOpen(true)
  }

  function handleCloseDetails() {
    setIsDetailsOpen(false)
    setSelectedOrg(null)
    setCredentialsForm(null)
  }

  function handleDetailChange(field: string, value: string | number) {
    if (!selectedOrg) return
    setSelectedOrg((prev: any) => ({
      ...prev,
      [field]: value,
    }))
  }

  function handleCredentialChange(field: string, value: string) {
    setCredentialsForm((prev: any) => ({
      ...(prev || {}),
      [field]: value,
    }))
  }

  function handleSaveDetails() {
    if (!selectedOrg) return
    // TODO: Wire up to backend update endpoint
    console.log('Save organization details', selectedOrg)
  }

  function handleSaveCredentials() {
    if (!selectedOrg) return
    // TODO: Wire up to backend credentials update endpoint
    console.log('Save organization credentials', {
      id: selectedOrg.id,
      credentials: credentialsForm,
    })
  }

  function handleToggleSuspend() {
    if (!selectedOrg) return
    const nextStatus = selectedOrg.status === 'Suspended' ? 'Active' : 'Suspended'
    setSelectedOrg((prev: any) => ({
      ...prev,
      status: nextStatus,
    }))
    // Optimistically update table list
    setOrganizations((prev) =>
      prev.map((org) =>
        org.id === selectedOrg.id ? { ...org, status: nextStatus } : org,
      ),
    )
    // TODO: Call backend to persist status change
  }

  function handleLoginIntoOrganization() {
    if (!selectedOrg) return
    // TODO: Implement real "login into organization" / impersonation flow
    console.log('Login into organization', selectedOrg.id)
  }

  const filteredOrgs = organizations.filter((org) => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.subdomain.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || org.status.toLowerCase() === statusFilter.toLowerCase()
    const matchesPlan = planFilter === 'all' || org.plan.toLowerCase() === planFilter.toLowerCase()

    return matchesSearch && matchesStatus && matchesPlan
  })

  return (
    <AppLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Organization Management</h1>
            <p className="text-muted-foreground">Manage customer environments, subscriptions, and platform usage.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create New
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Total Organizations"
            value={organizations.length.toString()}
            icon={<Building2 className="w-6 h-6" />}
            trend={{ value: 12, direction: 'up', label: 'this month' }}
          />
          <MetricCard
            title="Notifications (MTD)"
            value="4.2M"
            icon={<TrendingUp className="w-6 h-6" />}
            trend={{ value: 8.2, direction: 'up' }}
          />
          <MetricCard
            title="Enterprise Customers"
            value={organizations.filter(o => o.plan === 'Enterprise').length.toString()}
            icon={<Award className="w-6 h-6" />}
            trend={{ value: 5, direction: 'up' }}
          />
          <MetricCard
            title="Failed Webhooks"
            value="12.4k"
            icon={<AlertTriangle className="w-6 h-6" />}
            trend={{ value: 2, direction: 'down' }}
          />
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6 border border-border">
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Filter by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-40">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-40">
                <Select value={planFilter} onValueChange={setPlanFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Organizations Table */}
        <Card className="border border-border overflow-hidden">
          {isLoading ? (
            <div className="p-12 flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="p-12 flex justify-center items-center text-red-500">
              {error}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left py-3 px-6 text-sm font-semibold text-muted-foreground">Organization Name</th>
                      <th className="text-left py-3 px-6 text-sm font-semibold text-muted-foreground">Created Date</th>
                      <th className="text-left py-3 px-6 text-sm font-semibold text-muted-foreground">Current Plan</th>
                      <th className="text-left py-3 px-6 text-sm font-semibold text-muted-foreground">Notifications (MTD)</th>
                      <th className="text-left py-3 px-6 text-sm font-semibold text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-6 text-sm font-semibold text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrgs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                          No organizations found matching your filters.
                        </td>
                      </tr>
                    ) : filteredOrgs.map((org) => (
                      <tr key={org.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg ${org.color} flex items-center justify-center text-white text-xs font-bold`}>
                              {org.name.split(' ').slice(0, 2).map((w: string) => w[0]).join('')}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{org.name}</p>
                              <p className="text-xs text-muted-foreground">{org.subdomain}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-muted-foreground">{org.createdDate}</td>
                        <td className="py-4 px-6">
                          <Badge
                            variant={org.plan === 'Enterprise' ? 'default' : org.plan === 'Pro' ? 'secondary' : 'outline'}
                            className={org.plan === 'Enterprise' ? 'bg-blue-600' : org.plan === 'Pro' ? 'bg-purple-200 text-purple-800' : ''}
                          >
                            {org.plan}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 text-sm text-foreground">{org.notificationsMTD}</td>
                        <td className="py-4 px-6">
                          <Badge className={org.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                            {org.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => handleOpenDetails(org)}
                            >
                              <Edit className="w-3 h-3" />
                              View / Edit
                            </Button>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between p-4 border-t border-border bg-muted/50">
                <p className="text-sm text-muted-foreground">Showing {filteredOrgs.length} of {organizations.length} results</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>Previous</Button>
                  <Button variant="default" size="sm" className="bg-primary">1</Button>
                  <Button variant="outline" size="sm" disabled>Next</Button>
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Organization Details / Edit Modal */}
        <Dialog open={isDetailsOpen} onOpenChange={(open) => !open && handleCloseDetails()}>
          <DialogContent className="max-w-3xl">
            {selectedOrg && (
              <div className="space-y-6">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-lg ${selectedOrg.color} flex items-center justify-center text-white text-sm font-bold`}
                    >
                      {selectedOrg.name
                        .split(' ')
                        .slice(0, 2)
                        .map((w: string) => w[0])
                        .join('')}
                    </div>
                    <div className="flex flex-col">
                      <span>{selectedOrg.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {selectedOrg.subdomain}
                      </span>
                    </div>
                    <Badge
                      className={`ml-auto ${
                        selectedOrg.status === 'Active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {selectedOrg.status}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription>
                    View and edit organization details. Use the tabs below to manage profile and
                    credentials.
                  </DialogDescription>
                </DialogHeader>

                {/* Top actions */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={handleLoginIntoOrganization}
                  >
                    <LogIn className="w-3 h-3" />
                    Login into organization
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedOrg.status === 'Suspended' ? 'outline' : 'destructive'}
                    className="flex items-center gap-2"
                    onClick={handleToggleSuspend}
                  >
                    {selectedOrg.status === 'Suspended' ? (
                      <>
                        <ShieldCheck className="w-3 h-3" />
                        Unsuspend
                      </>
                    ) : (
                      <>
                        <ShieldBan className="w-3 h-3" />
                        Suspend
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <KeyRound className="w-3 h-3" />
                    Edit credentials
                  </Button>
                </div>

                {/* Meta info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground text-xs">Sector</p>
                    <p>{selectedOrg.sector || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-xs">Country</p>
                    <p>{selectedOrg.country || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-xs">Credits</p>
                    <p>{selectedOrg.credits ?? 0}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-xs">Created</p>
                    <p>
                      {selectedOrg.createdAtRaw
                        ? format(new Date(selectedOrg.createdAtRaw), 'MMM dd, yyyy')
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                <Tabs defaultValue="details" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="credentials">Credentials</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="org-name">Organization name</Label>
                        <Input
                          id="org-name"
                          value={selectedOrg.name}
                          onChange={(e) => handleDetailChange('name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="org-sector">Sector</Label>
                        <Input
                          id="org-sector"
                          value={selectedOrg.sector || ''}
                          onChange={(e) => handleDetailChange('sector', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="org-country">Country</Label>
                        <Input
                          id="org-country"
                          value={selectedOrg.country || ''}
                          onChange={(e) => handleDetailChange('country', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="org-credits">Credits</Label>
                        <Input
                          id="org-credits"
                          type="number"
                          value={selectedOrg.credits ?? 0}
                          onChange={(e) =>
                            handleDetailChange('credits', Number(e.target.value) || 0)
                          }
                        />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <Label htmlFor="org-email-from-name">Email from name</Label>
                        <Input
                          id="org-email-from-name"
                          value={selectedOrg.emailFromName || ''}
                          onChange={(e) => handleDetailChange('emailFromName', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <Label>Notes</Label>
                        <Textarea placeholder="Internal notes about this organization (optional)" />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button size="sm" onClick={handleSaveDetails}>
                        Save details
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="credentials" className="space-y-4 pt-2">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">
                          SMS credentials
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5 md:col-span-2">
                            <Label htmlFor="sms-api-url">API URL</Label>
                            <Input
                              id="sms-api-url"
                              value={credentialsForm?.sms_apiUrl || ''}
                              onChange={(e) =>
                                handleCredentialChange('sms_apiUrl', e.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="sms-api-key">API key</Label>
                            <Input
                              id="sms-api-key"
                              type="password"
                              value={credentialsForm?.sms_apiKey || ''}
                              onChange={(e) =>
                                handleCredentialChange('sms_apiKey', e.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="sms-partner-id">Partner ID</Label>
                            <Input
                              id="sms-partner-id"
                              value={credentialsForm?.sms_partnerID || ''}
                              onChange={(e) =>
                                handleCredentialChange('sms_partnerID', e.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-1.5 md:col-span-2">
                            <Label htmlFor="sms-short-code">Short code</Label>
                            <Input
                              id="sms-short-code"
                              value={credentialsForm?.sms_shortCode || ''}
                              onChange={(e) =>
                                handleCredentialChange('sms_shortCode', e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">
                          Email credentials
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="email-host">Host</Label>
                            <Input
                              id="email-host"
                              value={credentialsForm?.email_host || ''}
                              onChange={(e) =>
                                handleCredentialChange('email_host', e.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="email-port">Port</Label>
                            <Input
                              id="email-port"
                              value={credentialsForm?.email_port || ''}
                              onChange={(e) =>
                                handleCredentialChange('email_port', e.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="email-user">User</Label>
                            <Input
                              id="email-user"
                              value={credentialsForm?.email_user || ''}
                              onChange={(e) =>
                                handleCredentialChange('email_user', e.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="email-pass">Password / App password</Label>
                            <Input
                              id="email-pass"
                              type="password"
                              value={credentialsForm?.email_pass || ''}
                              onChange={(e) =>
                                handleCredentialChange('email_pass', e.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-1.5 md:col-span-2">
                            <Label htmlFor="email-from">From address</Label>
                            <Input
                              id="email-from"
                              value={credentialsForm?.email_from || ''}
                              onChange={(e) =>
                                handleCredentialChange('email_from', e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button size="sm" onClick={handleSaveCredentials}>
                        Save credentials
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
