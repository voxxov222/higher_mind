'use client'

import dynamic from 'next/dynamic'
import { ChartLoadingSkeleton } from '@/components/ui/chart-loading-skeleton'

// Dynamically import chart component to avoid loading recharts in the initial bundle
const AdminAreaChartContent = dynamic(
  () => import('@/components/admin/AdminChartContent').then((mod) => mod.AdminAreaChartContent),
  { ssr: false, loading: () => <ChartLoadingSkeleton height={288} variant="admin" /> },
)

interface AIUsageChartProps {
  data: { date: string; count: number }[]
}

export function AIUsageChart({ data }: AIUsageChartProps) {
  const chartData = data.map((item) => ({
    date: item.date,
    displayDate: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count: item.count,
  }))

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Daily AI Generations (Last 30 Days)</h3>
      {chartData.length === 0 ? (
        <p className="text-slate-400 text-sm">No usage data available</p>
      ) : (
        <div className="h-72">
          <AdminAreaChartContent
            data={chartData}
            dataKeyX="displayDate"
            dataKeyY="count"
            tooltipFormatter={(value) => [value.toString(), 'Generations']}
            strokeColor="#8B5CF6"
            fillColor="#8B5CF6"
            gradientId="colorCount"
          />
        </div>
      )}
    </div>
  )
}
