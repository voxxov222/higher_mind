'use server'

import { fetchCitySuggestions, fetchGeoNamesLocation, fetchTimezoneFromGeoNames } from '@/lib/geo/geonames'
import type { GeoNamesCitySuggestion } from '@/lib/geo/geonames'
import { logger } from '@/lib/logging/server'
import { z } from 'zod'

export type GeoNamesCitySuggestionFn = typeof fetchCitySuggestions
export type GeoNamesLocationFn = typeof fetchGeoNamesLocation
export type GeoNamesTimezoneFn = typeof fetchTimezoneFromGeoNames

// ============================================================================
// INPUT VALIDATION SCHEMAS
// ============================================================================

/**
 * Regex pattern for valid city/nation names.
 * Allows: letters (including Unicode), spaces, hyphens, apostrophes, periods, commas.
 * This covers names like "New York", "Saint-Étienne", "O'Brien", "São Paulo", etc.
 */
const LOCATION_NAME_PATTERN = /^[\p{L}\p{M}\s\-'.,()/]+$/u

/**
 * Maximum length for city names (generous limit for long city names)
 */
const MAX_CITY_LENGTH = 100

/**
 * Maximum length for nation/country codes or names
 */
const MAX_NATION_LENGTH = 60

/**
 * Schema for validating and sanitizing city input
 */
const citySchema = z
  .string()
  .trim()
  .min(1, 'City is required')
  .max(MAX_CITY_LENGTH, `City must be at most ${MAX_CITY_LENGTH} characters`)
  .regex(LOCATION_NAME_PATTERN, 'City contains invalid characters')

/**
 * Schema for validating and sanitizing nation input (optional)
 */
const nationSchema = z
  .string()
  .trim()
  .max(MAX_NATION_LENGTH, `Nation must be at most ${MAX_NATION_LENGTH} characters`)
  .regex(LOCATION_NAME_PATTERN, 'Nation contains invalid characters')
  .optional()
  .nullable()

/**
 * Schema for validating latitude
 */
const latitudeSchema = z.number().min(-90, 'Latitude must be at least -90').max(90, 'Latitude must be at most 90')

/**
 * Schema for validating longitude
 */
const longitudeSchema = z
  .number()
  .min(-180, 'Longitude must be at least -180')
  .max(180, 'Longitude must be at most 180')

/**
 * Sanitize and validate city input.
 * Returns the sanitized value or throws an error.
 */
function sanitizeCity(city: string): string {
  const result = citySchema.safeParse(city)
  if (!result.success) {
    throw new Error(`Invalid city input: ${result.error.issues?.[0]?.message ?? 'Validation failed'}`)
  }
  return result.data
}

/**
 * Sanitize and validate nation input.
 * Returns the sanitized value (or null/undefined if not provided).
 */
function sanitizeNation(nation: string | null | undefined): string | null | undefined {
  if (nation === null || nation === undefined || nation === '') {
    return nation
  }
  const result = nationSchema.safeParse(nation)
  if (!result.success) {
    throw new Error(`Invalid nation input: ${result.error.issues?.[0]?.message ?? 'Validation failed'}`)
  }
  return result.data
}

/**
 * Validate latitude value
 */
function validateLatitude(latitude: number): number {
  const result = latitudeSchema.safeParse(latitude)
  if (!result.success) {
    throw new Error(`Invalid latitude: ${result.error.issues?.[0]?.message ?? 'Validation failed'}`)
  }
  return result.data
}

/**
 * Validate longitude value
 */
function validateLongitude(longitude: number): number {
  const result = longitudeSchema.safeParse(longitude)
  if (!result.success) {
    throw new Error(`Invalid longitude: ${result.error.issues?.[0]?.message ?? 'Validation failed'}`)
  }
  return result.data
}

/**
 * Server Action: Search cities via GeoNames
 * Proxies the request to the server-side GeoNames library to protect credentials.
 */
export async function searchCitiesAction(city: string, nation?: string | null): Promise<GeoNamesCitySuggestion[]> {
  try {
    // Sanitize and validate inputs before passing to API
    const sanitizedCity = sanitizeCity(city)
    const sanitizedNation = sanitizeNation(nation)

    return await fetchCitySuggestions(sanitizedCity, sanitizedNation)
  } catch (error) {
    logger.error('Error searching cities:', error)
    throw new Error('Failed to search cities')
  }
}

/**
 * Server Action: Get location details (coords + timezone) via GeoNames
 * Proxies the request to the server-side GeoNames library.
 */
export async function getLocationDetailsAction(
  city?: string | null,
  nation?: string | null,
): Promise<{ latitude: number; longitude: number; timezone: string }> {
  try {
    // Sanitize and validate inputs before passing to API
    // City is optional for this action, only validate if provided
    const sanitizedCity = city ? sanitizeCity(city) : city
    const sanitizedNation = sanitizeNation(nation)

    return await fetchGeoNamesLocation({ city: sanitizedCity, nation: sanitizedNation })
  } catch (error) {
    logger.error('Error fetching location details:', error)
    throw new Error('Failed to fetch location details')
  }
}

/**
 * Server Action: Get timezone from coordinates via GeoNames
 * Proxies the request to the server-side GeoNames library.
 */
export async function getTimezoneAction(latitude: number, longitude: number): Promise<string> {
  try {
    // Validate coordinate inputs before passing to API
    const validatedLatitude = validateLatitude(latitude)
    const validatedLongitude = validateLongitude(longitude)

    return await fetchTimezoneFromGeoNames({ latitude: validatedLatitude, longitude: validatedLongitude })
  } catch (error) {
    logger.error('Error fetching timezone:', error)
    throw new Error('Failed to fetch timezone')
  }
}
