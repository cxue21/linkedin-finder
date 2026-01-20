/**
 * Get confidence color based on percentage
 */
export function getConfidenceColor(
  confidence: number
): 'green' | 'yellow' | 'red' {
  if (confidence > 80) return 'green';
  if (confidence >= 60) return 'yellow';
  return 'red';
}

/**
 * Get confidence badge text
 */
export function getConfidenceBadgeText(confidence: number): string {
  if (confidence === 0) return 'No result';
  return `${confidence}%`;
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get status badge color
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function isStrongPassword(password: string): boolean {
  return password.length >= 8;
}
