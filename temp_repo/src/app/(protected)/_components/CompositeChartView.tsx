'use client'

import { ChartErrorState } from '@/components/ChartErrorState'
import { useQuery } from '@tanstack/react-query'
import { getCompositeChart } from '@/actions/astrology'
import { CompositeChart } from '@/components/charts/CompositeChart'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs } from '@/components/ui/tabs'
import { ChartTabsList } from '@/components/charts/ChartTabs'
import { isAIGloballyEnabled } from '@/lib/ai/feature-flags'
import { SaveChartButton } from '@/components/SaveChartButton'
import { ExportCompositePDFDialog } from '@/components/pdf'
import { useChartSubject } from '@/hooks/useChartSubject'
import { useChartTheme } from '@/hooks/useChartTheme'
import { ChartViewWrapper } from '@/components/charts/ChartViewWrapper'

interface Props {
  subjectId: string
  partnerId: string
}

export function CompositeChartView({ subjectId, partnerId }: Props) {
  const chartTheme = useChartTheme()

  const { data: subject1, isLoading: isLoadingS1 } = useChartSubject(subjectId)
  const { data: subject2, isLoading: isLoadingS2 } = useChartSubject(partnerId)

  const {
    data: chartData,
    isLoading: isLoadingChart,
    isFetching: isFetchingChart,
    error: chartError,
    refetch: refetchChart,
  } = useQuery({
    queryKey: ['composite-chart', subjectId, partnerId, chartTheme],
    queryFn: () => {
      if (!subject1 || !subject2) throw new Error('Subjects not found')
      return getCompositeChart(subject1, subject2, { theme: chartTheme })
    },
    enabled: !!subject1 && !!subject2,
    placeholderData: (previousData) => previousData,
  })

  return (
    <ChartViewWrapper
      isLoading={isLoadingS1 || isLoadingS2}
      hasSubject={!!subject1 && !!subject2}
      errorMessage="Subject(s) not found"
    >
      {subject1 && subject2 && (
        <Tabs defaultValue="chart" className="space-y-6 p-0 md:p-2 w-full">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Composite Chart</h1>
                <p className="text-muted-foreground">
                  {subject1.name} &amp; {subject2.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ChartTabsList hasData={true} hasInterpretation={isAIGloballyEnabled()} />
              <div className="flex items-center gap-2 ml-auto">
                {chartData && (
                  <SaveChartButton
                    chartParams={{
                      type: 'composite',
                      subject1Id: subjectId,
                      subject2Id: partnerId,
                    }}
                    chartType="composite"
                    defaultName={`${subject1.name} / ${subject2.name} - Composite Chart`}
                  />
                )}
                {chartData && (
                  <ExportCompositePDFDialog
                    chartData={chartData.chart_data}
                    aspects={chartData.chart_data.aspects}
                    chartWheelHtml={chartData.chart_wheel}
                    size="icon"
                  />
                )}
              </div>
            </div>
          </div>

          {isLoadingChart && !chartData ? (
            <div className="space-y-4">
              <Skeleton className="h-[600px] w-full" />
            </div>
          ) : chartError ? (
            <ChartErrorState error={chartError} onRetry={() => refetchChart()} />
          ) : chartData ? (
            <div className={isFetchingChart ? 'opacity-50 transition-opacity duration-200' : ''}>
              <CompositeChart data={chartData} />
            </div>
          ) : null}
        </Tabs>
      )}
    </ChartViewWrapper>
  )
}
