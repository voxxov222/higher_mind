'use client'

import dynamic from 'next/dynamic'
import { ChartLoadingSkeleton } from '@/components/ui/chart-loading-skeleton'

// Dynamically import chart component to avoid loading recharts in the initial bundle
const AdminPieChartContent = dynamic(
  () => import('@/components/admin/AdminChartContent').then((mod) => mod.AdminPieChartContent),
  { ssr: false, loading: () => <ChartLoadingSkeleton height={256} variant="admin" /> },
)

interface UsersByPlanChartProps {
  data: { plan: string; count: number }[]
}

const COLORS = {
  free: '#6B7280',
  trial: '#3B82F6',
  pro: '#8B5CF6',
  lifetime: '#F59E0B',
}

export function UsersByPlanChart({ data }: UsersByPlanChartProps) {
  const chartData = data.map((item) => ({
    name: item.plan.charAt(0).toUpperCase() + item.plan.slice(1),
    value: item.count,
    color: COLORS[item.plan as keyof typeof COLORS] || '#6B7280',
  }))

  if (chartData.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Users by Plan</h3>
        <p className="text-slate-400 text-sm">No user data available</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Users by Plan</h3>
      <div className="h-64">
        <AdminPieChartContent data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} />
      </div>
    </div>
  )
}
