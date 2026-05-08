import * as Sentry from "@sentry/nextjs";
import { beforeSend } from "@/lib/sentry/beforeSend";

const enableSensitiveData =
  process.env.NODE_ENV === "development" &&
  process.env["SENTRY_ENABLE_SENSITIVE_DATA"] === "true";

Sentry.init({
  dsn: process.env["SENTRY_DSN"],

  environment: process.env["VERCEL_ENV"] ?? process.env.NODE_ENV,

  // Commit SHA injected at build time; tags server-side errors to the exact
  // release so Sentry can distinguish regressions from pre-existing issues.
  release: process.env["SENTRY_RELEASE"],

  // Sends IP addresses, cookies, and request headers. Off by default; opt in via
  // SENTRY_ENABLE_SENSITIVE_DATA=true (development only).
  sendDefaultPii: enableSensitiveData,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  // Attach local variable values to stack frames (development + opt-in only)
  includeLocalVariables: enableSensitiveData,

  // Drop expected auth failures — only capture unexpected errors
  beforeSend,
});
