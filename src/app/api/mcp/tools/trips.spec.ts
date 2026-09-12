import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Trip } from "@/lib/types/trip";

vi.mock("@/services/trips", () => ({
  createTripForUser: vi.fn(),
  getTripsForUser: vi.fn(),
}));

import { createTripForUser, getTripsForUser } from "@/services/trips";
import { createTripTool, listTripsTool } from "./trips";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("create_trip tool", () => {
  it("creates the trip under the caller's identity, ignoring any argument uid", async () => {
    vi.mocked(createTripForUser).mockResolvedValue("trip-created");
    // A caller-supplied uid is not part of the schema; prove it cannot override
    // the resolved identity even when smuggled into the args object.
    const spoofedArgs = {
      name: "Alps",
      startDate: "2025-07-01",
      endDate: "2025-07-08",
      uid: "victim",
    } as unknown as Parameters<typeof createTripTool.handler>[0];

    await createTripTool.handler(spoofedArgs, { uid: "caller-uid" });

    expect(createTripForUser).toHaveBeenCalledWith(
      "caller-uid",
      "Alps",
      new Date(2025, 6, 1),
      new Date(2025, 6, 8),
    );
  });

  it("returns the new trip id in the result", async () => {
    vi.mocked(createTripForUser).mockResolvedValue("trip-created");

    const result = await createTripTool.handler(
      { name: "Alps", startDate: "2025-07-01", endDate: "2025-07-08" },
      { uid: "caller-uid" },
    );

    expect(result.content[0]).toEqual({
      type: "text",
      text: JSON.stringify({ tripId: "trip-created" }),
    });
  });
});

describe("list_trips tool", () => {
  it("returns the caller's trips as a serialized summary", async () => {
    const trip: Trip = {
      tripId: "trip-1",
      name: "Alps",
      startDate: new Date(2025, 6, 1),
      endDate: new Date(2025, 6, 8),
      createdAt: new Date(2025, 5, 1),
      createdBy: "caller-uid",
      memberUids: ["caller-uid"],
      inviteToken: "tok",
    };
    vi.mocked(getTripsForUser).mockResolvedValue([trip]);

    const result = await listTripsTool.handler({}, { uid: "caller-uid" });

    expect(getTripsForUser).toHaveBeenCalledWith("caller-uid");
    expect(result.content[0]).toEqual({
      type: "text",
      text: JSON.stringify(
        [
          {
            tripId: "trip-1",
            name: "Alps",
            startDate: "2025-07-01",
            endDate: "2025-07-08",
          },
        ],
        undefined,
        2,
      ),
    });
  });
});
