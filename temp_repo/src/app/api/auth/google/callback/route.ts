import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { createSession } from '@/lib/security/session'
import { isGoogleOAuthEnabled, exchangeCodeForTokens, getGoogleUserInfo } from '@/lib/security/oauth'
import { logger } from '@/lib/logging/server'
import { calculateTrialEndDate } from '@/lib/config/trial'
import { CACHE_CONTROL } from '@/lib/security/cache-control'
import { APP_URL } from '@/lib/config/app'

/**
 * GET /api/auth/google/callback
 * Handles Google OAuth callback after user authorizes
 * Creates or links user account and establishes session
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Check if OAuth is enabled
  if (!isGoogleOAuthEnabled()) {
    const response = NextResponse.redirect(new URL('/login?error=oauth_disabled', request.url))
    response.headers.set('Cache-Control', CACHE_CONTROL.noStore)
    return response
  }

  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const receivedState = searchParams.get('state')

  // Handle user cancellation or errors
  if (error || !code) {
    logger.warn('Google OAuth callback error:', error || 'No code provided')
    const response = NextResponse.redirect(new URL('/login?error=oauth_cancelled', request.url))
    response.headers.set('Cache-Control', CACHE_CONTROL.noStore)
    return response
  }

  // Validate state parameter to prevent CSRF
  const savedState = request.cookies.get('oauth_state')?.value

  if (!savedState || savedState !== receivedState) {
    logger.warn('OAuth state mismatch - potential CSRF attempt')
    const response = NextResponse.redirect(new URL('/login?error=invalid_state', request.url))
    response.headers.set('Cache-Control', CACHE_CONTROL.noStore)
    return response
  }

  try {
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code)

    // Fetch user info from Google
    const googleUser = await getGoogleUserInfo(tokens.access_token)

    if (!googleUser.verified_email) {
      const response = NextResponse.redirect(new URL('/login?error=email_not_verified', request.url))
      response.headers.set('Cache-Control', CACHE_CONTROL.noStore)
      return response
    }

    // Find existing user by googleId or email
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId: googleUser.id }, { email: googleUser.email }],
      },
    })

    if (user) {
      // Link Google account if not already linked
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: googleUser.id,
            authProvider: 'google',
            // Update profile info if missing
            firstName: user.firstName || googleUser.given_name,
            lastName: user.lastName || googleUser.family_name,
            // Google already verified the email
            emailVerified: user.emailVerified || new Date(),
          },
        })
        logger.info(`Linked Google account to existing user: ${user.id}`)
      }
    } else {
      // Create new user with Google account
      // Generate unique username from email (before @)
      const baseUsername = googleUser.email.split('@')[0] ?? 'user'
      let username = baseUsername
      let counter = 1

      // Ensure username uniqueness
      while (await prisma.user.findUnique({ where: { username } })) {
        username = `${baseUsername}${counter}`
        counter++
      }

      user = await prisma.user.create({
        data: {
          username,
          email: googleUser.email,
          googleId: googleUser.id,
          authProvider: 'google',
          firstName: googleUser.given_name,
          lastName: googleUser.family_name ?? null,
          // New users start with PRO trial
          subscriptionPlan: 'trial',
          trialEndsAt: calculateTrialEndDate(),
          onboardingCompleted: true, // Skip choose-plan page
          emailVerified: new Date(), // Google already verified the email
          // password is null for OAuth users
        },
      })
      logger.info(`Created new user via Google OAuth: ${user.id}`)

      // Notify Slack about new user registration
      const { sendNewUserNotification } = await import('@/lib/logging/slack')
      void sendNewUserNotification(username, googleUser.email, 'google')

      // Send email notification to admin
      const { sendNewUserEmailNotification } = await import('@/lib/mail/mail')
      void sendNewUserEmailNotification(username, googleUser.email, 'google', 'trial')
    }

    // Track login analytics
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        loginCount: { increment: 1 },
      },
    })

    // Create session
    await createSession(user.id, user.username)

    // Redirect to app using configured APP_URL
    const redirectResponse = NextResponse.redirect(new URL('/dashboard', APP_URL))

    // Clear the oauth_state cookie after successful validation
    redirectResponse.cookies.delete('oauth_state')
    // OAuth redirects should never be cached
    redirectResponse.headers.set('Cache-Control', CACHE_CONTROL.noStore)

    return redirectResponse
  } catch (err) {
    logger.error('Google OAuth callback error:', err)
    const response = NextResponse.redirect(new URL('/login?error=oauth_failed', request.url))
    response.headers.set('Cache-Control', CACHE_CONTROL.noStore)
    return response
  }
}
