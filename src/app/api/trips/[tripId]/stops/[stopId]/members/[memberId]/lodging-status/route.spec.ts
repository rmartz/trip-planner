import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { X_USER_ID_HEADER } from "@/lib/constants";
import { PlannerOnlyError } from "@/services/errors";

vi.mock("@/services/lodging", () => ({
  setMemberSortedOwnLodging: vi.fn(),
}));

import { setMemberSortedOwnLodging } from "@/services/lodging";
import { PUT } from "./route";

function makeParams(tripId: string, stopId: string, memberId: string) {
  return { params: Promise.resolve({ tripId, stopId, memberId }) };
}

function makePutRequest(
  uid: string | undefined,
  body: unknown,
  options: { malformedJson?: boolean } = {},
) {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (uid !== undefined) headers.set(X_USER_ID_HEADER, uid);
  return new NextRequest(
    "http://localhost/api/trips/trip-1/stops/stop-1/members/member-1/lodging-status",
    {
      method: "PUT",
      headers,
      body: options.malformedJson ? "not-json" : JSON.stringify(body),
    },
  );
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("PUT /api/trips/[tripId]/stops/[stopId]/members/[memberId]/lodging-status", () => {
  it("returns 401 when x-user-id header is absent", async () => {
    const req = makePutRequest(undefined, { sortedOwn: true });
    const resp = await PUT(req, makeParams("trip-1", "stop-1", "member-1"));
    expect(resp.status).toBe(401);
  });

  it("returns 400 when sortedOwn is not a boolean", async () => {
    const req = makePutRequest("planner-uid", { sortedOwn: "yes" });
    const resp = await PUT(req, makeParams("trip-1", "stop-1", "member-1"));
    expect(resp.status).toBe(400);
  });

  it("returns 400 when sortedOwn is missing", async () => {
    const req = makePutRequest("planner-uid", {});
    const resp = await PUT(req, makeParams("trip-1", "stop-1", "member-1"));
    expect(resp.status).toBe(400);
  });

  it("returns 403 when service throws PlannerOnlyError", async () => {
    vi.mocked(setMemberSortedOwnLodging).mockRejectedValue(
      new PlannerOnlyError(),
    );
    const req = makePutRequest("guest-uid", { sortedOwn: true });
    const resp = await PUT(req, makeParams("trip-1", "stop-1", "member-1"));
    expect(resp.status).toBe(403);
  });

  it("returns 200 with ok:true on success", async () => {
    vi.mocked(setMemberSortedOwnLodging).mockResolvedValue();
    const req = makePutRequest("planner-uid", { sortedOwn: true });
    const resp = await PUT(req, makeParams("trip-1", "stop-1", "member-1"));
    expect(resp.status).toBe(200);
    const body = (await resp.json()) as { ok: boolean };
    expect(body.ok).toBe(true);
  });

  it("calls setMemberSortedOwnLodging with correct arguments", async () => {
    vi.mocked(setMemberSortedOwnLodging).mockResolvedValue();
    const req = makePutRequest("planner-uid", { sortedOwn: false });
    await PUT(req, makeParams("trip-1", "stop-1", "member-1"));
    expect(setMemberSortedOwnLodging).toHaveBeenCalledWith(
      "planner-uid",
      "trip-1",
      "stop-1",
      "member-1",
      false,
    );
  });
});
