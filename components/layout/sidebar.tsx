'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Building2,
  Users,
  Mail,
  DollarSign,
  Tag,
  BarChart3,
  FileText,
  Settings,
  Bell,
  Headset,
  LogOut,
  ScrollText,
  ChevronDown,
  ChevronRight,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type NavItem = {
  label: string
  href: string
  icon: any
}

type NavGroup = {
  title: string
  items: NavItem[]
}

const navigationGroups: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/', icon: LayoutDashboard },
      { label: 'Organizations', href: '/organizations', icon: Building2 },
      { label: 'Users', href: '/users', icon: Users },
      { label: 'Messages', href: '/messages', icon: Mail },
    ],
  },
  {
    title: 'Finance',
    items: [
      { label: 'Billing', href: '/billing', icon: DollarSign },
      { label: 'Pricing Plans', href: '/pricing', icon: Tag },
    ],
  },
  {
    title: 'Monitoring & Logs',
    items: [
      { label: 'Analytics', href: '/analytics', icon: BarChart3 },
      { label: 'Reports', href: '/reports', icon: FileText },
      { label: 'System Logs', href: '/logs', icon: ScrollText },
    ],
  },
]

const supportNavigation: NavItem[] = [
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Alerts', href: '/alerts', icon: Bell },
  { label: 'Support', href: '/support', icon: Headset },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<{ firstName: string; lastName: string; email: string } | null>(null)
  
  // Sidebar collapsed state
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  // Group expanded state - defaults to all open
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    navigationGroups.map((g) => g.title)
  )

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (e) {
        console.error('Failed to parse user data', e)
      }
    }
  }, [])

  const handleLogout = () => {
    // Clear cookies
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'

    // Clear local storage
    localStorage.removeItem('user')

    // Redirect to login
    router.push('/login')
    router.refresh()
  }

  const toggleGroup = (title: string) => {
    if (isCollapsed) {
      setIsCollapsed(false)
      if (!expandedGroups.includes(title)) {
        setExpandedGroups((prev) => [...prev, title])
      }
      return
    }
    setExpandedGroups((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    )
  }

  const userInitials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'U'

  return (
    <aside
      className={cn(
        "border-r border-border bg-sidebar text-sidebar-foreground flex flex-col h-screen sticky top-0 transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header and Toggle */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between min-h-[73px]">
        {!isCollapsed && (
          <Link href="/" className="flex items-center gap-2 overflow-hidden">
            <Image src="/logo/uniflow-logo.png" alt="Uniflow" width={110} height={28} className="object-contain" />
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors mx-auto"
          aria-label="Toggle Sidebar"
        >
          {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Navigation - Hide scrollbar */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {navigationGroups.map((group) => {
          const isExpanded = expandedGroups.includes(group.title)

          return (
            <div key={group.title} className="space-y-1">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.title)}
                className={cn(
                  "w-full flex items-center text-xs font-semibold text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors uppercase tracking-wider mb-2",
                  isCollapsed ? "justify-center" : "justify-between px-3"
                )}
              >
                {!isCollapsed && <span>{group.title}</span>}
                {!isCollapsed && (
                  isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )
                )}
              </button>

              {/* Group Items */}
              {(!isCollapsed ? isExpanded : true) && (
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={isCollapsed ? item.label : undefined}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium',
                          isCollapsed ? 'justify-center' : '',
                          isActive
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                        )}
                      >
                        <Icon className={cn("flex-shrink-0", isActive ? "w-5 h-5" : "w-[18px] h-[18px]")} />
                        {!isCollapsed && <span>{item.label}</span>}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {/* Divider */}
        <div className="my-4 h-px bg-sidebar-border" />

        {/* Support Navigation */}
        <div className="space-y-1">
          {supportNavigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium',
                  isCollapsed ? 'justify-center' : '',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )}
              >
                <Icon className={cn("flex-shrink-0", isActive ? "w-5 h-5" : "w-[18px] h-[18px]")} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* User Profile */}
      <div className={cn("p-3 border-t border-sidebar-border", isCollapsed ? 'flex flex-col items-center gap-2' : 'space-y-2')}>
        {!isCollapsed ? (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-sidebar-accent/50 border border-sidebar-border">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 shadow-sm border border-primary/10">
              <span className="text-xs font-semibold text-primary">{userInitials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-sidebar-foreground">
                {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {user ? user.email : 'guest@example.com'}
              </p>
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 mx-auto rounded-full bg-primary/20 flex items-center justify-center shadow-sm border border-primary/10" title={user ? `${user.firstName} ${user.lastName}` : 'Guest User'}>
            <span className="text-xs font-semibold text-primary">{userInitials}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          title={isCollapsed ? "Logout" : undefined}
          className={cn(
            "flex items-center gap-3 py-2 rounded-lg transition-colors text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 font-medium",
            isCollapsed ? "justify-center w-full px-0" : "w-full px-3"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
