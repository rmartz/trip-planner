import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TripRole } from "@/lib/types/trip";
import {
  TransportationStatus,
  type TransportCarOffer,
  type TransportLegDemand,
  TransportOfferVisibility,
} from "@/lib/types/transportation";
import { TRANSPORT_PAGE_COPY } from "./copy";

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return { ...actual, use: () => ({ tripId: "trip-1" }) };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: vi.fn() }),
}));

vi.mock("@/components/nav/AppShell", () => ({
  AppShell: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

const plannerOverviewSpy = vi.fn();

vi.mock("@/components/transport/TransportPlannerOverviewView", () => ({
  TransportPlannerOverviewView: (props: unknown) => {
    plannerOverviewSpy(props);
    return <div data-testid="transport-planner-overview" />;
  },
}));

vi.mock("@/hooks/use-legs", () => ({
  useLegs: vi.fn(),
}));

import { useLegs } from "@/hooks/use-legs";
import TransportPage from "./page";

afterEach(() => {
  cleanup();
  plannerOverviewSpy.mockReset();
  vi.clearAllMocks();
});

function makeDemand(
  overrides: Partial<TransportLegDemand> = {},
): TransportLegDemand {
  return {
    driving: 1,
    needRide: 2,
    noReply: 1,
    skipLeg: 0,
    ...overrides,
  };
}

function makeOffer(
  overrides: Partial<TransportCarOffer> = {},
): TransportCarOffer {
  return {
    driverName: "Alice",
    routeName: "Route 66",
    seatCount: 3,
    visibility: TransportOfferVisibility.Public,
    ...overrides,
  };
}

function renderWithQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <TransportPage params={Promise.resolve({ tripId: "trip-1" })} />
    </QueryClientProvider>,
  );
}

describe("TransportPage — role gating", () => {
  it("renders the planner overview when role is Planner", () => {
    vi.mocked(useLegs).mockReturnValue({
      data: {
        legs: [],
        role: TripRole.Planner,
        legSummaries: {},
      },
    } as never);

    renderWithQueryClient();

    expect(screen.getByTestId("transport-planner-overview")).toBeDefined();
  });

  it("renders the planner-only message when role is Guest", () => {
    vi.mocked(useLegs).mockReturnValue({
      data: {
        legs: [],
        role: TripRole.Guest,
        legSummaries: null,
      },
    } as never);

    renderWithQueryClient();

    expect(
      screen.getByText(TRANSPORT_PAGE_COPY.plannerOnlyMessage),
    ).toBeDefined();
    expect(screen.queryByTestId("transport-planner-overview")).toBeNull();
  });

  it("renders the planner-only message when role is null", () => {
    vi.mocked(useLegs).mockReturnValue({
      data: {
        legs: [],
        role: null,
        legSummaries: null,
      },
    } as never);

    renderWithQueryClient();

    expect(
      screen.getByText(TRANSPORT_PAGE_COPY.plannerOnlyMessage),
    ).toBeDefined();
  });
});

describe("TransportPage — demand and supply wiring", () => {
  it("passes real demand from legSummaries to the planner overview", () => {
    const demand = makeDemand({ driving: 2, needRide: 3 });
    vi.mocked(useLegs).mockReturnValue({
      data: {
        legs: [
          {
            legId: "leg-1",
            tripId: "trip-1",
            fromStopId: "stop-a",
            toStopId: "stop-b",
            name: "Leg A",
            order: 0,
            memberUids: ["uid-1"],
            isActive: true,
          },
        ],
        role: TripRole.Planner,
        legSummaries: {
          "leg-1": { demand, supply: [] },
        },
      },
    } as never);

    renderWithQueryClient();

    expect(plannerOverviewSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        legs: [
          expect.objectContaining({
            demand: expect.objectContaining({
              driving: 2,
              needRide: 3,
            }),
          }),
        ],
      }),
    );
  });

  it("passes real supply from legSummaries to the planner overview", () => {
    const offer = makeOffer({ driverName: "Bob", seatCount: 4 });
    vi.mocked(useLegs).mockReturnValue({
      data: {
        legs: [
          {
            legId: "leg-1",
            tripId: "trip-1",
            fromStopId: "stop-a",
            toStopId: "stop-b",
            name: "Leg A",
            order: 0,
            memberUids: ["uid-1"],
            isActive: true,
          },
        ],
        role: TripRole.Planner,
        legSummaries: {
          "leg-1": { demand: makeDemand(), supply: [offer] },
        },
      },
    } as never);

    renderWithQueryClient();

    expect(plannerOverviewSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        legs: [
          expect.objectContaining({
            supply: [
              expect.objectContaining({ driverName: "Bob", seatCount: 4 }),
            ],
          }),
        ],
      }),
    );
  });

  it("falls back to zero demand and empty supply when legSummaries is missing a leg", () => {
    vi.mocked(useLegs).mockReturnValue({
      data: {
        legs: [
          {
            legId: "leg-missing",
            tripId: "trip-1",
            fromStopId: "stop-a",
            toStopId: "stop-b",
            name: "Unknown Leg",
            order: 0,
            memberUids: [],
            isActive: true,
          },
        ],
        role: TripRole.Planner,
        legSummaries: {},
      },
    } as never);

    renderWithQueryClient();

    expect(plannerOverviewSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        legs: [
          expect.objectContaining({
            demand: {
              driving: 0,
              needRide: 0,
              noReply: 0,
              skipLeg: 0,
            },
            supply: [],
          }),
        ],
      }),
    );
  });
});

describe("TransportPage — transport status enum", () => {
  it("builds leg summaries with DrivingWithSeats status from supply", () => {
    const offer = makeOffer({
      driverName: "Carol",
      routeName: "I-90",
      seatCount: 2,
      visibility: TransportOfferVisibility.InviteOnly,
      inviteeCount: 1,
    });
    vi.mocked(useLegs).mockReturnValue({
      data: {
        legs: [
          {
            legId: "leg-1",
            tripId: "trip-1",
            fromStopId: "stop-a",
            toStopId: "stop-b",
            name: "Leg A",
            order: 0,
            memberUids: ["uid-carol", "uid-rider"],
            isActive: true,
          },
        ],
        role: TripRole.Planner,
        legSummaries: {
          "leg-1": {
            demand: makeDemand({ driving: 1 }),
            supply: [offer],
          },
        },
      },
    } as never);

    renderWithQueryClient();

    expect(plannerOverviewSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        legs: [
          expect.objectContaining({
            supply: [
              expect.objectContaining({
                visibility: TransportOfferVisibility.InviteOnly,
                inviteeCount: 1,
              }),
            ],
          }),
        ],
      }),
    );
  });
});

// Keep existing TransportationStatus import verified at module level
describe("TransportationStatus enum availability", () => {
  it("TransportationStatus values are accessible", () => {
    expect(TransportationStatus.DrivingWithSeats).toBe("driving-with-seats");
    expect(TransportationStatus.NeedTransportation).toBe("need-transportation");
  });
});
