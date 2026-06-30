// NOTE: DODO PAYMENTS
/**
 * Choose Plan Page
 *
 * Displayed after account verification to let users select their plan.
 * Redirects to dashboard if user has already completed onboarding.
 * Handles post-checkout callback to complete onboarding.
 *
 * NOTE: With the new trial system, new users are automatically assigned
 * a trial plan during registration. This page is mainly used for:
 * 1. Post-checkout callbacks from DodoPayments
 * 2. Users who somehow didn't get trial during registration
 *
 * @module app/choose-plan/page
 */

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/security/session'
import { prisma } from '@/lib/db/prisma'
import { PlanSelectionCard } from './PlanSelectionCard'
import { ChoosePlanHeader } from './ChoosePlanHeader'
import { calculateTrialEndDate, getTrialDurationDays } from '@/lib/config/trial'
import { logger } from '@/lib/logging/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Choose Your Plan',
  description: 'Select a plan to get started with Astrologer Studio',
}

export default async function ChoosePlanPage({ searchParams }: { searchParams: Promise<{ completed?: string }> }) {
  const session = await getSession()
  const params = await searchParams
  const checkoutCompleted = params.completed === 'true'

  // If not logged in, redirect to login
  if (!session?.userId) {
    redirect('/login')
  }

  // If checkout was just completed, verify subscription with Dodo Payments API and update user
  if (checkoutCompleted) {
    // Get user email for API verification
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { email: true },
    })

    // Try to sync subscription from Dodo Payments API
    let syncSuccess = false
    if (user?.email) {
      try {
        const { syncSubscriptionFromDodo } = await import('@/dodopayments/lib/subscription')
        syncSuccess = await syncSubscriptionFromDodo(session.userId, user.email)
      } catch (error) {
        logger.error('Failed to sync subscription with Dodo Payments API:', error)
      }
    }

    // Fallback if sync failed: set trial as default
    if (!syncSuccess) {
      await prisma.user.update({
        where: { id: session.userId },
        data: {
          onboardingCompleted: true,
          subscriptionPlan: 'trial',
          trialEndsAt: calculateTrialEndDate(),
          lastSubscriptionSync: new Date(),
        },
      })
    } else {
      // Sync succeeded, just mark onboarding complete
      await prisma.user.update({
        where: { id: session.userId },
        data: { onboardingCompleted: true },
      })
    }

    // Redirect to dashboard WITH the completed parameter
    // This ensures CheckoutSuccessHandler on dashboard can show the congratulations popup
    redirect('/dashboard?completed=true')
  }

  // Check if user has already completed onboarding
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      onboardingCompleted: true,
      email: true,
      subscriptionPlan: true,
    },
  })

  // If onboarding is complete, redirect to dashboard
  if (user?.onboardingCompleted) {
    redirect('/dashboard')
  }

  // If user doesn't have onboarding completed but already has a subscription,
  // they might have been created before the new trial system.
  // Auto-complete onboarding for trial/pro/lifetime users
  if (user && ['trial', 'pro', 'lifetime'].includes(user.subscriptionPlan)) {
    await prisma.user.update({
      where: { id: session.userId },
      data: { onboardingCompleted: true },
    })
    redirect('/dashboard')
  }

  const trialDays = getTrialDurationDays()

  return (
    <>
      <ChoosePlanHeader />
      <div className="flex min-h-screen flex-col items-center justify-center p-4 pt-20">
        <div className="w-full max-w-4xl space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Choose Your Plan</h1>
            <p className="text-muted-foreground">
              Select a plan to start exploring the stars. You can always upgrade later.
            </p>
          </div>

          <PlanSelectionCard userId={session.userId} email={user?.email ?? undefined} />

          <p className="text-center text-sm text-muted-foreground">
            Free plan includes natal charts for up to 5 subjects.
            <br />
            Pro plan unlocks all features with a {trialDays}-day free trial.
          </p>
        </div>
      </div>
    </>
  )
}
