'use client'

import { ChartErrorState } from '@/components/ChartErrorState'
import { useState, useEffect, useMemo } from 'react'
import { usePlanetaryReturnChart } from '@/hooks/usePlanetaryReturnChart'
import { SolarReturnNavigator } from '@/components/ui/SolarReturnNavigator'
import { LunarReturnNavigator } from '@/components/ui/LunarReturnNavigator'
import { NatalChart } from '@/components/charts/NatalChart'
import { SynastryChart } from '@/components/charts/SynastryChart'
import { Tabs } from '@/components/ui/tabs'
import { ChartTabsList } from '@/components/charts/ChartTabs'
import { isAIGloballyEnabled } from '@/lib/ai/feature-flags'
import { Skeleton } from '@/components/ui/skeleton'
import type { SolarReturnInput, LunarReturnInput } from '@/lib/validation/planetary-return'
import type { PlanetaryReturnRequestOptions } from '@/types/astrology'
import { SaveChartButton } from '@/components/SaveChartButton'
import { ExportSolarReturnPDFDialog } from '@/components/pdf/ExportSolarReturnPDFDialog'
import { ExportLunarReturnPDFDialog } from '@/components/pdf/ExportLunarReturnPDFDialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useChartPreferences } from '@/hooks/useChartPreferences'
import { formatDisplayDate, formatDisplayTime } from '@/lib/utils/date'
import { useChartSubject } from '@/hooks/useChartSubject'
import { useChartTheme } from '@/hooks/useChartTheme'
import { ChartViewWrapper } from '@/components/charts/ChartViewWrapper'
import { getSubChartData } from '@/lib/chart/helpers'

type ReturnType = 'solar' | 'lunar'
type FormData = SolarReturnInput | LunarReturnInput

interface Props {
  subjectId: string
  returnType: ReturnType
}

