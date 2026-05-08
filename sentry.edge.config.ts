import * as Sentry from "@sentry/nextjs";
import { beforeSend } from "@/lib/sentry/beforeSend";

Sentry.init({
  dsn: process.env["SENTRY_DSN"],

  environment: process.env["VERCEL_ENV"] ?? process.env.NODE_ENV,

  // Commit SHA injected at build time; tags edge-side errors to the exact
  // release so Sentry can distinguish regressions from pre-existing issues.
  release: process.env["SENTRY_RELEASE"],

  // Sends IP addresses, cookies, and request headers. Off by default; opt in via
  // SENTRY_ENABLE_SENSITIVE_DATA=true (development only).
  sendDefaultPii:
    process.env.NODE_ENV === "development" &&
    process.env["SENTRY_ENABLE_SENSITIVE_DATA"] === "true",
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  // Drop expected auth failures — only capture unexpected errors
  beforeSend,
});
