import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import type { Leg } from "@/lib/types/trip";
import { TripRole } from "@/lib/types/trip";
import { X_USER_ID_HEADER } from "@/lib/constants";

vi.mock("@/services/legs", () => ({
  getLegsForTrip: vi.fn(),
}));

vi.mock("@/services/trips", () => ({
  getTripMemberRole: vi.fn(),
  getTripMemberUids: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/services/transportation", () => ({
  computeLegSummary: vi.fn(() => ({
    demand: { driving: 0, needRide: 0, noReply: 0, skipLeg: 0 },
    supply: [],
  })),
  getTransportationEntriesForTrip: vi.fn().mockResolvedValue([]),
  resolveDriverDisplayNames: vi.fn().mockResolvedValue({}),
}));

import { getLegsForTrip } from "@/services/legs";
import { getTripMemberRole, getTripMemberUids } from "@/services/trips";
import {
  computeLegSummary,
  getTransportationEntriesForTrip,
  resolveDriverDisplayNames,
} from "@/services/transportation";
import { TransportationStatus } from "@/lib/types/transportation";
import type { TransportationEntry } from "@/lib/types/transportation";
import { GET } from "./route";

function makeLeg(overrides: Partial<Leg> = {}): Leg {
  return {
    legId: "leg-1",
    tripId: "trip-1",
    fromStopId: "stop-1",
    toStopId: "stop-2",
    name: "London to Paris",
    order: 0,
    memberUids: ["uid-planner"],
    isActive: true,
    ...overrides,
  };
}

function makeRequest(uid: string | undefined, tripId = "trip-1") {
  const headers = new Headers();
  if (uid !== undefined) headers.set(X_USER_ID_HEADER, uid);
  return new NextRequest(
    `http://localhost/api/trips/${tripId}/transport/summaries`,
    { headers },
  );
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(computeLegSummary).mockReturnValue({
    demand: { driving: 0, needRide: 0, noReply: 0, skipLeg: 0 },
    supply: [],
  });
  vi.mocked(getLegsForTrip).mockResolvedValue([]);
  vi.mocked(resolveDriverDisplayNames).mockResolvedValue({});
  vi.mocked(getTransportationEntriesForTrip).mockResolvedValue([]);
  vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Planner);
  vi.mocked(getTripMemberUids).mockResolvedValue([]);
});

describe("GET /api/trips/[tripId]/transport/summaries", () => {
  it("returns 401 when x-user-id header is absent", async () => {
    const response = await GET(makeRequest(undefined), {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(401);
  });

  it("returns 403 when user is not a trip member", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(undefined);

    const response = await GET(makeRequest("uid-stranger"), {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(403);
    const data = (await response.json()) as { error: string };
    expect(data.error).toBe("Forbidden");
  });

  it("returns 403 when user is a Guest", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Guest);

    const response = await GET(makeRequest("uid-guest"), {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(403);
    const data = (await response.json()) as { error: string };
    expect(data.error).toBe("Forbidden");
  });

  it("does not fetch legs or transportation data for non-members", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(undefined);

    await GET(makeRequest("uid-stranger"), {
      params: Promise.resolve({ tripId: "trip-1" }),
    });

    expect(vi.mocked(getLegsForTrip)).not.toHaveBeenCalled();
    expect(vi.mocked(getTransportationEntriesForTrip)).not.toHaveBeenCalled();
  });

  it("returns summaries array for planners", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Planner);
    vi.mocked(getLegsForTrip).mockResolvedValue([makeLeg({ legId: "leg-1" })]);
    vi.mocked(computeLegSummary).mockReturnValue({
      demand: { driving: 2, needRide: 3, noReply: 1, skipLeg: 0 },
      supply: [],
    });

    const response = await GET(makeRequest("uid-planner"), {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(200);

    const data = (await response.json()) as {
      summaries: {
        legId: string;
        demand: { driving: number; needRide: number };
      }[];
    };
    expect(data.summaries).toHaveLength(1);
    expect(data.summaries[0]!.legId).toBe("leg-1");
    expect(data.summaries[0]!.demand.driving).toBe(2);
    expect(data.summaries[0]!.demand.needRide).toBe(3);
  });

  it("fetches transportation entries for the correct tripId", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Planner);
    vi.mocked(getLegsForTrip).mockResolvedValue([]);

    await GET(makeRequest("uid-planner", "trip-xyz"), {
      params: Promise.resolve({ tripId: "trip-xyz" }),
    });

    expect(vi.mocked(getTransportationEntriesForTrip)).toHaveBeenCalledWith(
      "trip-xyz",
    );
  });

  it("uses live trip member UIDs, not stale per-leg memberUids", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Planner);
    vi.mocked(getTripMemberUids).mockResolvedValue(["uid-original", "uid-new"]);
    vi.mocked(getLegsForTrip).mockResolvedValue([
      makeLeg({ legId: "leg-1", memberUids: ["uid-original"] }),
    ]);
    vi.mocked(getTransportationEntriesForTrip).mockResolvedValue([]);

    await GET(makeRequest("uid-planner"), {
      params: Promise.resolve({ tripId: "trip-1" }),
    });

    expect(vi.mocked(computeLegSummary)).toHaveBeenCalledWith(
      ["uid-original", "uid-new"],
      [],
      expect.any(Object),
    );
  });

  it("passes only entries matching each leg's legId to computeLegSummary", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Planner);
    vi.mocked(getTripMemberUids).mockResolvedValue(["uid-1", "uid-2"]);
    vi.mocked(getLegsForTrip).mockResolvedValue([
      makeLeg({ legId: "leg-A" }),
      makeLeg({ legId: "leg-B" }),
    ]);

    const entryA: TransportationEntry = {
      entryId: "entry-1",
      legId: "leg-A",
      uid: "uid-1",
      status: TransportationStatus.Driving,
      routeName: "Route A",
    };
    const entryB: TransportationEntry = {
      entryId: "entry-2",
      legId: "leg-B",
      uid: "uid-2",
      status: TransportationStatus.Driving,
      routeName: "Route B",
    };
    vi.mocked(getTransportationEntriesForTrip).mockResolvedValue([
      entryA,
      entryB,
    ]);

    await GET(makeRequest("uid-planner"), {
      params: Promise.resolve({ tripId: "trip-1" }),
    });

    const calls = vi.mocked(computeLegSummary).mock.calls;
    expect(calls[0]![1]).toEqual([entryA]);
    expect(calls[1]![1]).toEqual([entryB]);
  });

  it("includes leg data in each summary", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Planner);
    vi.mocked(getLegsForTrip).mockResolvedValue([
      makeLeg({ legId: "leg-1", name: "London to Paris" }),
    ]);

    const response = await GET(makeRequest("uid-planner"), {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    const data = (await response.json()) as {
      summaries: { legId: string; leg: { name: string } }[];
    };

    expect(data.summaries[0]!.leg.name).toBe("London to Paris");
  });

  it("includes role in the 200 response", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Planner);

    const response = await GET(makeRequest("uid-planner"), {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(200);

    const data = (await response.json()) as { role: TripRole };
    expect(data.role).toBe(TripRole.Planner);
  });
});
