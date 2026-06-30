'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { clientLogger } from '@/lib/logging/client'

interface ErrorPageProps {
  /** The error object caught by the error boundary */
  error: Error & { digest?: string }
  /** Function to attempt re-rendering the segment */
  reset: () => void
}

/**
 * Global Error Page Component
 *
 * @remarks
 * This component handles uncaught client-side errors at the route level.
 * It provides a user-friendly error message with recovery options.
 *
 * - Catches all errors in child component tree
 * - Logs errors for debugging and monitoring
 * - Provides "Try Again" button to attempt recovery
 * - Provides "Back to Home" link for navigation
 * - Prevents the entire application from crashing
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error to console for debugging
    clientLogger.error('Error caught by error boundary:', error)

    // TODO: Send to error monitoring service (e.g., Sentry)
    // Example: Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-destructive">Something went wrong</CardTitle>
          <CardDescription>An unexpected error occurred. Please try again or return to the home page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && error.message && (
            <div className="rounded-md bg-muted p-3 text-sm">
              <p className="font-mono break-words">{error.message}</p>
              {error.digest && <p className="mt-2 text-xs text-muted-foreground">Error ID: {error.digest}</p>}
            </div>
          )}
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <Button onClick={() => reset()} className="flex-1">
              Try Again
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
