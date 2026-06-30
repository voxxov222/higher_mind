'use server'

/**
 * Trial Management Actions
 *
 * Server actions for managing user trial periods:
 * - Activating bonus trial for existing users
 * - Handling trial expiration choices (FREE vs PRO)
 * - Dismissing trial welcome popup
 *
 * @module actions/trial
 */

import { prisma } from '@/lib/db/prisma'
import { getSession } from '@/lib/security/session'
import { logger } from '@/lib/logging/server'
import { calculateTrialEndDate } from '@/lib/config/trial'
import { revalidatePath } from 'next/cache'

/**
 * Result type for trial actions
 */
type ActionResult = {
  error?: string
  success?: boolean
}

/**
 * Activate bonus trial for existing users
 * This grants existing free users a PRO trial period
 */
export async function activateBonusTrial(): Promise<ActionResult> {
  const session = await getSession()
  if (!session?.userId) {
    return { error: 'Not authenticated' }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        subscriptionPlan: true,
        existingUserTrialActivatedAt: true,
        trialEndsAt: true,
      },
    })

    if (!user) {
      return { error: 'User not found' }
    }

    // Prevent activating if already on trial, pro, or lifetime
    if (user.subscriptionPlan !== 'free') {
      return { error: 'Bonus trial is only available for free plan users' }
    }

    // Prevent double activation
    if (user.existingUserTrialActivatedAt) {
      return { error: 'Bonus trial has already been activated' }
    }

    // Activate the trial
    const trialEndsAt = calculateTrialEndDate()
    const now = new Date()

    await prisma.user.update({
      where: { id: session.userId },
      data: {
        subscriptionPlan: 'trial',
        trialEndsAt,
        existingUserTrialActivatedAt: now,
        // Also mark welcome as shown since ExistingUserTrialModal already serves as welcome
        trialWelcomeShownAt: now,
      },
    })

    logger.info(`Bonus trial activated for user ${session.userId}. Trial ends at: ${trialEndsAt.toISOString()}`)

    revalidatePath('/', 'layout')

    return { success: true }
  } catch (error) {
    logger.error('Error activating bonus trial:', error)
    return { error: 'Failed to activate bonus trial' }
  }
}

/**
 * Handle trial expiration - downgrade to free plan
 * Called when user chooses to continue with free plan after trial expires
 */
export async function downgradeToFree(): Promise<ActionResult> {
  const session = await getSession()
  if (!session?.userId) {
    return { error: 'Not authenticated' }
  }

  try {
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        subscriptionPlan: 'free',
        // Keep trialEndsAt for history
      },
    })

    logger.info(`User ${session.userId} downgraded to free plan after trial`)

    revalidatePath('/', 'layout')

    return { success: true }
  } catch (error) {
    logger.error('Error downgrading to free:', error)
    return { error: 'Failed to downgrade to free plan' }
  }
}

/**
 * Dismiss the trial welcome popup
 * Called when user acknowledges the trial welcome message
 */
export async function dismissTrialWelcome(): Promise<ActionResult> {
  const session = await getSession()
  if (!session?.userId) {
    return { error: 'Not authenticated' }
  }

  try {
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        trialWelcomeShownAt: new Date(),
      },
    })

    logger.info(`User ${session.userId} dismissed trial welcome popup`)

    revalidatePath('/', 'layout')

    return { success: true }
  } catch (error) {
    logger.error('Error dismissing trial welcome:', error)
    return { error: 'Failed to dismiss welcome' }
  }
}
