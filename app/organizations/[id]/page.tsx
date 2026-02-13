'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
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
    ArrowLeft,
    Loader2,
    CreditCard
} from 'lucide-react'
import { Key, Plus } from 'lucide-react'
import { MoreVertical, Trash, Printer, ShieldAlert } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { organizationService } from '@/services/organizations.service'
import { api } from '@/services/api'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'

export default function OrganizationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { id } = use(params)
    const [selectedOrg, setSelectedOrg] = useState<any | null>(null)
    const [credentialsForm, setCredentialsForm] = useState<any | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalContacts: 0,
        totalGroups: 0,
        messagesSent: {
            email: 0,
            sms: 0,
            whatsapp: 0,
        },
        creditsSpent: 0,
    })
    const [adminDetails, setAdminDetails] = useState({
        name: 'N/A',
        email: 'N/A',
        phone: 'N/A',
    })

    const [confirmSuspend, setConfirmSuspend] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const { user } = useAuth()

    // API Keys state
    const [apiKeys, setApiKeys] = useState<any[]>([])
    const [isLoadingApiKeys, setIsLoadingApiKeys] = useState(false)
    const [showCreateKeyDialog, setShowCreateKeyDialog] = useState(false)
    const [newKeyName, setNewKeyName] = useState('')
    const [createdPlainKey, setCreatedPlainKey] = useState<string | null>(null)

    async function performSuspend() {
        const nextStatus = selectedOrg.status === 'Suspended' ? 'Active' : 'Suspended'
        try {
            if (nextStatus === 'Suspended') {
                await organizationService.suspendOrganization(selectedOrg.id)
            } else {
                await organizationService.unsuspendOrganization(selectedOrg.id)
            }
            setSelectedOrg((prev: any) => ({ ...prev, status: nextStatus }))
            toast.success(`Organization ${nextStatus === 'Active' ? 'unsuspended' : 'suspended'}`)
            setConfirmSuspend(false)
        } catch (err) {
            console.error(err)
            toast.error('Failed to update status')
        }
    }

    async function performSoftDelete() {
        try {
            await organizationService.softDeleteOrganization(selectedOrg.id)
            setSelectedOrg((prev: any) => ({ ...prev, status: 'Deleted', isDeleted: true }))
            toast.success('Organization deleted')
            setConfirmDelete(false)
            router.push('/organizations')
        } catch (err) {
            console.error(err)
            toast.error('Failed to delete organization')
        }
    }

    function handlePrint() {
        const w = window.open('', '_blank')
        if (!w) return
        w.document.write(`<h1>Organization: ${selectedOrg?.name}</h1><pre>${JSON.stringify(selectedOrg, null, 2)}</pre>`)
        w.document.close()
        w.print()
    }

    useEffect(() => {
        async function fetchOrg() {
            try {
                setIsLoading(true)
                // Fetch organization details and stats in parallel
                const [org, statsData] = await Promise.all([
                    organizationService.getOrganizationById(id),
                    organizationService.getOrganizationStats(id),
                ])
                
                setSelectedOrg({
                    ...org,
                    id: org._id,
                    subdomain: org.slug || org.sector || 'N/A',
                    color: getRandomColor(org.name),
                    createdAtRaw: org.createdAt,
                })
                setCredentialsForm(org.credentials ?? {})
                
                // Set real stats
                setStats({
                    totalUsers: statsData.stats.totalUsers,
                    totalContacts: statsData.stats.totalContacts,
                    totalGroups: statsData.stats.totalGroups,
                    messagesSent: {
                        email: statsData.stats.messagesSent.email,
                        sms: statsData.stats.messagesSent.sms,
                        whatsapp: statsData.stats.messagesSent.whatsapp,
                    },
                    creditsSpent: statsData.stats.creditsSpent,
                })
                
                // Set real admin details
                setAdminDetails(statsData.adminDetails)
                // Fetch API keys for the organization (if permitted)
                try {
                    await fetchApiKeys(org._id)
                } catch (err) {
                    // ignore - keys may not be available to this user
                }
            } catch (err) {
                console.error('Failed to fetch organization:', err)
                toast.error('Failed to load organization details')
                router.push('/organizations')
            } finally {
                setIsLoading(false)
            }
        }
        fetchOrg()
    }, [id, router])

    async function fetchApiKeys(orgId: string) {
        try {
            setIsLoadingApiKeys(true)
            const data = await api.get<any[]>(`/api-keys?orgId=${orgId}`)
            setApiKeys(data)
        } catch (err) {
            console.error('Failed to load API keys', err)
        } finally {
            setIsLoadingApiKeys(false)
        }
    }

    const handleCreateApiKey = async () => {
        if (!newKeyName) return toast.error('Provide a name for the key')
        try {
            setIsSaving(true)
            const data = await api.post<any>('/api-keys', { 
                name: newKeyName,
                organization: selectedOrg.id 
            })
            // API returns plaintext key once
            setCreatedPlainKey(data.key)
            setApiKeys((prev) => [
                { _id: data.id, name: data.name, prefix: data.prefix, createdAt: new Date().toISOString(), isActive: true, createdBy: { firstName: user?.firstName || '', lastName: user?.lastName || '' } },
                ...prev,
            ])
            setShowCreateKeyDialog(false)
            setNewKeyName('')
            toast.success('API key created — copy the plaintext value below')
        } catch (err) {
            console.error(err)
            toast.error('Failed to create API key')
        } finally {
            setIsSaving(false)
        }
    }

    const handleRevoke = async (keyId: string) => {
        try {
            await api.put<any>(`/api-keys/${keyId}/revoke?orgId=${selectedOrg.id}`, {})
            setApiKeys((prev) => prev.map(k => k._id === keyId ? { ...k, isActive: false } : k))
            toast.success('API key revoked')
        } catch (err) {
            console.error(err)
            toast.error('Failed to revoke key')
        }
    }

    const handleActivate = async (keyId: string) => {
        try {
            await api.put<any>(`/api-keys/${keyId}/activate?orgId=${selectedOrg.id}`, {})
            setApiKeys((prev) => prev.map(k => k._id === keyId ? { ...k, isActive: true } : k))
            toast.success('API key activated')
        } catch (err) {
            console.error(err)
            toast.error('Failed to activate key')
        }
    }

    const handleDeleteKey = async (keyId: string) => {
        try {
            await api.delete<any>(`/api-keys/${keyId}?orgId=${selectedOrg.id}`)
            setApiKeys((prev) => prev.filter(k => k._id !== keyId))
            toast.success('API key deleted')
        } catch (err) {
            console.error(err)
            toast.error('Failed to delete key')
        }
    }

    function getRandomColor(name: string) {
        const colors = ['bg-purple-500', 'bg-pink-500', 'bg-red-500', 'bg-orange-500', 'bg-blue-500', 'bg-green-500']
        let hash = 0
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash)
        }
        return colors[Math.abs(hash) % colors.length]
    }

    const handleDetailChange = (field: string, value: string | number) => {
        setSelectedOrg((prev: any) => ({ ...prev, [field]: value }))
    }

    const handleCredentialChange = (field: string, value: string) => {
        setCredentialsForm((prev: any) => ({ ...prev, [field]: value }))
    }

    const handleSaveDetails = async () => {
        try {
            setIsSaving(true)
            await organizationService.updateOrganization(id, {
                name: selectedOrg.name,
                sector: selectedOrg.sector,
                country: selectedOrg.country,
                credits: selectedOrg.credits,
                emailFromName: selectedOrg.emailFromName,
            })
            toast.success('Organization details saved')
        } catch (err) {
            toast.error('Failed to save details')
        } finally {
            setIsSaving(false)
        }
    }

    const handleSaveCredentials = async () => {
        try {
            setIsSaving(true)
            await organizationService.updateOrganizationCredentials(id, credentialsForm)
            toast.success('Credentials saved successfully')
        } catch (err) {
            toast.error('Failed to save credentials')
        } finally {
            setIsSaving(false)
        }
    }

    const handleToggleSuspend = async () => {
        const nextStatus = selectedOrg.status === 'Suspended' ? 'Active' : 'Suspended'
        try {
            await organizationService.updateOrganization(id, { status: nextStatus })
            setSelectedOrg((prev: any) => ({ ...prev, status: nextStatus }))
            toast.success(`Organization ${nextStatus === 'Active' ? 'unsuspended' : 'suspended'}`)
        } catch (err) {
            toast.error('Failed to update status')
        }
    }

    const handleLoginIntoOrganization = () => {
        // TODO: Implement impersonation
        toast.info('Impersonation flow not yet implemented')
    }

    if (isLoading) {
        return (
            <AppLayout>
                <div className="h-full flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
            </AppLayout>
        )
    }

    return (
        <AppLayout>
            <div className="bg-background min-h-full">
                {/* Header */}
                <div className="border-b bg-background px-8 py-6">
                    <div className="max-w-8xl mx-auto">
                        <div className="mb-6">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
                                onClick={() => router.push('/organizations')}
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Organizations
                            </Button>
                            <div className="flex items-start justify-between">
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
                                        <h1 className="text-4xl font-semibold text-foreground">
                                            {selectedOrg.name}
                                        </h1>
                                        <p className="text-lg text-muted-foreground">
                                            {selectedOrg.subdomain}
                                        </p>
                                    </div>
                                </div>
                                <Badge
                                    className={`text-base px-4 py-2 ${selectedOrg.status === 'Active'
                                        ? 'bg-green-100 text-green-700 border-green-200'
                                        : 'bg-red-100 text-red-700 border-red-200'
                                        }`}
                                    variant="outline"
                                >
                                    {selectedOrg.status}
                                </Badge>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex flex-wrap gap-3">
                            <Button
                                size="lg"
                                className="flex items-center gap-2"
                                onClick={handleLoginIntoOrganization}
                            >
                                <LogIn className="w-5 h-5" />
                                Login into organization
                            </Button>
                            <Button
                                size="lg"
                                variant={selectedOrg.status === 'Suspended' ? 'outline' : 'destructive'}
                                className="flex items-center gap-2"
                                onClick={handleToggleSuspend}
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
                            >
                                <Users className="w-5 h-5" />
                                View users
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <User className="w-5 h-5" />
                                View contacts
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <Users className="w-5 h-5" />
                                View groups
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <FileText className="w-5 h-5" />
                                View logs
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <CreditCard className="w-5 h-5" />
                                View Transactions
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handlePrint}>
                                        <Printer className="mr-2 h-4 w-4" /> Print details
                                    </DropdownMenuItem>
                                    {selectedOrg.status === 'Suspended' ? (
                                        <DropdownMenuItem onClick={() => setConfirmSuspend(true)} className="text-green-600">
                                            <ShieldCheck className="mr-2 h-4 w-4" /> Unsuspend
                                        </DropdownMenuItem>
                                    ) : (
                                        <DropdownMenuItem onClick={() => setConfirmSuspend(true)} className="text-red-600">
                                            <ShieldAlert className="mr-2 h-4 w-4" /> Suspend
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onClick={() => setConfirmDelete(true)} className="text-red-600">
                                        <Trash className="mr-2 h-4 w-4" /> Delete (soft)
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>

                {/* Confirm Suspend Dialog */}
                <Dialog open={confirmSuspend} onOpenChange={(open) => !open && setConfirmSuspend(false)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{selectedOrg?.status === 'Suspended' ? 'Unsuspend Organization' : 'Suspend Organization'}</DialogTitle>
                            <DialogDescription>Are you sure you want to {selectedOrg?.status === 'Suspended' ? 'unsuspend' : 'suspend'} "{selectedOrg?.name}"?</DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex gap-2">
                            <Button variant="outline" onClick={() => setConfirmSuspend(false)}>Cancel</Button>
                            <Button onClick={performSuspend}>Confirm</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Confirm Delete Dialog */}
                <Dialog open={confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(false)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Organization</DialogTitle>
                            <DialogDescription>This will soft-delete the organization "{selectedOrg?.name}". Are you sure?</DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex gap-2">
                            <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button>
                            <Button className="bg-red-600" onClick={performSoftDelete}>Delete</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <div className="max-w-8xl mx-auto flex flex-col lg:flex-row min-h-full">
                    {/* Left Sidebar */}
                    <div className="w-full lg:w-80 shrink-0 lg:border-r bg-muted/5">
                        <div className="p-8 space-y-6">
                            {/* Admin Details */}
                            <Card className="border-2 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <User className="w-5 h-5" />
                                        Admin Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <div>
                                        <p className="text-sm font-semibold text-muted-foreground mb-1">Name</p>
                                        <p className="text-base font-medium">{adminDetails.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-muted-foreground mb-1">Email</p>
                                        <p className="text-base font-medium break-all">{adminDetails.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-muted-foreground mb-1">Phone</p>
                                        <p className="text-base font-medium">{adminDetails.phone}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Organization Meta */}
                            <Card className="border-2 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5" />
                                        Organization Info
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <div>
                                        <p className="text-sm font-semibold text-muted-foreground mb-1">Sector</p>
                                        <p className="text-base font-medium">{selectedOrg.sector || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-muted-foreground mb-1">Country</p>
                                        <p className="text-base font-medium">{selectedOrg.country || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-muted-foreground mb-1">Credits</p>
                                        <p className="text-base font-medium flex items-center gap-2">
                                            <Coins className="w-5 h-5 text-yellow-500" />
                                            {selectedOrg.credits ?? 0}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-muted-foreground mb-1">Credits Spent</p>
                                        <p className="text-base font-medium">{stats.creditsSpent.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-muted-foreground mb-1">Created</p>
                                        <p className="text-base font-medium">
                                            {selectedOrg.createdAtRaw
                                                ? format(new Date(selectedOrg.createdAtRaw), 'MMM dd, yyyy')
                                                : 'N/A'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className="flex-1">
                        <div className="p-8 space-y-8 max-w-8xl mx-auto">
                            {/* Stats Overview */}
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                                <Card className="border-2 shadow-sm">
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

                                <Card className="border-2 shadow-sm">
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

                                <Card className="border-2 shadow-sm">
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

                                <Card className="border-2 shadow-sm">
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

                                <Card className="border-2 shadow-sm">
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

                                <Card className="border-2 shadow-sm">
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

                            {/* Tabs */}
                            <Tabs defaultValue="details" className="space-y-6">
                                <TabsList className="grid w-full grid-cols-3 h-14 bg-muted/50 p-1">
                                    <TabsTrigger value="details" className="text-lg font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                        Organization Details
                                    </TabsTrigger>
                                    <TabsTrigger value="credentials" className="text-lg font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                        Credentials
                                    </TabsTrigger>
                                    {user && (user.role === 'admin' || user.role === 'superadmin') && (
                                        <TabsTrigger value="apiKeys" className="text-lg font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                            API Keys
                                        </TabsTrigger>
                                    )}
                                </TabsList>

                                <TabsContent value="details" className="space-y-6 outline-none">
                                    <Card className="border-2 shadow-sm">
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
                                                        onChange={(e) => handleDetailChange('name', e.target.value)}
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
                                                        onChange={(e) => handleDetailChange('sector', e.target.value)}
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
                                                        onChange={(e) => handleDetailChange('country', e.target.value)}
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
                                                            handleDetailChange('credits', Number(e.target.value) || 0)
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
                                                            handleDetailChange('emailFromName', e.target.value)
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
                                                <Button size="lg" onClick={handleSaveDetails} disabled={isSaving}>
                                                    {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                                    Save details
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="credentials" className="space-y-8 outline-none">
                                    {/* SMS Credentials */}
                                    <Card className="border-2 shadow-sm">
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
                                                            handleCredentialChange('sms_apiUrl', e.target.value)
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
                                                            handleCredentialChange('sms_apiKey', e.target.value)
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
                                                            handleCredentialChange('sms_partnerID', e.target.value)
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
                                                            handleCredentialChange('sms_shortCode', e.target.value)
                                                        }
                                                        className="h-12 text-base"
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Email Credentials */}
                                    <Card className="border-2 shadow-sm">
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
                                                            handleCredentialChange('email_host', e.target.value)
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
                                                            handleCredentialChange('email_port', e.target.value)
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
                                                            handleCredentialChange('email_user', e.target.value)
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
                                                            handleCredentialChange('email_pass', e.target.value)
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
                                                            handleCredentialChange('email_from', e.target.value)
                                                        }
                                                        className="h-12 text-base"
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <div className="flex justify-end">
                                        <Button size="lg" onClick={handleSaveCredentials} disabled={isSaving}>
                                            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                            Save credentials
                                        </Button>
                                    </div>
                                </TabsContent>

                                {user && (user.role === 'admin' || user.role === 'superadmin') && (
                                    <TabsContent value="apiKeys" className="space-y-6 outline-none">
                                        <Card className="border-2 shadow-sm">
                                            <CardHeader className="flex items-center justify-between pb-6">
                                                <div className="flex items-center gap-3">
                                                    <Key className="w-6 h-6" />
                                                    <CardTitle className="text-2xl">API Keys</CardTitle>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="text-sm text-muted-foreground mr-4">Total: {apiKeys.length}</div>
                                                    <Button size="sm" onClick={() => setShowCreateKeyDialog(true)}>
                                                        <Plus className="w-4 h-4 mr-2" /> Create key
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                {isLoadingApiKeys ? (
                                                    <div className="p-6">Loading...</div>
                                                ) : apiKeys.length === 0 ? (
                                                    <div className="p-6 text-sm text-muted-foreground">No API keys found for this organization.</div>
                                                ) : (
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-left">
                                                            <thead className="text-sm text-muted-foreground">
                                                                <tr>
                                                                    <th className="py-2">Name</th>
                                                                    <th className="py-2">Prefix</th>
                                                                    <th className="py-2">Created by</th>
                                                                    <th className="py-2">Created</th>
                                                                    <th className="py-2">Last used</th>
                                                                    <th className="py-2">Status</th>
                                                                    <th className="py-2">Actions</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {apiKeys.map((k) => (
                                                                    <tr key={k._id} className="border-t">
                                                                        <td className="py-3">{k.name}</td>
                                                                        <td className="py-3">{k.prefix}</td>
                                                                        <td className="py-3">{k.createdBy ? `${k.createdBy.firstName} ${k.createdBy.lastName}` : '—'}</td>
                                                                        <td className="py-3">{k.createdAt ? new Date(k.createdAt).toLocaleString() : '—'}</td>
                                                                        <td className="py-3">{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : '—'}</td>
                                                                        <td className="py-3">{k.isActive ? <Badge className="bg-green-100 text-green-700">Active</Badge> : <Badge className="bg-red-100 text-red-700">Revoked</Badge>}</td>
                                                                        <td className="py-3">
                                                                            <div className="flex items-center gap-2">
                                                                                {k.isActive ? (
                                                                                    <Button size="sm" variant="outline" onClick={() => handleRevoke(k._id)}>Revoke</Button>
                                                                                ) : (
                                                                                    <Button size="sm" onClick={() => handleActivate(k._id)}>Activate</Button>
                                                                                )}
                                                                                <Button size="sm" variant="destructive" onClick={() => handleDeleteKey(k._id)}>Delete</Button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>

                                        {/* Create key dialog */}
                                        <Dialog open={showCreateKeyDialog} onOpenChange={(o) => !o && setShowCreateKeyDialog(false)}>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Create API Key</DialogTitle>
                                                    <DialogDescription>Give the key a descriptive name. The plaintext key will be shown only once.</DialogDescription>
                                                </DialogHeader>
                                                <div className="py-4">
                                                    <Label className="text-sm">Name</Label>
                                                    <Input value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} className="mt-2" />
                                                </div>
                                                <DialogFooter className="flex gap-2">
                                                    <Button variant="outline" onClick={() => setShowCreateKeyDialog(false)}>Cancel</Button>
                                                    <Button onClick={handleCreateApiKey}>Create</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>

                                        {/* Show plaintext created key once */}
                                        <Dialog open={!!createdPlainKey} onOpenChange={() => setCreatedPlainKey(null)}>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>API Key Created</DialogTitle>
                                                    <DialogDescription>Copy the key now — it will not be shown again.</DialogDescription>
                                                </DialogHeader>
                                                <div className="py-4">
                                                    <Input readOnly value={createdPlainKey || ''} />
                                                    <div className="mt-3 flex gap-2 justify-end">
                                                        <Button onClick={() => { navigator.clipboard?.writeText(createdPlainKey || ''); toast.success('Copied'); }}>Copy</Button>
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button onClick={() => setCreatedPlainKey(null)}>Close</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </TabsContent>
                                )}
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
