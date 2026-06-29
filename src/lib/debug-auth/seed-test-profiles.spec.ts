import { describe, expect, it } from "vitest";
import {
  assertNotProduction,
  PRODUCTION_PROJECT_ID,
  testProfileDoc,
} from "../../../scripts/lib/seed-test-profiles.mjs";

describe("assertNotProduction guards against the production project", () => {
  it("throws when the resolved project id is production", () => {
    expect(() => {
      assertNotProduction(PRODUCTION_PROJECT_ID);
    }).toThrow();
  });

  it("does not throw for the staging project", () => {
    expect(() => {
      assertNotProduction("trip-planner-staging");
    }).not.toThrow();
  });

  it("throws when no project id can be resolved", () => {
    expect(() => {
      assertNotProduction(undefined);
    }).toThrow();
  });
});

describe("testProfileDoc shapes a Firestore user profile document", () => {
  it("carries the display name, email, and synthetic flag", () => {
    const doc = testProfileDoc({
      uid: "synthetic:planner",
      displayName: "Pat Planner",
      email: "pat.planner@synthetic.test",
    });
    expect(doc.displayName).toBe("Pat Planner");
    expect(doc.email).toBe("pat.planner@synthetic.test");
    expect(doc.synthetic).toBe(true);
  });

  it("includes a createdAt value so the profile reads back cleanly", () => {
    const doc = testProfileDoc({
      uid: "synthetic:guest",
      displayName: "Gabby Guest",
      email: "gabby.guest@synthetic.test",
    });
    expect(doc.createdAt).toBeDefined();
  });
});
