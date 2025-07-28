// Helper to deduplicate notifications by _id
export function deduplicateNotifications<T extends { _id: string }>(notifications: T[]): T[] {
  return Array.from(
    new Map(
      notifications.filter(n => n && n._id).map(n => [n._id, n])
    ).values()
  );
}
