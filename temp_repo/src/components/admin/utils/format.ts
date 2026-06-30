/**
 * Format a date as relative time (e.g., "2h ago", "3d ago")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHrs = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHrs / 24)

  if (diffDays > 30) {
    return date.toLocaleDateString()
  } else if (diffDays > 0) {
    return `${diffDays}d ago`
  } else if (diffHrs > 0) {
    return `${diffHrs}h ago`
  } else if (diffMin > 0) {
    return `${diffMin}m ago`
  } else {
    return 'Just now'
  }
}
