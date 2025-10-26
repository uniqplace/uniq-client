// Chat permissions helpers

export function canDeleteChannel(userRole?: string): boolean {
  return userRole === 'admin' || userRole === 'owner';
}
