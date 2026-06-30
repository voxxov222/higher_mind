import { ReactNode } from 'react'
import { getAdminSession } from '@/lib/security/admin-session'
import { redirect } from 'next/navigation'
import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient'

/**
 * Protected layout for authenticated admin pages
 * Wraps dashboard, users, usage pages with sidebar and header
 */
export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  const session = await getAdminSession()

  if (!session) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <AdminLayoutClient username={session.username} role={session.role}>
        {children}
      </AdminLayoutClient>
    </div>
  )
}
