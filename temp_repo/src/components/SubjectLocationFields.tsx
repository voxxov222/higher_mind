'use client'

import { useEffect, useMemo, useState } from 'react'
import type { UseFormReturn, Path, PathValue } from 'react-hook-form'
import { useWatch } from 'react-hook-form'
import { Loader2, MapPin } from 'lucide-react'

import { Switch } from '@/components/ui/switch'
import { TimezoneCombobox } from '@/components/TimezoneCombobox'
import { CityAutocomplete, type CitySuggestion } from '@/components/location/CityAutocomplete'
import { CountrySelector } from '@/components/location/CountrySelector'
import { CoordinatesInput } from '@/components/location/CoordinatesInput'
import { searchCitiesAction, getLocationDetailsAction, getTimezoneAction } from '@/actions/geonames'
import { cn } from '@/lib/utils/cn'
import { MIN_SEARCH_LENGTH } from '@/lib/validation/search'

export interface LocationFormValues {
  city?: string
  nation?: string
  latitude?: number
  longitude?: number
  timezone: string
}

interface SubjectLocationFieldsProps<
  FormValues extends LocationFormValues,
  TContext = unknown,
  TTransformedValues = FormValues,
> {
  form: UseFormReturn<FormValues, TContext, TTransformedValues>
  disabled?: boolean
  dialogOpen: boolean
  idPrefix: string
}

// Type-safe form field setter to avoid `as any` assertions
function setField<TForm extends LocationFormValues, TContext, TTransformedValues>(
  form: UseFormReturn<TForm, TContext, TTransformedValues>,
  field: keyof LocationFormValues,
  value: string | number | undefined,
  options?: { shouldDirty?: boolean },
): void {
  const fieldPath = field as Path<TForm>
  const fieldValue = value as PathValue<TForm, typeof fieldPath>
  form.setValue(fieldPath, fieldValue, options)
}

export function SubjectLocationFields<
  FormValues extends LocationFormValues,
  TContext = unknown,
  TTransformedValues = FormValues,
