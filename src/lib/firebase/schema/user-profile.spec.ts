import { describe, expect, it } from "vitest";
import { Timestamp } from "firebase/firestore";
import { firebaseToUserProfile, userProfileToFirebase } from "./user-profile";

describe("firebaseToUserProfile", () => {
  it("maps uid from argument", () => {
    const ts = Timestamp.fromDate(new Date("2024-03-01T12:00:00Z"));
    const profile = firebaseToUserProfile("uid-abc", {
      email: "a@b.com",
      createdAt: ts,
    });
    expect(profile.uid).toBe("uid-abc");
  });

  it("maps email", () => {
    const ts = Timestamp.fromDate(new Date("2024-03-01T12:00:00Z"));
    const profile = firebaseToUserProfile("uid-abc", {
      email: "user@example.com",
      createdAt: ts,
    });
    expect(profile.email).toBe("user@example.com");
  });

  it("maps displayName when present", () => {
    const ts = Timestamp.fromDate(new Date("2024-03-01T12:00:00Z"));
    const profile = firebaseToUserProfile("uid-abc", {
      displayName: "Alice",
      email: "alice@example.com",
      createdAt: ts,
    });
    expect(profile.displayName).toBe("Alice");
  });

  it("maps displayName as undefined when absent", () => {
    const ts = Timestamp.fromDate(new Date("2024-03-01T12:00:00Z"));
    const profile = firebaseToUserProfile("uid-abc", {
      email: "noname@example.com",
      createdAt: ts,
    });
    expect(profile.displayName).toBeUndefined();
  });

  it("converts Timestamp to Date", () => {
    const date = new Date("2024-06-15T08:30:00Z");
    const ts = Timestamp.fromDate(date);
    const profile = firebaseToUserProfile("uid-abc", {
      email: "a@b.com",
      createdAt: ts,
    });
    expect(profile.createdAt.toISOString()).toBe(date.toISOString());
  });

  it("falls back to current time when createdAt is null", () => {
    const before = Date.now();
    const profile = firebaseToUserProfile("uid-abc", {
      email: "a@b.com",
      createdAt: null,
    });
    const after = Date.now();
    expect(profile.createdAt.getTime()).toBeGreaterThanOrEqual(before);
    expect(profile.createdAt.getTime()).toBeLessThanOrEqual(after);
  });
});

describe("userProfileToFirebase", () => {
  it("maps email", () => {
    const profile = {
      displayName: undefined,
      email: "test@example.com",
      createdAt: new Date("2024-01-01T00:00:00Z"),
    };
    const data = userProfileToFirebase(profile);
    expect(data.email).toBe("test@example.com");
  });

  it("includes displayName when defined", () => {
    const profile = {
      displayName: "Bob",
      email: "bob@example.com",
      createdAt: new Date("2024-01-01T00:00:00Z"),
    };
    const data = userProfileToFirebase(profile);
    expect(data.displayName).toBe("Bob");
  });

  it("omits displayName when undefined", () => {
    const profile = {
      displayName: undefined,
      email: "anon@example.com",
      createdAt: new Date("2024-01-01T00:00:00Z"),
    };
    const data = userProfileToFirebase(profile);
    expect(data.displayName).toBeUndefined();
    expect("displayName" in data).toBe(false);
  });

  it("converts Date to Timestamp", () => {
    const date = new Date("2025-07-04T12:00:00Z");
    const profile = {
      displayName: undefined,
      email: "a@b.com",
      createdAt: date,
    };
    const data = userProfileToFirebase(profile);
    expect(data.createdAt.toDate().toISOString()).toBe(date.toISOString());
  });
});
