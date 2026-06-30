'use client'

/**
 * Skip navigation link for keyboard accessibility.
 * Appears on focus (first Tab press) and allows users to jump
 * directly to the main content, bypassing sidebar/header navigation.
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-md focus:ring-2 focus:ring-ring focus:outline-none"
    >
      Skip to main content
    </a>
  )
}
