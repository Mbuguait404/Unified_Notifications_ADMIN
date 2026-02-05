'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card } from '@/components/ui/card'
import {
  Users,
  UserCheck,
  UserMinus,
  Building2,
  MoreVertical,
  Pencil,
  ShieldAlert,
  KeyRound,
  Search,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  Eye,
  EyeOff,
  UserPlus,
  Plus
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { usersService, User, UserStats } from '@/services/users.service'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function UsersPage() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrg, setSelectedOrg] = useState<string>('all')

  // Modals state
  const [editUser, setEditUser] = useState<User | null>(null)
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: 'user',
    organization: '',
    password: '',
    countryCode: '+254'
  })
  const [updateLoading, setUpdateLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [usersData, statsData] = await Promise.all([
        usersService.getAllUsers(),
        usersService.getStats()
      ])
      setUsers(usersData)
      setStats(statsData)
    } catch (error: any) {
      toast.error('Failed to fetch users data')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDeactivate = async (id: string) => {
    try {
      await usersService.deactivateUser(id)
      toast.success('User deactivated successfully')
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to deactivate user')
    }
  }

  const handleReactivate = async (id: string) => {
    try {
      await usersService.reactivateUser(id)
      toast.success('User reactivated successfully')
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reactivate user')
    }
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editUser) return
    setUpdateLoading(true)
    try {
      await usersService.updateUser(editUser._id, {
        firstName: editUser.firstName,
        lastName: editUser.lastName,
        email: editUser.email,
        phoneNumber: editUser.phoneNumber,
        role: editUser.role,
      })
      toast.success('User updated successfully')
      setEditUser(null)
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update user')
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!resetPasswordUser || !newPassword) return
    setUpdateLoading(true)
    try {
      await usersService.resetPassword(resetPasswordUser._id, newPassword)
      toast.success('Password reset successfully')
      setResetPasswordUser(null)
      setNewPassword('')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password')
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdateLoading(true)
    try {
      await usersService.createUser(newUser)
      toast.success('User created successfully')
      setIsCreateModalOpen(false)
      setNewUser({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        role: 'user',
        organization: '',
        password: '',
        countryCode: '+254'
      })
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create user')
    } finally {
      setUpdateLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.firstName + ' ' + user.lastName + ' ' + user.email).toLowerCase().includes(searchTerm.toLowerCase())
    const matchesOrg = selectedOrg === 'all' || user.organization?._id === selectedOrg
    return matchesSearch && matchesOrg
  })

  // Group users by organization for "split" view if needed, but here we use a filter
  const organizations = stats?.usersByOrg || []

  return (
    <AppLayout>
      <div className="p-8 space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Users Management</h1>
            <p className="text-muted-foreground mt-1">Manage users across all organizations and monitor usage.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => setIsCreateModalOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Create User
            </Button>
            <Button onClick={fetchData} variant="outline" size="icon" className="shadow-sm">
              <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 transition-all hover:shadow-md border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <h3 className="text-2xl font-bold">{stats?.totalUsers || 0}</h3>
              </div>
            </div>
          </Card>
          <Card className="p-6 transition-all hover:shadow-md border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-2xl">
                <UserCheck className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <h3 className="text-2xl font-bold">{stats?.activeUsers || 0}</h3>
              </div>
            </div>
          </Card>
          <Card className="p-6 transition-all hover:shadow-md border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/10 rounded-2xl">
                <UserMinus className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inactive Users</p>
                <h3 className="text-2xl font-bold">{stats?.inactiveUsers || 0}</h3>
              </div>
            </div>
          </Card>
          <Card className="p-6 transition-all hover:shadow-md border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-2xl">
                <Building2 className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Organizations</p>
                <h3 className="text-2xl font-bold">{organizations.length}</h3>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters & Table */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
          <div className="p-6 border-b border-border/50 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Organizations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Organizations</SelectItem>
                    {organizations.map(org => (
                      <SelectItem key={org._id} value={org._id}>{org.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[250px]">Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><div className="h-4 w-32 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 w-48 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 w-32 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 w-16 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell className="text-right"><div className="h-8 w-8 ml-auto bg-muted animate-pulse rounded" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Users className="h-12 w-12 mb-4 opacity-20" />
                        <p className="text-lg font-medium">No users found</p>
                        <p className="text-sm">Try adjusting your filters or search term.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user._id} className="group transition-colors hover:bg-muted/30">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold uppercase">
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                          <div>
                            {user.firstName} {user.lastName}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal border-border bg-background">
                          {user.organization?.name || 'No Organization'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "capitalize font-medium px-2 py-0.5",
                            user.role === 'superadmin' ? "bg-purple-500/10 text-purple-600 border-purple-200" :
                              user.role === 'admin' ? "bg-blue-500/10 text-blue-600 border-blue-200" :
                                "bg-gray-500/10 text-gray-600 border-gray-200"
                          )}
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.isActive ? (
                          <div className="flex items-center gap-1.5 text-green-600 font-medium text-sm">
                            <CheckCircle2 className="h-4 w-4" />
                            Active
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-red-600 font-medium text-sm">
                            <XCircle className="h-4 w-4" />
                            Inactive
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setEditUser(user)}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setResetPasswordUser(user)}>
                              <KeyRound className="mr-2 h-4 w-4" /> Change Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.isActive ? (
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => handleDeactivate(user._id)}
                              >
                                <ShieldAlert className="mr-2 h-4 w-4" /> Deactivate User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="text-green-600 focus:text-green-600"
                                onClick={() => handleReactivate(user._id)}
                              >
                                <UserCheck className="mr-2 h-4 w-4" /> Reactivate User
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Edit User Modal */}
        <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User Details</DialogTitle>
              <DialogDescription>Update info for {editUser?.firstName} {editUser?.lastName}.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateUser} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={editUser?.firstName || ''}
                    onChange={e => setEditUser(prev => prev ? { ...prev, firstName: e.target.value } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={editUser?.lastName || ''}
                    onChange={e => setEditUser(prev => prev ? { ...prev, lastName: e.target.value } : null)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editUser?.email || ''}
                  onChange={e => setEditUser(prev => prev ? { ...prev, email: e.target.value } : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={editUser?.phoneNumber || ''}
                  onChange={e => setEditUser(prev => prev ? { ...prev, phoneNumber: e.target.value } : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={editUser?.role || 'user'}
                  onChange={e => setEditUser(prev => prev ? { ...prev, role: e.target.value as any } : null)}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
                <Button type="submit" disabled={updateLoading}>
                  {updateLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Change Password Modal */}
        <Dialog open={!!resetPasswordUser} onOpenChange={(open) => {
          if (!open) {
            setResetPasswordUser(null)
            setShowPassword(false)
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>Enter a new password for {resetPasswordUser?.email}.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 8 characters"
                    className="pr-10"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setResetPasswordUser(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleResetPassword} disabled={updateLoading || newPassword.length < 8}>
                {updateLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create User Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Create New User
              </DialogTitle>
              <DialogDescription>Add a new user to the system and assign them to an organization.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-firstName">First Name</Label>
                  <Input
                    id="create-firstName"
                    placeholder="John"
                    required
                    value={newUser.firstName}
                    onChange={e => setNewUser(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-lastName">Last Name</Label>
                  <Input
                    id="create-lastName"
                    placeholder="Doe"
                    required
                    value={newUser.lastName}
                    onChange={e => setNewUser(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-email">Email Address</Label>
                  <Input
                    id="create-email"
                    type="email"
                    placeholder="john@example.com"
                    required
                    value={newUser.email}
                    onChange={e => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-phone">Phone Number</Label>
                  <Input
                    id="create-phone"
                    placeholder="+254700000000"
                    value={newUser.phoneNumber}
                    onChange={e => setNewUser(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-org">Organization</Label>
                  <Select
                    value={newUser.organization}
                    onValueChange={val => setNewUser(prev => ({ ...prev, organization: val }))}
                  >
                    <SelectTrigger id="create-org">
                      <SelectValue placeholder="Select Organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map(org => (
                        <SelectItem key={org._id} value={org._id}>{org.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-role">System Role</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={val => setNewUser(prev => ({ ...prev, role: val as any }))}
                  >
                    <SelectTrigger id="create-role">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="superadmin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-password">Initial Password</Label>
                <div className="relative">
                  <Input
                    id="create-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 8 characters"
                    required
                    minLength={8}
                    value={newUser.password}
                    onChange={e => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground italic">Users can change their password after their first login.</p>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={updateLoading} className="px-8">
                  {updateLoading ? 'Creating...' : 'Create User'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}

