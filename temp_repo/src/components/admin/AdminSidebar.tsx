'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, BarChart3, Settings, Shield, Calculator } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils/cn'

interface AdminSidebarProps {
  role: 'admin' | 'superadmin'
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'AI Usage', href: '/admin/usage', icon: BarChart3 },
  { name: 'Calculations', href: '/admin/calculations', icon: Calculator },
]

const superadminNavigation = [{ name: 'Admin Users', href: '/admin/settings', icon: Settings }]

export function AdminSidebar({ role }: AdminSidebarProps) {
  const pathname = usePathname()

  const allNavigation = role === 'superadmin' ? [...navigation, ...superadminNavigation] : navigation

  return (
    <Sidebar collapsible="icon" className="bg-slate-800/50 border-r border-slate-700">
      <SidebarHeader className="border-b border-slate-700 p-4">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div className="transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:overflow-hidden">
            <h2 className="text-lg font-bold text-white whitespace-nowrap">Admin Panel</h2>
            <p className="text-xs text-slate-400 whitespace-nowrap">Astrologer Studio</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {allNavigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))

            return (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.name}
                  className={cn(
                    'text-slate-300 hover:bg-slate-700/50 hover:text-white',
                    isActive && 'bg-blue-600 text-white hover:bg-blue-600 hover:text-white',
                  )}
                >
                  <Link href={item.href}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarSeparator className="bg-slate-700" />

      <SidebarFooter className="p-4">
        <div className="px-4 py-2 bg-slate-900/50 rounded-lg transition-all duration-200 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:text-center">
          <p className="text-xs text-slate-400 transition-opacity duration-200 group-data-[collapsible=icon]:hidden">
            Role
          </p>
          <p className="text-sm font-medium text-white capitalize group-data-[collapsible=icon]:text-xs">
            <span className="group-data-[collapsible=icon]:hidden">{role}</span>
            <span className="hidden group-data-[collapsible=icon]:inline">{role.charAt(0).toUpperCase()}</span>
          </p>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
