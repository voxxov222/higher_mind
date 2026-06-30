// NOTE: DODO PAYMENTS
/**
 * Subscription Status API Route
 *
 * Falls back to lifetime status if billing is not enabled.
 *
 * Query Parameters:
 * - forceSync=true: Forces a sync with billing provider API
 */
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/security/session'
import { getSubscriptionStatus } from '@/lib/subscription'
import { CACHE_CONTROL, cacheControlHeaders } from '@/lib/security/cache-control'
import { logger } from '@/lib/logging/server'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getSession()

    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if forceSync is requested (for billing pages)
    const forceSync = request.nextUrl.searchParams.get('forceSync') === 'true'

    const status = await getSubscriptionStatus(session.userId, { forceSync })

    // Use semi-static caching for subscription status (changes infrequently)
    // forceSync requests should not be cached as they explicitly request fresh data
    const cachePolicy = forceSync ? CACHE_CONTROL.noStore : CACHE_CONTROL.userDataSemiStatic

    return NextResponse.json(
      {
        plan: status.plan,
        isActive: status.isActive,
        trialDaysLeft: status.trialDaysLeft,
        subscriptionEndsAt: status.subscriptionEndsAt ?? null,
        isStale: status.isStale ?? false,
      },
      {
        headers: cacheControlHeaders(cachePolicy),
      },
    )
  } catch (error) {
    logger.error('[Subscription/Status] Error fetching subscription status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
