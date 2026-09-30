import type { init } from "@sentry/nextjs";

// `@sentry/nextjs` does not re-export the `DataCollection` type from
// `@sentry/core`, so derive it from `Sentry.init`'s options.
type DataCollection = NonNullable<
  NonNullable<Parameters<typeof init>[0]>["dataCollection"]
>;

// Header / query-param names Sentry v10 scrubbed when `sendDefaultPii` was off.
const V10_PII_DENYLIST = ["forwarded", "-ip", "remote-", "via", "-user"];

// Sentry v11 replaced `sendDefaultPii` with `dataCollection`, and an unset
// `dataCollection` now collects user info, cookies, bodies, etc. by default.
// This is the v10 `sendDefaultPii: false` baseline from Sentry's v10→v11
// migration guide, so the restrictive default is preserved.
const RESTRICTED_DATA_COLLECTION: DataCollection = {
  userInfo: false,
  cookies: false,
  httpHeaders: {
    request: { deny: V10_PII_DENYLIST },
    response: { deny: V10_PII_DENYLIST },
  },
  httpBodies: [],
  urlQueryParams: { deny: V10_PII_DENYLIST },
  genAI: { inputs: false, outputs: false },
  databaseQueryData: false,
  queues: false,
  graphQL: { document: false, variables: false },
};

// Sends IP addresses, cookies, request headers and bodies only when sensitive
// data is explicitly enabled (the v10 `sendDefaultPii: true` equivalent is the
// v11 default, i.e. an empty `dataCollection`). Otherwise restrict collection.
export function getDataCollection(
  enableSensitiveData: boolean,
): DataCollection {
  return enableSensitiveData ? {} : RESTRICTED_DATA_COLLECTION;
}
