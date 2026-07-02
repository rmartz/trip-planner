import { afterEach, describe, expect, it, vi } from "vitest";
import {
  publishSchedule,
  PublishScheduleForbiddenError,
} from "./use-publish-schedule";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("publishSchedule", () => {
  it("POSTs the ordered activity ids to the publish route", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
    } as unknown as Response);

    await publishSchedule({
      tripId: "trip-7",
      stopId: "stop-3",
      orderedActivityIds: ["a-2", "a-1"],
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/trips/trip-7/schedule/stop-3/publish",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedActivityIds: ["a-2", "a-1"] }),
      },
    );
  });

  it("throws PublishScheduleForbiddenError when the response is 403", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 403,
    } as unknown as Response);

    await expect(
      publishSchedule({
        tripId: "trip-7",
        stopId: "stop-3",
        orderedActivityIds: ["a-1"],
      }),
    ).rejects.toBeInstanceOf(PublishScheduleForbiddenError);
  });

  it("throws a generic error on other non-ok responses", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
    } as unknown as Response);

    await expect(
      publishSchedule({
        tripId: "trip-7",
        stopId: "stop-3",
        orderedActivityIds: ["a-1"],
      }),
    ).rejects.toThrow("Failed to publish schedule (500)");
  });
});
