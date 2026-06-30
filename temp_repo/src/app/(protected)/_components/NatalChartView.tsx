'use client'

import { ChartErrorState } from '@/components/ChartErrorState'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getNatalChart } from '@/actions/astrology'
import { NatalChart } from '@/components/charts/NatalChart'
import { Skeleton } from '@/components/ui/skeleton'
import { DateTimeLocationSelector } from '@/components/ui/DateTimeLocationSelector'
import type { LocationFormValues } from '@/components/SubjectLocationFields'
import { Tabs } from '@/components/ui/tabs'
import { ChartTabsList } from '@/components/charts/ChartTabs'
import { isAIGloballyEnabled } from '@/lib/ai/feature-flags'
import { useChartPreferences } from '@/hooks/useChartPreferences'
import { formatDisplayDate, formatDisplayTime } from '@/lib/utils/date'
import { ExportPDFDialog } from '@/components/pdf'
import { useChartSubject } from '@/hooks/useChartSubject'
import { useChartTheme } from '@/hooks/useChartTheme'
import { ChartViewWrapper } from '@/components/charts/ChartViewWrapper'

interface Props {
  subjectId: string
}

export function NatalChartView({ subjectId }: Props) {
  const chartTheme = useChartTheme()
  const [override, setOverride] = useState<{ dateTime: string; location: LocationFormValues } | null>(null)
  const { dateFormat, timeFormat } = useChartPreferences()

  const { data: subject, isLoading: isLoadingSubject, error: subjectError } = useChartSubject(subjectId)

  const {
    data: chartData,
    isLoading: isLoadingChart,
    isFetching: isFetchingChart,
    error: chartError,
    refetch: refetchChart,
  } = useQuery({
    queryKey: ['natal-chart', subjectId, chartTheme, override],
    queryFn: () => {
      if (!subject) throw new Error('Subject not found')
      const effectiveSubject = override
        ? {
            ...subject,
            birth_datetime: override.dateTime,
            ...override.location,
          }
        : subject
      return getNatalChart(effectiveSubject, { theme: chartTheme })
    },
    enabled: !!subject,
    placeholderData: (previousData) => previousData,
  })

  return (
    <ChartViewWrapper isLoading={isLoadingSubject} error={subjectError} hasSubject={!!subject}>
      {subject && (
        <Tabs defaultValue="chart" className="space-y-3 p-0 md:p-2 w-full">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{subject.name}&apos;s Natal Chart</h1>
                <p className="text-muted-foreground">
                  {formatDisplayDate(override ? override.dateTime : subject.birth_datetime, dateFormat)}{' '}
                  {formatDisplayTime(override ? override.dateTime : subject.birth_datetime, timeFormat)} •{' '}
                  {override ? override.location.city : subject.city},{' '}
                  {override ? override.location.nation : subject.nation}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ChartTabsList hasData={true} hasInterpretation={isAIGloballyEnabled()} />
              <div className="flex items-center gap-2 ml-auto">
                {chartData && (
                  <ExportPDFDialog
                    chartData={chartData.chart_data}
                    aspects={chartData.chart_data.aspects}
                    chartWheelHtml={chartData.chart_wheel}
                    size="icon"
                  />
                )}
              </div>
            </div>
          </div>

          <DateTimeLocationSelector
            defaultDateTime={subject.birth_datetime}
            defaultLocation={{
              city: subject.city,
              nation: subject.nation,
              latitude: subject.latitude,
              longitude: subject.longitude,
              timezone: subject.timezone,
            }}
            onCalculate={setOverride}
            submitLabel="Recalculate Chart"
            showNowButton={false}
          />

          {isLoadingChart ? (
            <div className="space-y-4">
              <Skeleton className="h-[600px] w-full" />
            </div>
          ) : chartError ? (
            <ChartErrorState error={chartError} onRetry={() => refetchChart()} />
          ) : chartData ? (
            <div className={isFetchingChart ? 'opacity-50 transition-opacity duration-200' : ''}>
              <NatalChart data={chartData} subjectId={subjectId} subject={subject} />
            </div>
          ) : null}
        </Tabs>
      )}
    </ChartViewWrapper>
  )
}
