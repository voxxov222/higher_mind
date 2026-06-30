import { getAdminSession } from '@/lib/security/admin-session'
import { redirect } from 'next/navigation'
import { CalculationsPageContent } from '@/components/admin/CalculationsPageContent'

/**
 * Admin Chart Calculations Page
 * Detailed analytics for chart calculation usage
 */
export default async function AdminCalculationsPage() {
  const session = await getAdminSession()

  if (!session) {
    redirect('/admin/login')
  }

  return <CalculationsPageContent isSuperAdmin={session.role === 'superadmin'} />
}

export const metadata = {
  title: 'Chart Calculations | Admin',
}
