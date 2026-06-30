'use client'

/**
 * NOTE: DODO PAYMENTS - This component handles checkout success and subscription sync
 *
 * Checkout Success Handler
 *
 * Client component that handles the checkout=success parameter.
 * Forces a sync with billing API, immediately refetches subscription data,
 * and shows a congratulations popup.
 */
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { clientLogger } from '@/lib/logging/client'
import { CongratulationsDialog } from '@/components/CongratulationsDialog'

export function CheckoutSuccessHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const [isProcessing, setIsProcessing] = useState(false)
  const [showCongrats, setShowCongrats] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    // Dodo Payments uses 'completed=true' parameter
    const isCompleted = searchParams.get('completed') === 'true'
    const isCheckoutSuccess = searchParams.get('checkout') === 'success'
    const isPaymentSuccess = isCompleted || isCheckoutSuccess

    if (isPaymentSuccess && !isProcessing) {
      setIsProcessing(true)

      // Show popup immediately for better UX
      setShowCongrats(true)
      toast.success('Payment completed successfully!')

      // Call API to force sync with billing provider (this updates the database)
      const syncAndRefresh = async () => {
        try {
          clientLogger.info('[CheckoutSuccess] Starting subscription sync...')

          // Force sync subscription status from Dodo Payments API
          // Explicitly use GET method to avoid 405 errors
          const response = await fetch('/api/subscription/status?forceSync=true', {
            method: 'GET',
            signal: controller.signal,
          })

          if (!response.ok) {
            throw new Error(`Failed to sync subscription: ${response.status} ${response.statusText}`)
          }

          clientLogger.info('[CheckoutSuccess] Sync complete, invalidating cache...')

          // Invalidate and immediately refetch subscription data
          // This ensures the UI updates immediately with pro features
          await queryClient.invalidateQueries({ queryKey: ['subscription'] })
          await queryClient.refetchQueries({ queryKey: ['subscription'] })

          clientLogger.info('[CheckoutSuccess] Cache refreshed!')
        } catch (error) {
          // Ignore abort errors - component was unmounted
          if (error instanceof Error && error.name === 'AbortError') return
          clientLogger.error('[CheckoutSuccess] Failed to sync subscription:', error)
        }

        // Remove the payment success params from URL
        const params = new URLSearchParams(searchParams)
        params.delete('completed')
        params.delete('checkout')
        const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
        router.replace(newUrl)
      }

      syncAndRefresh()
    }

    return () => {
      controller.abort()
    }
  }, [searchParams, queryClient, pathname, router, isProcessing])

  return <CongratulationsDialog open={showCongrats} onClose={() => setShowCongrats(false)} />
}
