import { describe, expect, it } from "vitest";
import {
  firebaseToNonAccountMember,
  nonAccountMemberToFirebase,
} from "./non-account-member";

describe("firebaseToNonAccountMember — maps ids from arguments", () => {
  it("maps nonAccountMemberId from argument", () => {
    const record = firebaseToNonAccountMember("member-99", "trip-1", {
      name: "Alice",
      proxiedBy: "",
      proxiedByName: "",
      claimToken: "tok",
    });
    expect(record.nonAccountMemberId).toBe("member-99");
  });

  it("maps tripId from argument", () => {
    const record = firebaseToNonAccountMember("member-1", "trip-42", {
      name: "Alice",
      proxiedBy: "",
      proxiedByName: "",
      claimToken: "tok",
    });
    expect(record.tripId).toBe("trip-42");
  });
});

describe("firebaseToNonAccountMember — maps string fields", () => {
  it("maps name from data", () => {
    const record = firebaseToNonAccountMember("member-1", "trip-1", {
      name: "Bob",
      proxiedBy: "",
      proxiedByName: "",
      claimToken: "tok",
    });
    expect(record.name).toBe("Bob");
  });

  it("maps proxiedBy from data", () => {
    const record = firebaseToNonAccountMember("member-1", "trip-1", {
      name: "Alice",
      proxiedBy: "user-7",
      proxiedByName: "",
      claimToken: "tok",
    });
    expect(record.proxiedBy).toBe("user-7");
  });

  it("maps claimToken from data", () => {
    const record = firebaseToNonAccountMember("member-1", "trip-1", {
      name: "Alice",
      proxiedBy: "",
      proxiedByName: "",
      claimToken: "secret-token",
    });
    expect(record.claimToken).toBe("secret-token");
  });
});

describe("firebaseToNonAccountMember — claimedBy optional field", () => {
  it("maps claimedBy when present", () => {
    const record = firebaseToNonAccountMember("member-1", "trip-1", {
      name: "Alice",
      proxiedBy: "",
      proxiedByName: "",
      claimToken: "tok",
      claimedBy: "user-5",
    });
    expect(record.claimedBy).toBe("user-5");
  });

  it("leaves claimedBy undefined when absent", () => {
    const record = firebaseToNonAccountMember("member-1", "trip-1", {
      name: "Alice",
      proxiedBy: "",
      proxiedByName: "",
      claimToken: "tok",
    });
    expect(record.claimedBy).toBeUndefined();
  });
});

describe("nonAccountMemberToFirebase — round-trips fields", () => {
  it("serializes name", () => {
    const data = nonAccountMemberToFirebase({
      name: "Charlie",
      proxiedBy: "",
      proxiedByName: "",
      claimToken: "tok",
      claimedBy: undefined,
    });
    expect(data.name).toBe("Charlie");
  });

  it("serializes claimedBy when defined", () => {
    const data = nonAccountMemberToFirebase({
      name: "Alice",
      proxiedBy: "",
      proxiedByName: "",
      claimToken: "tok",
      claimedBy: "user-3",
    });
    expect(data.claimedBy).toBe("user-3");
  });

  it("serializes claimedBy as undefined when absent", () => {
    const data = nonAccountMemberToFirebase({
      name: "Alice",
      proxiedBy: "",
      proxiedByName: "",
      claimToken: "tok",
      claimedBy: undefined,
    });
    expect(data.claimedBy).toBeUndefined();
  });
});
