import type { ErrorEvent } from "@sentry/nextjs";

export function beforeSend(event: ErrorEvent): ErrorEvent | null {
  const statusCode = event.contexts?.response?.status_code;
  if (statusCode === 401 || statusCode === 403) return null;
  return event;
}
