import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/firebase/admin", () => ({ getAdminFirestore: vi.fn() }));

import { getAdminFirestore } from "@/lib/firebase/admin";
import { writeNotificationsForLegDeletion } from "../legs";

describe("writeNotificationsForLegDeletion — no affected guests", () => {
  it("writes no notifications when no transportation entries reference the leg", async () => {
    const notificationAdd = vi.fn();
    const userDoc = vi.fn(() => ({
      collection: vi.fn(() => ({ add: notificationAdd })),
      update: vi.fn(),
    }));
    const tripRef = {
      collection: vi.fn((name: string) => {
        if (name === "transportation")
          return {
            where: vi.fn(() => ({
              get: vi.fn().mockResolvedValue({ docs: [] }),
            })),
          };
        return {};
      }),
    };
    const mockDb = {
      collection: vi.fn((name: string) => {
        if (name === "trips") return { doc: vi.fn(() => tripRef) };
        if (name === "users") return { doc: userDoc };
        return {};
      }),
    };
    vi.mocked(getAdminFirestore).mockReturnValue(
      mockDb as unknown as ReturnType<typeof getAdminFirestore>,
    );

    await writeNotificationsForLegDeletion(
      "trip-1",
      "leg-1",
      "Lyon → Marseille",
    );

    expect(notificationAdd).not.toHaveBeenCalled();
  });
});

describe("writeNotificationsForLegDeletion — with affected guests", () => {
  const notificationAdd = vi.fn();
  const userUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    const tripRef = {
      collection: vi.fn((name: string) => {
        if (name === "transportation")
          return {
            where: vi.fn(() => ({
              get: vi.fn().mockResolvedValue({
                docs: [
                  { data: () => ({ uid: "guest-a" }) },
                  { data: () => ({ uid: "guest-b" }) },
                ],
              }),
            })),
          };
        return {};
      }),
    };
    const mockDb = {
      collection: vi.fn((name: string) => {
        if (name === "trips") return { doc: vi.fn(() => tripRef) };
        if (name === "users")
          return {
            doc: vi.fn(() => ({
              collection: vi.fn(() => ({ add: notificationAdd })),
              update: userUpdate,
            })),
          };
        return {};
      }),
    };
    vi.mocked(getAdminFirestore).mockReturnValue(
      mockDb as unknown as ReturnType<typeof getAdminFirestore>,
    );
  });

  it("writes one notification per unique affected guest", async () => {
    notificationAdd.mockResolvedValue({ id: "notif-1" });
    userUpdate.mockResolvedValue(undefined);

    await writeNotificationsForLegDeletion(
      "trip-1",
      "leg-1",
      "Lyon → Marseille",
    );

    expect(notificationAdd).toHaveBeenCalledTimes(2);
  });

  it("increments unread count for each affected guest", async () => {
    notificationAdd.mockResolvedValue({ id: "notif-1" });
    userUpdate.mockResolvedValue(undefined);

    await writeNotificationsForLegDeletion(
      "trip-1",
      "leg-1",
      "Lyon → Marseille",
    );

    expect(userUpdate).toHaveBeenCalledTimes(2);
    expect(userUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ unreadCount: expect.anything() }),
    );
  });

  it("includes the tripId in each notification", async () => {
    notificationAdd.mockResolvedValue({ id: "notif-1" });
    userUpdate.mockResolvedValue(undefined);

    await writeNotificationsForLegDeletion(
      "trip-1",
      "leg-1",
      "Lyon → Marseille",
    );

    expect(notificationAdd).toHaveBeenCalledWith(
      expect.objectContaining({ tripId: "trip-1" }),
    );
  });

  it("deduplicates when the same guest appears multiple times", async () => {
    const tripRef = {
      collection: vi.fn((name: string) => {
        if (name === "transportation")
          return {
            where: vi.fn(() => ({
              get: vi.fn().mockResolvedValue({
                docs: [
                  { data: () => ({ uid: "guest-a" }) },
                  { data: () => ({ uid: "guest-a" }) },
                ],
              }),
            })),
          };
        return {};
      }),
    };
    const mockDb = {
      collection: vi.fn((name: string) => {
        if (name === "trips") return { doc: vi.fn(() => tripRef) };
        if (name === "users")
          return {
            doc: vi.fn(() => ({
              collection: vi.fn(() => ({ add: notificationAdd })),
              update: userUpdate,
            })),
          };
        return {};
      }),
    };
    vi.mocked(getAdminFirestore).mockReturnValue(
      mockDb as unknown as ReturnType<typeof getAdminFirestore>,
    );

    await writeNotificationsForLegDeletion(
      "trip-1",
      "leg-1",
      "Lyon → Marseille",
    );

    expect(notificationAdd).toHaveBeenCalledTimes(1);
  });
});