>({
  form,
  disabled = false,
  dialogOpen,
  idPrefix,
}: SubjectLocationFieldsProps<FormValues, TContext, TTransformedValues>) {
  const city = useWatch({ control: form.control, name: 'city' as Path<FormValues> }) as string | undefined
  const nation = useWatch({ control: form.control, name: 'nation' as Path<FormValues> }) as string | undefined
  const latitude = useWatch({ control: form.control, name: 'latitude' as Path<FormValues> }) as number | undefined
  const longitude = useWatch({ control: form.control, name: 'longitude' as Path<FormValues> }) as number | undefined
  const timezone = useWatch({ control: form.control, name: 'timezone' as Path<FormValues> }) as string | undefined

  const [manualCoordinates, setManualCoordinates] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [lastLookupKey, setLastLookupKey] = useState<string | null>(null)
  const [cityInput, setCityInput] = useState('')
  const [selectedCityLabel, setSelectedCityLabel] = useState<string | null>(
    typeof form.getValues('city' as Path<FormValues>) === 'string'
      ? (form.getValues('city' as Path<FormValues>) as string)
      : null,
  )
  const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([])
  const [cityLoading, setCityLoading] = useState(false)
  const [cityError, setCityError] = useState<string | null>(null)

  const dirtyFields = form.formState.dirtyFields
  const locationDirty = Boolean(dirtyFields?.city || dirtyFields?.nation)
  const locationKey = useMemo(() => {
    const parts = [city, nation].map((v) => (typeof v === 'string' ? v.trim().toLowerCase() : '')).filter(Boolean)
    return parts.length ? parts.join('|') : null
  }, [city, nation])

  // Reset state when dialog is reopened
  useEffect(() => {
    setManualCoordinates(false)
    setStatus('idle')
    setStatusMessage(null)
    setLastLookupKey(null)

    const currentCity = form.getValues().city
    setCityInput(typeof currentCity === 'string' ? currentCity : '')

    setSelectedCityLabel(null)
    setCitySuggestions([])
    setCityError(null)
  }, [dialogOpen, form])

  useEffect(() => {
    if (!manualCoordinates && !locationKey) {
      setStatus('idle')
      setStatusMessage(null)
    }
  }, [locationKey, manualCoordinates])

  // Removed problematic sync effect that was interfering with user input
  // The cityInput state is now the single source of truth for display
  // and is properly synchronized through handleCityInputChange and handleCitySelect

  // City search effect
  useEffect(() => {
    if (manualCoordinates) {
      setCitySuggestions([])
      setCityError(null)
      setCityLoading(false)
      return
    }

    const term = cityInput.trim()
    const isSelectedLabel = selectedCityLabel && term === selectedCityLabel.trim()
    if (term.length < MIN_SEARCH_LENGTH || isSelectedLabel) {
      setCitySuggestions([])
      setCityError(null)
      setCityLoading(false)
      return
    }

    let active = true

    setCityLoading(true)
    setCityError(null)
    const timer = window.setTimeout(() => {
      searchCitiesAction(term, typeof nation === 'string' && nation.length === 2 ? nation : undefined)
        .then((list) => {
          if (!active) return
          const mapped = list.map((item) => ({
            label: `${item.name}${item.adminName ? `, ${item.adminName}` : ''} (${item.countryName ?? item.countryCode ?? ''})`,
            value: item.name,
            countryCode: item.countryCode,
            latitude: item.latitude,
            longitude: item.longitude,
          }))
          setCitySuggestions(mapped)
          setCityLoading(false)
        })
        .catch((err) => {
          if (!active) return
          setCityLoading(false)
          setCityError(err instanceof Error ? err.message : 'Unable to search cities')
        })
    }, 350)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [cityInput, nation, selectedCityLabel, manualCoordinates])

  const shouldFetch = useMemo(() => {
    if (manualCoordinates) return false
    if (!locationKey) return false
    const hasCity = typeof city === 'string' && city.trim().length > 0
    if (!hasCity) return false

    const missingCoords = latitude === undefined || longitude === undefined
    const missingTimezone = !timezone
    const alreadyFetched = lastLookupKey !== null && lastLookupKey === locationKey

    if (alreadyFetched) return false

    return missingCoords || missingTimezone || locationDirty
  }, [manualCoordinates, city, latitude, longitude, timezone, locationDirty, lastLookupKey, locationKey])

  // Location details fetch effect
  useEffect(() => {
    if (!shouldFetch || !locationKey) return

    let active = true
    setLastLookupKey(locationKey)
    setStatus('loading')
    setStatusMessage(null)

    const timer = window.setTimeout(() => {
      getLocationDetailsAction(city, nation)
        .then(({ latitude: lat, longitude: lng, timezone: tz }) => {
          if (!active) return
          setField(form, 'latitude', lat, { shouldDirty: true })
          setField(form, 'longitude', lng, { shouldDirty: true })
          setField(form, 'timezone', tz, { shouldDirty: true })
          setStatus('success')
          setStatusMessage('Coordinates auto-filled via GeoNames.')
        })
        .catch((err) => {
          if (!active) return
          setStatus('error')
          setStatusMessage(err instanceof Error ? err.message : 'Unable to fetch coordinates from GeoNames.')
        })
    }, 450)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [shouldFetch, city, nation, form, locationKey])

  const handleCityInputChange = (value: string) => {
    setCityInput(value)
    setSelectedCityLabel(null)
    setField(form, 'city', value, { shouldDirty: true })
    setLastLookupKey(null)
  }

  const handleCitySelect = async (option: CitySuggestion) => {
    if (manualCoordinates) {
      setCitySuggestions([])
      return
    }

    setField(form, 'city', option.value, { shouldDirty: true })
    if (option.countryCode) {
      setField(form, 'nation', option.countryCode, { shouldDirty: true })
    }
    setField(form, 'latitude', option.latitude, { shouldDirty: true })
    setField(form, 'longitude', option.longitude, { shouldDirty: true })
    setSelectedCityLabel(option.label)
    setCityInput(option.label)
    setCitySuggestions([])

    const normalizedKey = [option.value, option.countryCode]
      .filter(Boolean)
      .map((v) => (v ? v.toLowerCase() : ''))
      .join('|')
    setLastLookupKey(normalizedKey)
    setStatus('loading')
    setStatusMessage(null)

    try {
      const tz = await getTimezoneAction(option.latitude, option.longitude)
      setField(form, 'timezone', tz, { shouldDirty: true })
      setStatus('success')
      setStatusMessage(null)
    } catch (err) {
      setStatus('error')
      setStatusMessage(err instanceof Error ? err.message : 'Unable to fetch timezone')
    }
  }

  const handleNationChange = (value: string) => {
    setField(form, 'nation', value, { shouldDirty: true })
  }

  const handleManualCoordinatesToggle = (checked: boolean) => {
    setManualCoordinates(checked)
    if (checked) {
      setStatus('idle')
      setStatusMessage(null)
      setCitySuggestions([])
      setCityLoading(false)
      setCityError(null)
    } else {
      setLastLookupKey(null)
    }
  }

  const handleLatitudeChange = (value: number | undefined) => {
    setField(form, 'latitude', value)
  }

  const handleLongitudeChange = (value: number | undefined) => {
    setField(form, 'longitude', value)
  }

  const handleTimezoneChange = (value: string) => {
    setField(form, 'timezone', value)
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border/60 bg-muted/20 p-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CityAutocomplete
          id={`${idPrefix}_city`}
          value={cityInput}
          onChange={handleCityInputChange}
          onSelect={handleCitySelect}
          suggestions={citySuggestions}
          loading={cityLoading}
          error={cityError}
          disabled={disabled}
          errorMessage={form.formState.errors.city?.message as string | undefined}
        />
        <CountrySelector
          id={`${idPrefix}_nation`}
          value={nation}
          onChange={handleNationChange}
          disabled={disabled}
          errorMessage={form.formState.errors.nation?.message as string | undefined}
        />
      </div>

      <div className="flex flex-col gap-2 rounded-md border border-dashed border-border/70 bg-background px-3 py-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium leading-tight">Coordinates</p>
              <p className="text-xs text-muted-foreground leading-tight">
                Auto-fill with GeoNames or toggle to edit manually.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id={`${idPrefix}_manual_coordinates`}
              checked={manualCoordinates}
              onCheckedChange={handleManualCoordinatesToggle}
              disabled={disabled}
            />
            <label className="text-sm" htmlFor={`${idPrefix}_manual_coordinates`}>
              Manually set coordinates
            </label>
          </div>
        </div>

        {!manualCoordinates && statusMessage && (
          <div
            className={cn(
              'flex items-center gap-2 rounded-md px-2 py-1 text-xs',
              status === 'error' ? 'text-destructive' : 'text-muted-foreground',
            )}
          >
            {status === 'loading' ? <Loader2 className="size-3 animate-spin" /> : null}
            <span>{statusMessage}</span>
          </div>
        )}
        {!manualCoordinates &&
          (form.formState.errors.timezone || form.formState.errors.latitude || form.formState.errors.longitude) && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 px-2 py-1 text-xs text-destructive">
              {(form.formState.errors.timezone?.message as string) ||
                (form.formState.errors.latitude?.message as string) ||
                (form.formState.errors.longitude?.message as string) ||
                'Coordinates are required.'}{' '}
              Toggle manual coordinates to fix them or adjust the location.
            </div>
          )}

        {manualCoordinates && (
          <div className="flex flex-col gap-3 pt-1">
            <div className="flex flex-col gap-1">
              <label htmlFor={`${idPrefix}_timezone`} className="text-sm font-medium">
                Timezone
              </label>
              <TimezoneCombobox
                id={`${idPrefix}_timezone`}
                value={timezone || ''}
                onChange={handleTimezoneChange}
                disabled={disabled}
                side="bottom"
              />
              {form.formState.errors.timezone && (
                <span className="text-xs text-destructive">{form.formState.errors.timezone.message as string}</span>
              )}
            </div>
            <CoordinatesInput
              idPrefix={idPrefix}
              latitude={latitude}
              longitude={longitude}
              onLatitudeChange={handleLatitudeChange}
              onLongitudeChange={handleLongitudeChange}
              disabled={disabled}
              latitudeError={form.formState.errors.latitude?.message as string | undefined}
              longitudeError={form.formState.errors.longitude?.message as string | undefined}
            />
          </div>
        )}
      </div>
    </div>
  )
}
