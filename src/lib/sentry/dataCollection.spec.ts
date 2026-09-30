import { describe, expect, it } from "vitest";
import { getDataCollection } from "./dataCollection";

describe("getDataCollection", () => {
  it("uses Sentry's permissive v11 defaults when sensitive data is enabled", () => {
    expect(getDataCollection(true)).toEqual({});
  });

  it("restricts PII collection to the v10 sendDefaultPii: false baseline by default", () => {
    const dataCollection = getDataCollection(false);
    expect(dataCollection.userInfo).toBe(false);
    expect(dataCollection.cookies).toBe(false);
    expect(dataCollection.httpBodies).toEqual([]);
    expect(dataCollection.databaseQueryData).toBe(false);
    expect(dataCollection.queues).toBe(false);
    expect(dataCollection.genAI).toEqual({ inputs: false, outputs: false });
    expect(dataCollection.graphQL).toEqual({
      document: false,
      variables: false,
    });
    expect(dataCollection.httpHeaders).toEqual({
      request: { deny: ["forwarded", "-ip", "remote-", "via", "-user"] },
      response: { deny: ["forwarded", "-ip", "remote-", "via", "-user"] },
    });
  });
});
