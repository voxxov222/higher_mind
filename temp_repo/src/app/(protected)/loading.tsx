/**
 * Loading component for protected routes.
 * Returns an empty placeholder while the page content loads.
 */
export default function Loading() {
  return <div className="h-full w-full" data-testid="protected-loading" />
}
