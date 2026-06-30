import { Component, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { clientLogger } from '@/lib/logging/client'

interface Props {
  /** Child components to protect with error boundary */
  children: ReactNode
  /** Optional custom fallback UI to show on error */
  fallback?: ReactNode
}

interface State {
  /** Whether an error has been caught */
  hasError: boolean
  /** The caught error object */
  error?: Error
}

/** Generic error message shown to users in production */
export const PRODUCTION_ERROR_MESSAGE = 'Si è verificato un errore imprevisto'

/**
 * Check if the app is running in production mode.
 * Exported for testing purposes.
 */
export function isProductionMode(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * Error Boundary component to catch React errors gracefully
 *
 * @remarks
 * - Catches errors in child component tree
 * - Displays user-friendly error message
 * - Allows page reload to recover
 * - Logs errors to console for debugging
 * - Supports custom fallback UI
 * - In production, hides raw error details and shows a generic message
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  /**
   * Update state when an error is caught
   */
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  /**
   * Get the error message to display.
   * In production, shows a generic message to avoid exposing implementation details.
   * In development, shows the actual error message for debugging.
   */
  private getDisplayMessage(): string {
    if (isProductionMode()) {
      return PRODUCTION_ERROR_MESSAGE
    }
    return this.state.error?.message || PRODUCTION_ERROR_MESSAGE
  }

  /**
   * Log error details for debugging
   */
  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    clientLogger.error('ErrorBoundary caught an error:', error, errorInfo)
    // TODO: Send to error tracking service (e.g., Sentry)
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl text-destructive">Something went wrong</CardTitle>
              <CardDescription>An unexpected error occurred</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md bg-muted p-3 text-sm">
                <p className="font-mono">{this.getDisplayMessage()}</p>
              </div>
              <Button onClick={() => window.location.reload()} className="w-full">
                Reload Page
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
