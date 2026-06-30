import { getAdminSession } from '@/lib/security/admin-session'
import { redirect } from 'next/navigation'
import { AdminUsersManager } from '@/components/admin/AdminUsersManager'

/**
 * Admin Settings Page (superadmin only)
 * Manage admin users
 */
export default async function AdminSettingsPage() {
  const session = await getAdminSession()

  if (!session) {
    redirect('/admin/login')
  }

  // Only superadmins can access this page
  if (session.role !== 'superadmin') {
    redirect('/admin')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Admin Users</h1>
        <p className="text-slate-400">Manage administrator accounts (superadmin only)</p>
      </div>
      <AdminUsersManager />
    </div>
  )
}

export const metadata = {
  title: 'Settings | Admin',
}
