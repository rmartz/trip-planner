import * as Sentry from "@sentry/nextjs";
import { beforeSend } from "@/lib/sentry/beforeSend";

Sentry.init({
  dsn: process.env["NEXT_PUBLIC_SENTRY_DSN"],

  environment: process.env["NEXT_PUBLIC_VERCEL_ENV"] ?? process.env.NODE_ENV,

  // Commit SHA injected at build time; tags client-side errors to the exact
  // release so Sentry can distinguish regressions from pre-existing issues.
  release: process.env["NEXT_PUBLIC_SENTRY_RELEASE"],

  // Sends IP addresses, cookies, and request headers. Off by default; opt in via
  // NEXT_PUBLIC_SENTRY_ENABLE_SENSITIVE_DATA=true (development only).
  sendDefaultPii:
    process.env.NODE_ENV === "development" &&
    process.env["NEXT_PUBLIC_SENTRY_ENABLE_SENSITIVE_DATA"] === "true",
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  // Drop expected auth failures — only capture unexpected errors
  beforeSend,
});
