import { NextResponse } from 'next/server'
import { isGoogleOAuthEnabled, getGoogleAuthUrl } from '@/lib/security/oauth'
import { CACHE_CONTROL, cacheControlHeaders } from '@/lib/security/cache-control'
import { logger } from '@/lib/logging/server'

/**
 * GET /api/auth/google
 * Initiates Google OAuth flow by redirecting to Google consent screen
 */
export async function GET(): Promise<NextResponse> {
  // Check if OAuth is enabled
  if (!isGoogleOAuthEnabled()) {
    // Error responses should not be cached
    return NextResponse.json(
      { error: 'Google OAuth is not enabled' },
      { status: 403, headers: cacheControlHeaders(CACHE_CONTROL.noStore) },
    )
  }

  try {
    const authUrl = await getGoogleAuthUrl()
    // Redirect response - set Cache-Control to prevent caching of OAuth initiation
    const response = NextResponse.redirect(authUrl)
    response.headers.set('Cache-Control', CACHE_CONTROL.noStore)
    return response
  } catch (error) {
    logger.error('Google OAuth error:', error)
    // Error responses should not be cached
    return NextResponse.json(
      { error: 'Failed to initiate Google OAuth' },
      { status: 500, headers: cacheControlHeaders(CACHE_CONTROL.noStore) },
    )
  }
}
