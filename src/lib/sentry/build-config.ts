export function getSentryBuildOptions() {
  const sentryRelease = process.env["SENTRY_RELEASE"];

  return {
    org: process.env["SENTRY_ORG"],
    project: process.env["SENTRY_PROJECT"],
    authToken: process.env["SENTRY_AUTH_TOKEN"],

    // Tag source map uploads to the deployed commit SHA so Sentry can
    // attribute errors to the correct release and distinguish regressions
    // from pre-existing issues. When unset, the plugin auto-detects from git.
    release: sentryRelease !== undefined ? { name: sentryRelease } : undefined,

    // Upload a wider set of client source files for complete stack traces
    widenClientFileUpload: true,

    // Delete source maps from the build output after uploading to Sentry
    // so they are never served publicly
    hideSourceMaps: true,

    // Proxy Sentry requests through a Next.js route to bypass ad-blockers
    tunnelRoute: "/monitoring",

    // Suppress output outside of CI environments
    silent: !process.env["CI"],
  };
}
