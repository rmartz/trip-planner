import { describe, it, expect } from "vitest";
import type { ErrorEvent } from "@sentry/nextjs";
import { beforeSend } from "./beforeSend";

function makeEvent(overrides: Partial<ErrorEvent> = {}): ErrorEvent {
  return {
    type: undefined,
    exception: {
      values: [{ type: "Error", value: "Something went wrong" }],
    },
    ...overrides,
  };
}

describe("beforeSend — passes through events that should be captured", () => {
  it("passes through events with no response context", () => {
    const event = makeEvent();
    expect(beforeSend(event)).toBe(event);
  });

  it("passes through 500 server errors", () => {
    const event = makeEvent({ contexts: { response: { status_code: 500 } } });
    expect(beforeSend(event)).toBe(event);
  });

  it("passes through 400 bad request errors", () => {
    const event = makeEvent({ contexts: { response: { status_code: 400 } } });
    expect(beforeSend(event)).toBe(event);
  });

  it("passes through events with unrelated context", () => {
    const event = makeEvent({ contexts: { runtime: { name: "node" } } });
    expect(beforeSend(event)).toBe(event);
  });
});

describe("beforeSend — filters expected auth errors", () => {
  it("drops 401 Unauthorized events", () => {
    const event = makeEvent({ contexts: { response: { status_code: 401 } } });
    expect(beforeSend(event)).toBeNull();
  });

  it("drops 403 Forbidden events", () => {
    const event = makeEvent({ contexts: { response: { status_code: 403 } } });
    expect(beforeSend(event)).toBeNull();
  });
});
