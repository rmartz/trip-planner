export function getSentryBuildOptions() {
  return {
    org: process.env["SENTRY_ORG"],
    project: process.env["SENTRY_PROJECT"],
    authToken: process.env["SENTRY_AUTH_TOKEN"],

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
