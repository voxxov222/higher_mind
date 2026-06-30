'use server'

import { astrologerApi } from '@/lib/api/astrologer'
import { getSession } from '@/lib/security/session'
import { prisma } from '@/lib/db/prisma'
import { logger } from '@/lib/logging/server'
import type {
  SubjectModel,
  ChartResponse,
  ChartRequestOptions,
  PlanetaryReturnRequestOptions,
  EnrichedSubjectModel,
} from '@/types/astrology'
import type { Subject } from '@/types/subjects'
import { getChartPreferences, type ChartPreferencesData } from '@/actions/preferences'

/**
 * Track a chart calculation for analytics
 * Non-blocking: errors are logged but don't fail the chart calculation
 *
 * Gets userId from authenticated session to prevent IDOR attacks
 */
export async function trackChartCalculation(chartType: string): Promise<void> {
  try {
    const session = await getSession()
    if (!session?.userId) {
      // Silently skip tracking for unauthenticated requests
      return
    }
    const userId = session.userId
    const today = new Date().toISOString().split('T')[0]!

    await prisma.chartCalculationUsage.upsert({
      where: {
        userId_date_chartType: { userId, date: today, chartType },
      },
      update: {
        count: { increment: 1 },
      },
      create: {
        userId,
        date: today,
        chartType,
        count: 1,
      },
    })
  } catch (error) {
    // Non-blocking: don't fail the chart if tracking fails
    logger.error('Failed to track chart calculation:', error)
  }
}

/**
 * Converts local Subject type to API SubjectModel format
 *
 * @param subject - Subject from database
 * @returns SubjectModel formatted for API requests
 *
 * @remarks
 * - Extracts date components from ISO datetime string
 * - Uses UTC values to avoid timezone issues
 * - Includes all required location data
 */
/**
 * Converts Subject to basic SubjectModel (no config)
 */
function toBasicSubjectModel(subject: Subject): SubjectModel {
  const date = new Date(subject.birth_datetime)

  return {
    name: subject.name,
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
    second: date.getUTCSeconds(),
    city: subject.city,
    nation: subject.nation,
    timezone: subject.timezone,
    longitude: subject.longitude,
    latitude: subject.latitude,
  }
}

/**
 * Converts Subject to SubjectModel with user preferences applied
 */
function toSubjectModelWithPreferences(subject: Subject, prefs: ChartPreferencesData): SubjectModel {
  const basicModel = toBasicSubjectModel(subject)

  if (!prefs.default_zodiac_system) {
    throw new Error('Missing required preference: default_zodiac_system')
  }
  if (!prefs.house_system) {
    throw new Error('Missing required preference: house_system')
  }
  if (!prefs.perspective_type) {
    throw new Error('Missing required preference: perspective_type')
  }

  const zodiacType = prefs.default_zodiac_system
  const siderealMode = zodiacType === 'Sidereal' ? prefs.default_sidereal_mode || null : null

  return {
    ...basicModel,
    zodiac_type: zodiacType,
    sidereal_mode: siderealMode,
    houses_system_identifier: prefs.house_system,
    perspective_type: prefs.perspective_type,
  }
}

/**
 * Merges user preferences with request options
 */
function mergeOptionsWithPreferences(
  options: ChartRequestOptions | undefined,
  prefs: ChartPreferencesData,
): ChartRequestOptions {
  // Validate required preferences
  // active_points can be empty if user wants to hide all points
  if (!prefs.active_aspects || prefs.active_aspects.length === 0) {
    throw new Error('Missing required preference: active_aspects')
  }

  // Handle custom_distribution_weights - only include if it has keys
  const hasCustomWeights =
    prefs.custom_distribution_weights && Object.keys(prefs.custom_distribution_weights).length > 0

  return {
    theme: prefs.theme as ChartRequestOptions['theme'],
    language: 'EN',
    transparent_background: true,
    show_house_position_comparison: true,
    show_cusp_position_comparison: true,
    show_degree_indicators: prefs.show_degree_indicators,
    show_aspect_icons: prefs.show_aspect_icons,
    distribution_method: prefs.distribution_method as ChartRequestOptions['distribution_method'],
    active_points: prefs.active_points,
    active_aspects: prefs.active_aspects,
    custom_distribution_weights: hasCustomWeights ? prefs.custom_distribution_weights : undefined,
    split_chart: true,
    custom_title: undefined,
    ...options,
  }
}

