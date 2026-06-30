import AppLayout from '@/components/AppLayout'
import { ReactNode } from 'react'
import { getSession } from '@/lib/security/session'
import { prisma } from '@/lib/db/prisma'
import { redirect } from 'next/navigation'
import { LEGAL_VERSIONS } from '@/lib/config/legal'
import { TermsAcceptanceModal } from '@/components/TermsAcceptanceModal'
import { TrialNotifications } from '@/components/trial'
import { calculateTrialDaysLeft, getTrialDurationDays } from '@/lib/config/trial'

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const session = await getSession()

  // If not authenticated, redirect to login
  if (!session?.userId) {
    redirect('/login')
  }

  // Fetch user data including legal acceptance status and trial info
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      onboardingCompleted: true,
      termsAcceptedVersion: true,
      privacyAcceptedVersion: true,
      email: true,
      subscriptionPlan: true,
      trialEndsAt: true,
      existingUserTrialActivatedAt: true,
      trialWelcomeShownAt: true,
    },
  })

  // If onboarding not completed, redirect to choose-plan
  if (!user?.onboardingCompleted) {
    redirect('/choose-plan')
  }

  // Check if user needs to accept current versions of legal documents
  const needsTermsAcceptance = user.termsAcceptedVersion !== LEGAL_VERSIONS.terms
  const needsPrivacyAcceptance = user.privacyAcceptedVersion !== LEGAL_VERSIONS.privacy

  // Calculate trial status
  const isOnTrial = user.subscriptionPlan === 'trial'
  const trialDaysLeft = calculateTrialDaysLeft(user.trialEndsAt)
  const isTrialExpired = isOnTrial && trialDaysLeft === 0

  // Check if existing user needs bonus trial offer
  // Conditions:
  // 1. User is on 'free' plan
  // 2. User hasn't been offered the bonus trial yet (existingUserTrialActivatedAt is null)
  // 3. User doesn't already have a trialEndsAt date
  const needsBonusTrialOffer =
    user.subscriptionPlan === 'free' && !user.existingUserTrialActivatedAt && !user.trialEndsAt

  // Check if user needs to see trial welcome popup
  // Conditions:
  // 1. User is on trial
  // 2. Trial hasn't expired
  // 3. User hasn't seen the welcome popup yet (trialWelcomeShownAt is null)
  const needsTrialWelcome = isOnTrial && !isTrialExpired && !user.trialWelcomeShownAt

  const trialStatus = {
    plan: user.subscriptionPlan,
    isOnTrial,
    trialDaysLeft,
    needsBonusTrialOffer,
    isTrialExpired,
    needsTrialWelcome,
  }

  return (
    <AppLayout>
      <TrialNotifications
        trialStatus={trialStatus}
        trialDurationDays={getTrialDurationDays()}
        userId={session.userId}
        userEmail={user.email ?? undefined}
      />
      {children}
      <TermsAcceptanceModal
        needsTermsAcceptance={needsTermsAcceptance}
        needsPrivacyAcceptance={needsPrivacyAcceptance}
        waitForTrialWelcome={needsTrialWelcome}
      />
    </AppLayout>
  )
}
