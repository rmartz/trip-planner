export function getUnreadCountPath(uid: string): string {
  return `users/${uid}/unreadCount`;
}

export function parseUnreadCount(value: unknown): number {
  if (typeof value !== "number") return 0;
  return Math.max(0, Math.floor(value));
}

export function serializeUnreadCount(value: number): number {
  return Math.max(0, Math.floor(value));
}
