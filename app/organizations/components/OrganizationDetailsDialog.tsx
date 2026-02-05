'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LogIn,
  ShieldBan,
  ShieldCheck,
  Users,
  FileText,
  Mail,
  MessageSquare,
  Phone,
  Coins,
  BarChart3,
  User,
} from 'lucide-react'
import { format } from 'date-fns'

type OrganizationDetailsDialogProps = {
  open: boolean
  onClose: () => void
  selectedOrg: any | null
  credentialsForm: any | null
  onLoginIntoOrganization: () => void
  onToggleSuspend: () => void
  onDetailChange: (field: string, value: string | number) => void
  onCredentialChange: (field: string, value: string) => void
  onSaveDetails: () => void
  onSaveCredentials: () => void
  onViewUsers?: () => void
  onViewContacts?: () => void
  onViewGroups?: () => void
  onViewLogs?: () => void
}

export function OrganizationDetailsDialog({
  open,
  onClose,
  selectedOrg,
  credentialsForm,
  onLoginIntoOrganization,
  onToggleSuspend,
  onDetailChange,
  onCredentialChange,
  onSaveDetails,
  onSaveCredentials,
  onViewUsers,
  onViewContacts,
  onViewGroups,
  onViewLogs,
}: OrganizationDetailsDialogProps) {
  // Mock data - will be made dynamic later
  const stats = {
    totalUsers: 24,
    totalContacts: 3456,
    totalGroups: 89,
    messagesSent: {
      email: 1243,
      sms: 856,
      whatsapp: 2103,
    },
    tokensSpent: 45678,
  }

  const adminDetails = {
    name: 'John Doe',
    email: 'john.doe@organization.com',
    phone: '+1 234 567 8900',
  }

  return (
    <>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
      <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent 
        className="max-w-none w-[96vw] h-[94vh] p-0 gap-0 overflow-hidden"
        style={{ 
          maxWidth: '84vw', 
          width: '84vw', 
          height: '92vh',
          maxHeight: '92vh'
        }}
      >
        {selectedOrg && (
          <div className="h-full flex flex-col">
            {/* Header - Fixed */}
            <div className="shrink-0 border-b bg-background px-8 py-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-5">
                  <div
                    className={`w-20 h-20 rounded-2xl ${selectedOrg.color} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}
                  >
                    {selectedOrg.name
                      .split(' ')
                      .slice(0, 2)
                      .map((w: string) => w[0])
                      .join('')}
                  </div>
                  <div className="flex flex-col gap-2">
                    <DialogTitle className="text-4xl font-semibold">
                      {selectedOrg.name}
                    </DialogTitle>
                    <DialogDescription className="text-lg text-muted-foreground">
                      {selectedOrg.subdomain}
                    </DialogDescription>
                  </div>
                </div>
                <Badge
                  className={`text-base px-4 py-2 ${
                    selectedOrg.status === 'Active'
                      ? 'bg-green-100 text-green-700 border-green-200'
                      : 'bg-red-100 text-red-700 border-red-200'
                  }`}
                  variant="outline"
                >
                  {selectedOrg.status}
                </Badge>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="flex items-center gap-2"
                  onClick={onLoginIntoOrganization}
                >
                  <LogIn className="w-5 h-5" />
                  Login into organization
                </Button>
                <Button
                  size="lg"
                  variant={selectedOrg.status === 'Suspended' ? 'outline' : 'destructive'}
                  className="flex items-center gap-2"
                  onClick={onToggleSuspend}
                >
                  {selectedOrg.status === 'Suspended' ? (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      Unsuspend
                    </>
                  ) : (
                    <>
                      <ShieldBan className="w-5 h-5" />
                      Suspend
                    </>
                  )}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={onViewUsers}
                >
                  <Users className="w-5 h-5" />
                  View users
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={onViewContacts}
                >
                  <User className="w-5 h-5" />
                  View contacts
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={onViewGroups}
                >
                  <Users className="w-5 h-5" />
                  View groups
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={onViewLogs}
                >
                  <FileText className="w-5 h-5" />
                  View logs
                </Button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div 
              className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar" 
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#d1d5db #f3f4f6'
              }}
            >
              <div className="space-y-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <Card className="border-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Users
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalUsers}</div>
                      <p className="text-xs text-muted-foreground mt-1">Total</p>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Contacts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.totalContacts.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Total</p>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Groups
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.totalGroups.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Total</p>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        WhatsApp
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.messagesSent.whatsapp.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Messages</p>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.messagesSent.email.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Messages</p>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        SMS
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.messagesSent.sms.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Messages</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Sidebar - Admin & Org Info */}
                  <div className="lg:col-span-3 space-y-6">
                    {/* Admin Details */}
                    <Card className="border-2">
                      <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <User className="w-5 h-5" />
                          Admin Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground mb-2">
                            Name
                          </p>
                          <p className="text-base font-medium">{adminDetails.name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground mb-2">
                            Email
                          </p>
                          <p className="text-base font-medium break-all">{adminDetails.email}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground mb-2">
                            Phone
                          </p>
                          <p className="text-base font-medium">{adminDetails.phone}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Organization Meta */}
                    <Card className="border-2">
                      <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <BarChart3 className="w-5 h-5" />
                          Organization Info
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground mb-2">
                            Sector
                          </p>
                          <p className="text-base font-medium">{selectedOrg.sector || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground mb-2">
                            Country
                          </p>
                          <p className="text-base font-medium">{selectedOrg.country || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground mb-2">
                            Credits
                          </p>
                          <p className="text-base font-medium flex items-center gap-2">
                            <Coins className="w-5 h-5 text-yellow-500" />
                            {selectedOrg.credits ?? 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground mb-2">
                            Tokens Spent
                          </p>
                          <p className="text-base font-medium">{stats.tokensSpent.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground mb-2">
                            Created
                          </p>
                          <p className="text-base font-medium">
                            {selectedOrg.createdAtRaw
                              ? format(new Date(selectedOrg.createdAtRaw), 'MMM dd, yyyy')
                              : 'N/A'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Content - Tabs */}
                  <div className="lg:col-span-9">
                    <Tabs defaultValue="details" className="space-y-6">
                      <TabsList className="grid w-full grid-cols-2 h-14">
                        <TabsTrigger value="details" className="text-lg font-medium">
                          Organization Details
                        </TabsTrigger>
                        <TabsTrigger value="credentials" className="text-lg font-medium">
                          Credentials
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="details" className="space-y-6">
                        <Card className="border-2">
                          <CardHeader className="pb-6">
                            <CardTitle className="text-2xl">
                              Organization Details
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-3">
                                <Label htmlFor="org-name" className="text-base font-semibold">
                                  Organization name
                                </Label>
                                <Input
                                  id="org-name"
                                  value={selectedOrg.name}
                                  onChange={(e) => onDetailChange('name', e.target.value)}
                                  className="h-12 text-base"
                                />
                              </div>
                              <div className="space-y-3">
                                <Label htmlFor="org-sector" className="text-base font-semibold">
                                  Sector
                                </Label>
                                <Input
                                  id="org-sector"
                                  value={selectedOrg.sector || ''}
                                  onChange={(e) => onDetailChange('sector', e.target.value)}
                                  className="h-12 text-base"
                                />
                              </div>
                              <div className="space-y-3">
                                <Label htmlFor="org-country" className="text-base font-semibold">
                                  Country
                                </Label>
                                <Input
                                  id="org-country"
                                  value={selectedOrg.country || ''}
                                  onChange={(e) => onDetailChange('country', e.target.value)}
                                  className="h-12 text-base"
                                />
                              </div>
                              <div className="space-y-3">
                                <Label htmlFor="org-credits" className="text-base font-semibold">
                                  Credits
                                </Label>
                                <Input
                                  id="org-credits"
                                  type="number"
                                  value={selectedOrg.credits ?? 0}
                                  onChange={(e) =>
                                    onDetailChange('credits', Number(e.target.value) || 0)
                                  }
                                  className="h-12 text-base"
                                />
                              </div>
                              <div className="space-y-3 md:col-span-2">
                                <Label htmlFor="org-email-from-name" className="text-base font-semibold">
                                  Email from name
                                </Label>
                                <Input
                                  id="org-email-from-name"
                                  value={selectedOrg.emailFromName || ''}
                                  onChange={(e) =>
                                    onDetailChange('emailFromName', e.target.value)
                                  }
                                  className="h-12 text-base"
                                />
                              </div>
                              <div className="space-y-3 md:col-span-2">
                                <Label htmlFor="org-notes" className="text-base font-semibold">
                                  Notes
                                </Label>
                                <Textarea
                                  id="org-notes"
                                  placeholder="Internal notes about this organization (optional)"
                                  rows={6}
                                  className="resize-none text-base"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end pt-4">
                              <Button size="lg" onClick={onSaveDetails}>
                                Save details
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="credentials" className="space-y-8">
                        {/* SMS Credentials */}
                        <Card className="border-2">
                          <CardHeader className="pb-6">
                            <CardTitle className="text-2xl flex items-center gap-3">
                              <Phone className="w-6 h-6" />
                              SMS Credentials
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-3 md:col-span-2">
                                <Label htmlFor="sms-api-url" className="text-base font-semibold">
                                  API URL
                                </Label>
                                <Input
                                  id="sms-api-url"
                                  value={credentialsForm?.sms_apiUrl || ''}
                                  onChange={(e) =>
                                    onCredentialChange('sms_apiUrl', e.target.value)
                                  }
                                  className="h-12 text-base"
                                />
                              </div>
                              <div className="space-y-3">
                                <Label htmlFor="sms-api-key" className="text-base font-semibold">
                                  API key
                                </Label>
                                <Input
                                  id="sms-api-key"
                                  type="password"
                                  value={credentialsForm?.sms_apiKey || ''}
                                  onChange={(e) =>
                                    onCredentialChange('sms_apiKey', e.target.value)
                                  }
                                  className="h-12 text-base"
                                />
                              </div>
                              <div className="space-y-3">
                                <Label htmlFor="sms-partner-id" className="text-base font-semibold">
                                  Partner ID
                                </Label>
                                <Input
                                  id="sms-partner-id"
                                  value={credentialsForm?.sms_partnerID || ''}
                                  onChange={(e) =>
                                    onCredentialChange('sms_partnerID', e.target.value)
                                  }
                                  className="h-12 text-base"
                                />
                              </div>
                              <div className="space-y-3 md:col-span-2">
                                <Label htmlFor="sms-short-code" className="text-base font-semibold">
                                  Short code
                                </Label>
                                <Input
                                  id="sms-short-code"
                                  value={credentialsForm?.sms_shortCode || ''}
                                  onChange={(e) =>
                                    onCredentialChange('sms_shortCode', e.target.value)
                                  }
                                  className="h-12 text-base"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Email Credentials */}
                        <Card className="border-2">
                          <CardHeader className="pb-6">
                            <CardTitle className="text-2xl flex items-center gap-3">
                              <Mail className="w-6 h-6" />
                              Email Credentials
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-3">
                                <Label htmlFor="email-host" className="text-base font-semibold">
                                  Host
                                </Label>
                                <Input
                                  id="email-host"
                                  value={credentialsForm?.email_host || ''}
                                  onChange={(e) =>
                                    onCredentialChange('email_host', e.target.value)
                                  }
                                  className="h-12 text-base"
                                />
                              </div>
                              <div className="space-y-3">
                                <Label htmlFor="email-port" className="text-base font-semibold">
                                  Port
                                </Label>
                                <Input
                                  id="email-port"
                                  value={credentialsForm?.email_port || ''}
                                  onChange={(e) =>
                                    onCredentialChange('email_port', e.target.value)
                                  }
                                  className="h-12 text-base"
                                />
                              </div>
                              <div className="space-y-3">
                                <Label htmlFor="email-user" className="text-base font-semibold">
                                  User
                                </Label>
                                <Input
                                  id="email-user"
                                  value={credentialsForm?.email_user || ''}
                                  onChange={(e) =>
                                    onCredentialChange('email_user', e.target.value)
                                  }
                                  className="h-12 text-base"
                                />
                              </div>
                              <div className="space-y-3">
                                <Label htmlFor="email-pass" className="text-base font-semibold">
                                  Password / App password
                                </Label>
                                <Input
                                  id="email-pass"
                                  type="password"
                                  value={credentialsForm?.email_pass || ''}
                                  onChange={(e) =>
                                    onCredentialChange('email_pass', e.target.value)
                                  }
                                  className="h-12 text-base"
                                />
                              </div>
                              <div className="space-y-3 md:col-span-2">
                                <Label htmlFor="email-from" className="text-base font-semibold">
                                  From address
                                </Label>
                                <Input
                                  id="email-from"
                                  value={credentialsForm?.email_from || ''}
                                  onChange={(e) =>
                                    onCredentialChange('email_from', e.target.value)
                                  }
                                  className="h-12 text-base"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <div className="flex justify-end">
                          <Button size="lg" onClick={onSaveCredentials}>
                            Save credentials
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  )
}