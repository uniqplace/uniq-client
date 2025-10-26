// Centralized logging utility

export function logError(message: string, error?: unknown) {
  // In production, integrate with a service like Sentry, LogRocket, etc.
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error(message, error);
  }
  // Add production error reporting here
}