/**
 * Higher-order function that wraps common chart action boilerplate:
 * session verification, calculation tracking, preference loading, and option merging.
 *
 * @param chartType - Chart type identifier for analytics tracking
 * @param apiCall - Callback receiving preferences, merged options, and returning the API response
 * @returns A server action function with the provided args signature
 */
function createChartAction<TArgs extends unknown[]>(
  chartType: string,
  apiCall: (
    prefs: ChartPreferencesData,
    mergedOptions: ChartRequestOptions,
    ...args: TArgs
  ) => Promise<ChartResponse>,
): (...args: TArgs) => Promise<ChartResponse> {
  return async (...args: TArgs): Promise<ChartResponse> => {
    const session = await getSession()
    if (!session) throw new Error('Unauthorized')

    // Track calculation (non-blocking)
    void trackChartCalculation(chartType)

    const prefs = await getChartPreferences()
    if (!prefs) throw new Error('User preferences not found')

    // Extract options as the last argument if it exists
    const lastArg = args[args.length - 1] as ChartRequestOptions | undefined
    const options = lastArg && typeof lastArg === 'object' && !('name' in lastArg) ? lastArg : undefined
    const mergedOptions = mergeOptionsWithPreferences(options, prefs)

    return await apiCall(prefs, mergedOptions, ...args)
  }
}

export const getNatalChart = createChartAction(
  'natal',
  (prefs, mergedOptions, subject: Subject, _options?: ChartRequestOptions) => {
    const subjectModel = toSubjectModelWithPreferences(subject, prefs)
    return astrologerApi.getNatalChart(subjectModel, mergedOptions)
  },
)

export const getTransitChart = createChartAction(
  'transit',
  (prefs, mergedOptions, natalSubject: Subject, transitSubject: Subject, _options?: ChartRequestOptions) => {
    // Config goes on natal subject only
    const natalModel = toSubjectModelWithPreferences(natalSubject, prefs)
    const transitModel = toBasicSubjectModel(transitSubject)
    return astrologerApi.getTransitChart(natalModel, transitModel, mergedOptions)
  },
)

export const getSynastryChart = createChartAction(
  'synastry',
  (prefs, mergedOptions, subjectA: Subject, subjectB: Subject, _options?: ChartRequestOptions) => {
    // Config goes on first subject
    const modelA = toSubjectModelWithPreferences(subjectA, prefs)
    const modelB = toBasicSubjectModel(subjectB)
    return astrologerApi.getSynastryChart(modelA, modelB, mergedOptions)
  },
)

export const getCompositeChart = createChartAction(
  'composite',
  async (prefs, mergedOptions, subjectA: Subject, subjectB: Subject, _options?: ChartRequestOptions) => {
    // Config goes on first subject
    const modelA = toSubjectModelWithPreferences(subjectA, prefs)
    const modelB = toBasicSubjectModel(subjectB)

    const response = await astrologerApi.getCompositeChart(modelA, modelB, mergedOptions)

    // Ensure first_subject and second_subject are present in the response
    // This is required for AI interpretation context generation
    if (response.status === 'OK' && response.chart_data) {
      if (!response.chart_data.first_subject) {
        response.chart_data.first_subject = modelA as EnrichedSubjectModel
      }
      if (!response.chart_data.second_subject) {
        response.chart_data.second_subject = modelB as EnrichedSubjectModel
      }
    }

    return response
  },
)

export const getNowChart = createChartAction(
  'now',
  (_prefs, mergedOptions, _options?: ChartRequestOptions) => {
    return astrologerApi.getNowChart(mergedOptions)
  },
)

export const getSolarReturnChart = createChartAction(
  'solar-return',
  (prefs, mergedOptions, subject: Subject, options?: PlanetaryReturnRequestOptions) => {
    const subjectModel = toSubjectModelWithPreferences(subject, prefs)
    return astrologerApi.getSolarReturnChart(subjectModel, {
      ...mergedOptions,
      year: options?.year,
      month: options?.month,
      iso_datetime: options?.iso_datetime,
      return_location: options?.return_location,
      wheel_type: options?.wheel_type,
    })
  },
)

export const getLunarReturnChart = createChartAction(
  'lunar-return',
  (prefs, mergedOptions, subject: Subject, options?: PlanetaryReturnRequestOptions) => {
    const subjectModel = toSubjectModelWithPreferences(subject, prefs)
    return astrologerApi.getLunarReturnChart(subjectModel, {
      ...mergedOptions,
      year: options?.year,
      month: options?.month,
      iso_datetime: options?.iso_datetime,
      return_location: options?.return_location,
      wheel_type: options?.wheel_type,
    })
  },
)
