'use client'

import { useEffect } from 'react'
import { clientLogger } from '@/lib/logging/client'

interface GlobalErrorProps {
  /** The error object caught by the error boundary */
  error: Error & { digest?: string }
  /** Function to attempt re-rendering the segment */
  reset: () => void
}

/**
 * Global Error Boundary Component
 *
 * @remarks
 * This component handles catastrophic errors that occur in the root layout,
 * where the normal error.tsx cannot intervene because the layout is its parent.
 *
 * Key characteristics:
 * - Renders a complete HTML document (html, head, body)
 * - Uses inline styles since CSS files may not be available
 * - Does not depend on any providers or app components
 * - Provides a reset button to attempt recovery
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/global-error
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log error to console for debugging
    clientLogger.error('Global error caught:', error)
  }, [error])

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Error | Astrologer Studio</title>
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          backgroundColor: '#0a0a0a',
          color: '#fafafa',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            maxWidth: '28rem',
            width: '100%',
            padding: '1.5rem',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              backgroundColor: '#171717',
              borderRadius: '0.75rem',
              border: '1px solid #262626',
              padding: '2rem',
              textAlign: 'center',
            }}
          >
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                color: '#ef4444',
                marginTop: 0,
                marginBottom: '0.5rem',
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{
                color: '#a1a1aa',
                fontSize: '0.875rem',
                marginBottom: '1.5rem',
                lineHeight: 1.5,
              }}
            >
              A critical error occurred. Please try again or refresh the page.
            </p>

            {process.env.NODE_ENV === 'development' && error.message && (
              <div
                style={{
                  backgroundColor: '#262626',
                  borderRadius: '0.375rem',
                  padding: '0.75rem',
                  marginBottom: '1.5rem',
                  textAlign: 'left',
                }}
              >
                <p
                  style={{
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: '0.75rem',
                    color: '#fafafa',
                    margin: 0,
                    wordBreak: 'break-word',
                  }}
                >
                  {error.message}
                </p>
                {error.digest && (
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: '#71717a',
                      marginTop: '0.5rem',
                      marginBottom: 0,
                    }}
                  >
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <button
                onClick={() => reset()}
                style={{
                  backgroundColor: '#fafafa',
                  color: '#0a0a0a',
                  border: 'none',
                  borderRadius: '0.375rem',
                  padding: '0.625rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#e5e5e5'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#fafafa'
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                style={{
                  backgroundColor: 'transparent',
                  color: '#fafafa',
                  border: '1px solid #404040',
                  borderRadius: '0.375rem',
                  padding: '0.625rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s, border-color 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#262626'
                  e.currentTarget.style.borderColor = '#525252'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.borderColor = '#404040'
                }}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