export function PlanetaryReturnView({ subjectId, returnType }: Props) {
  const isSolar = returnType === 'solar'
  const chartTheme = useChartTheme()
  const [formData, setFormData] = useState<FormData | null>(null)
  const [notes, setNotes] = useState('')
  const [wheelType, setWheelType] = useState<'single' | 'dual'>('dual')
  const [notesGeneratedForKey, setNotesGeneratedForKey] = useState<string | null>(null)
  const { dateFormat, timeFormat } = useChartPreferences()

  const { data: subject, isLoading: isLoadingSubject, error: subjectError } = useChartSubject(subjectId)

  const chartOptions = formData ? { ...formData, theme: chartTheme } : undefined

  const {
    data: chartData,
    isLoading: isLoadingChart,
    error: chartError,
    refetch,
  } = usePlanetaryReturnChart(returnType, subject, chartOptions)

  // Calculate default values
  const defaultValues = useMemo(() => {
    if (!subject) return null

    const returnLocation = {
      city: subject.city || '',
      nation: subject.nation || '',
      latitude: subject.latitude || 0,
      longitude: subject.longitude || 0,
      timezone: subject.timezone || 'UTC',
    }

    if (isSolar) {
      const now = new Date()
      const birthDate = new Date(subject.birth_datetime)
      const birthMonth = birthDate.getMonth()
      const birthDay = birthDate.getDate()
      const birthdayThisYear = new Date(now.getFullYear(), birthMonth, birthDay)
      const nextYear = now >= birthdayThisYear ? now.getFullYear() + 1 : now.getFullYear()

      return {
        year: nextYear,
        wheel_type: 'dual' as const,
        return_location: returnLocation,
      } satisfies SolarReturnInput
    }

    return {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      wheel_type: 'dual' as const,
      return_location: returnLocation,
    } satisfies LunarReturnInput
  }, [subject, isSolar])

  // Auto-calculate on load
  useEffect(() => {
    if (subject && defaultValues && !formData) {
      setFormData(defaultValues)
    }
  }, [subject, defaultValues, formData])

  const handleSubmit = (data: FormData, options?: Partial<PlanetaryReturnRequestOptions>) => {
    if (options?.iso_datetime) {
      setFormData({ ...data, iso_datetime: options.iso_datetime } as FormData & { iso_datetime?: string })
    } else {
      setFormData(data)
    }
  }

  // Get current chart datetime for staleness comparison
  const currentChartDatetime =
    chartData?.chart_data.second_subject?.iso_formatted_utc_datetime ||
    chartData?.chart_data.subject?.iso_formatted_utc_datetime ||
    null

  // Staleness key: solar uses year, lunar uses datetime
  const currentStalenessKey = isSolar
    ? ((formData as SolarReturnInput | null)?.year?.toString() ?? null)
    : currentChartDatetime

  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes)
    if (newNotes && currentStalenessKey) {
      setNotesGeneratedForKey(currentStalenessKey)
    } else if (!newNotes) {
      setNotesGeneratedForKey(null)
    }
  }

  // Normalize datetime to minute precision for lunar comparison
  const normalizeToMinute = (dateStr: string | null) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}`
  }

  const isDataStale = isSolar
    ? Boolean(
        notes && notesGeneratedForKey !== null && currentStalenessKey && notesGeneratedForKey !== currentStalenessKey,
      )
    : Boolean(
        notes &&
        notesGeneratedForKey !== null &&
        currentChartDatetime &&
        normalizeToMinute(notesGeneratedForKey) !== normalizeToMinute(currentChartDatetime),
      )

  const handleWheelTypeChange = (value: 'single' | 'dual') => {
    setWheelType(value)
    if (formData) {
      setFormData({ ...formData, wheel_type: value })
    }
  }

  const returnLabel = isSolar ? 'Solar' : 'Lunar'
  const chartTypeOverride = isSolar ? 'solar-return' : 'lunar-return'
  const chartTypeParam = isSolar ? 'solar-return' : 'lunar-return'

  const staleDataLabel = (() => {
    if (!notesGeneratedForKey) return undefined
    if (isSolar) return `Return for ${notesGeneratedForKey}`
    return `Return for ${formatDisplayDate(notesGeneratedForKey, dateFormat)}`
  })()

  const saveChartName = (() => {
    if (!subject || !formData) return ''
    if (isSolar) {
      return `${subject.name} - Solar Return ${formData.year}`
    }
    const lunarData = formData as LunarReturnInput
    const monthName = new Date(lunarData.year, lunarData.month - 1).toLocaleString('en-US', { month: 'long' })
    return `${subject.name} - Lunar Return ${monthName} ${lunarData.year}`
  })()

  const saveChartParams = (() => {
    if (!chartData || !formData) return null
    if (isSolar) {
      return {
        type: 'solar-return' as const,
        subjectId,
        year: formData.year,
        wheelType: formData.wheel_type || 'dual',
        returnLocation: formData.return_location,
      }
    }
    return {
      type: 'lunar-return' as const,
      subjectId,
      returnDatetime:
        chartData.chart_data.second_subject?.iso_formatted_utc_datetime ||
        chartData.chart_data.subject?.iso_formatted_utc_datetime ||
        '',
      wheelType: formData.wheel_type || 'dual',
      returnLocation: formData.return_location,
    }
  })()

  return (
    <ChartViewWrapper
      isLoading={isLoadingSubject}
      error={subjectError}
      hasSubject={!!subject && (isSolar ? !!defaultValues : true)}
    >
      {subject && (isSolar ? defaultValues : true) && (
        <Tabs defaultValue="chart" className="space-y-6 p-0 md:p-2 w-full">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {returnLabel} Return for {subject.name}
                </h1>
                <p className="text-muted-foreground">
                  {(() => {
                    const returnDatetime =
                      chartData?.chart_data.second_subject?.iso_formatted_utc_datetime ||
                      chartData?.chart_data.subject?.iso_formatted_utc_datetime
                    if (returnDatetime) {
                      const time = formatDisplayTime(returnDatetime, timeFormat)
                      return `${formatDisplayDate(returnDatetime, dateFormat)} ${time} • ${formData?.return_location?.city}, ${formData?.return_location?.nation}`
                    }
                    return formData ? 'Calculating...' : `Calculate ${returnLabel} Return Chart`
                  })()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {chartData && <ChartTabsList hasData={true} hasInterpretation={isAIGloballyEnabled()} />}
              <div className="flex items-center gap-2 ml-auto">
                <div className="md:hidden">
                  <Select value={wheelType} onValueChange={handleWheelTypeChange}>
                    <SelectTrigger className="w-[70px] sm:w-[140px] h-9">
                      <span className="sm:hidden">{wheelType === 'dual' ? '2W' : '1W'}</span>
                      <span className="hidden sm:inline">
                        <SelectValue />
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dual">Dual Wheel</SelectItem>
                      <SelectItem value="single">Single Wheel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {chartData && formData && saveChartParams && (
                  <SaveChartButton
                    chartParams={saveChartParams}
                    chartType={chartTypeParam}
                    defaultName={saveChartName}
                    notes={notes}
                  />
                )}
                {chartData && isSolar && (
                  <ExportSolarReturnPDFDialog
                    chartData={chartData.chart_data}
                    aspects={chartData.chart_data.aspects}
                    chartWheelHtml={chartData.chart_wheel}
                    notes={notes}
                    isDualWheel={formData?.wheel_type === 'dual'}
                    dateFormat={dateFormat}
                    timeFormat={timeFormat}
                    size="icon"
                  />
                )}
                {chartData && !isSolar && (
                  <ExportLunarReturnPDFDialog
                    chartData={chartData.chart_data}
                    aspects={chartData.chart_data.aspects}
                    chartWheelHtml={chartData.chart_wheel}
                    notes={notes}
                    isDualWheel={formData?.wheel_type === 'dual'}
                    dateFormat={dateFormat}
                    timeFormat={timeFormat}
                    size="icon"
                  />
                )}
              </div>
            </div>
          </div>

          {isSolar ? (
            <SolarReturnNavigator
              defaultValues={(formData || defaultValues!) as SolarReturnInput}
              onCalculate={handleSubmit}
              isLoading={isLoadingChart}
              wheelType={wheelType}
              onWheelTypeChange={handleWheelTypeChange}
              currentReturnDatetime={
                chartData?.chart_data.second_subject?.iso_formatted_utc_datetime ||
                chartData?.chart_data.subject?.iso_formatted_utc_datetime
              }
            />
          ) : (
            <LunarReturnNavigator
              defaultValues={(formData || defaultValues!) as LunarReturnInput}
              onCalculate={handleSubmit}
              isLoading={isLoadingChart}
              wheelType={wheelType}
              onWheelTypeChange={handleWheelTypeChange}
              currentReturnDatetime={
                chartData?.chart_data.second_subject?.iso_formatted_utc_datetime ||
                chartData?.chart_data.subject?.iso_formatted_utc_datetime
              }
            />
          )}

          {isLoadingChart && !chartData && (
            <div className="space-y-4">
              <Skeleton className="h-[600px] w-full" />
            </div>
          )}

          {chartError && <ChartErrorState error={chartError} onRetry={() => refetch()} />}

          {chartData && (
            <div className="space-y-6">
              <div className={isLoadingChart ? 'opacity-50 transition-opacity duration-200' : ''}>
                {formData?.wheel_type === 'single' ? (
                  <NatalChart
                    data={chartData}
                    subjectId={subjectId}
                    notes={notes}
                    onNotesChange={handleNotesChange}
                    chartTypeOverride={chartTypeOverride}
                    dateLabel={`${returnLabel} Return Date and Time`}
                    isDataStale={isDataStale}
                    staleDataLabel={staleDataLabel}
                  />
                ) : chartData.chart_data.first_subject && chartData.chart_data.second_subject ? (
                  <SynastryChart
                    data={chartData}
                    subject1Data={getSubChartData(
                      chartData.chart_data.first_subject,
                      chartData.chart_data.active_points,
                    )}
                    subject2Data={getSubChartData(
                      chartData.chart_data.second_subject,
                      chartData.chart_data.active_points,
                    )}
                    notes={notes}
                    onNotesChange={handleNotesChange}
                    chartTypeOverride={chartTypeOverride}
                    subject1DateLabel="Birth Date and Time"
                    subject2DateLabel={`${returnLabel} Return Date and Time`}
                    isDataStale={isDataStale}
                    staleDataLabel={staleDataLabel}
                  />
                ) : (
                  <div>Invalid chart data for dual wheel</div>
                )}
              </div>
            </div>
          )}
        </Tabs>
      )}
    </ChartViewWrapper>
  )
}
