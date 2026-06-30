'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts'

interface AdminBarChartContentProps {
  data: { name: string; count: number; type?: string }[]
  layout?: 'vertical' | 'horizontal'
  xAxisType?: 'number' | 'category'
  yAxisType?: 'number' | 'category'
  yAxisWidth?: number
  tooltipFormatter?: (value: number) => [string, string]
  barFill?: string
  barName?: string
  xAxisAngle?: number
  xAxisTextAnchor?: 'start' | 'middle' | 'end' | 'inherit'
  xAxisHeight?: number
  margin?: { left?: number; top?: number; right?: number; bottom?: number }
}

interface AdminPieChartContentProps {
  data: { name: string; value: number; color?: string }[]
  innerRadius?: number
  outerRadius?: number
  paddingAngle?: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  labelFormatter?: (props: any) => string
}

interface AdminAreaChartContentProps {
  data: { period?: string; count?: number; date?: string; displayDate?: string }[]
  dataKeyX: string
  dataKeyY: string
  tooltipFormatter?: (value: number) => [string, string]
  strokeColor?: string
  fillColor?: string
  gradientId?: string
}

interface AdminMultiBarChartContentProps {
  data: { name: string; today?: number; week?: number; month?: number; total?: number }[]
  xAxisAngle?: number
  xAxisTextAnchor?: 'start' | 'middle' | 'end' | 'inherit'
  xAxisHeight?: number
  bars: { dataKey: string; name: string; fill: string }[]
}

const TOOLTIP_STYLE = {
  backgroundColor: '#1e293b',
  border: '1px solid #475569',
  borderRadius: '8px',
}

/**
 * Admin bar chart component for dynamically loaded recharts.
 */
export function AdminBarChartContent({
  data,
  layout = 'horizontal',
  xAxisType = 'category',
  yAxisType = 'number',
  yAxisWidth = 100,
  tooltipFormatter,
  barFill = '#8b5cf6',
  barName,
  xAxisAngle,
  xAxisTextAnchor,
  xAxisHeight,
  margin,
}: AdminBarChartContentProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout={layout} margin={margin}>
        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
        <XAxis
          type={xAxisType}
          dataKey={layout === 'vertical' ? undefined : 'name'}
          stroke="#94a3b8"
          angle={xAxisAngle}
          textAnchor={xAxisTextAnchor}
          height={xAxisHeight}
          tick={{ fontSize: xAxisAngle ? 10 : 12 }}
        />
        <YAxis
          type={yAxisType}
          dataKey={layout === 'vertical' ? 'name' : undefined}
          stroke="#94a3b8"
          width={layout === 'vertical' ? yAxisWidth : undefined}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={tooltipFormatter ? (value: number) => tooltipFormatter(value) : undefined}
        />
        <Bar dataKey="count" fill={barFill} name={barName} radius={layout === 'vertical' ? [0, 4, 4, 0] : undefined} />
      </BarChart>
    </ResponsiveContainer>
  )
}

/**
 * Admin pie chart component for dynamically loaded recharts.
 */
export function AdminPieChartContent({
  data,
  innerRadius = 0,
  outerRadius = 80,
  paddingAngle = 0,
  labelFormatter,
}: AdminPieChartContentProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={paddingAngle}
          label={labelFormatter}
          labelLine={labelFormatter ? false : undefined}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || '#6B7280'} />
          ))}
        </Pie>
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number) => [value.toLocaleString(), 'Calculations']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

/**
 * Admin area chart component for dynamically loaded recharts.
 */
export function AdminAreaChartContent({
  data,
  dataKeyX,
  dataKeyY,
  tooltipFormatter,
  strokeColor = '#06b6d4',
  fillColor = '#06b6d4',
  gradientId,
}: AdminAreaChartContentProps) {
  const useGradient = !!gradientId

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        {useGradient && (
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={fillColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={fillColor} stopOpacity={0} />
            </linearGradient>
          </defs>
        )}
        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
        <XAxis dataKey={dataKeyX} stroke="#94a3b8" tick={{ fontSize: 12 }} />
        <YAxis stroke="#94a3b8" />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={tooltipFormatter ? (value: number) => tooltipFormatter(value) : undefined}
        />
        <Area
          type="monotone"
          dataKey={dataKeyY}
          stroke={strokeColor}
          fill={useGradient ? `url(#${gradientId})` : fillColor}
          fillOpacity={useGradient ? 1 : 0.3}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

/**
 * Admin multi-bar chart component for dynamically loaded recharts.
 */
export function AdminMultiBarChartContent({
  data,
  xAxisAngle = -45,
  xAxisTextAnchor = 'end',
  xAxisHeight = 60,
  bars,
}: AdminMultiBarChartContentProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
        <XAxis
          dataKey="name"
          stroke="#94a3b8"
          tick={{ fontSize: 10 }}
          angle={xAxisAngle}
          textAnchor={xAxisTextAnchor}
          height={xAxisHeight}
        />
        <YAxis stroke="#94a3b8" />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend />
        {bars.map((bar) => (
          <Bar key={bar.dataKey} dataKey={bar.dataKey} name={bar.name} fill={bar.fill} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
