'use client'

import { ReactNode } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Shield } from 'lucide-react'

interface AdminLayoutClientProps {
  children: ReactNode
  username: string
  role: 'admin' | 'superadmin'
}

export function AdminLayoutClient({ children, username, role }: AdminLayoutClientProps) {
  return (
    <SidebarProvider>
      <AdminSidebar role={role} />
      <SidebarInset className="bg-slate-900">
        {/* Mobile header - only visible on small screens */}
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-slate-700 bg-slate-800/95 backdrop-blur px-4 lg:hidden">
          <SidebarTrigger className="text-slate-300 hover:text-white hover:bg-slate-700/50" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-white">Admin Panel</span>
          </div>
        </header>

        {/* Desktop header - hidden on mobile */}
        <div className="hidden lg:block">
          <AdminHeader username={username} role={role} />
        </div>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
