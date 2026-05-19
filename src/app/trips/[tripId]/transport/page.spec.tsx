import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TripRole } from "@/lib/types/trip";
import {
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

vi.mock("@/hooks/use-transport-summaries", () => ({
  useTransportSummaries: vi.fn(),
}));

import { useLegs } from "@/hooks/use-legs";
import { useTransportSummaries } from "@/hooks/use-transport-summaries";
import TransportPage from "./page";

afterEach(() => {
  cleanup();
  plannerOverviewSpy.mockReset();
  vi.clearAllMocks();
});

function makeLegEntry(legId = "leg-1") {
  return {
    legId,
    tripId: "trip-1",
    fromStopId: "stop-a",
    toStopId: "stop-b",
    name: "Leg A",
    order: 0,
    memberUids: ["uid-1"],
    isActive: true,
  };
}

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
      data: { legs: [], role: TripRole.Planner },
      isLoading: false,
    } as never);
    vi.mocked(useTransportSummaries).mockReturnValue({
      data: [],
      isError: false,
      isLoading: false,
    } as never);

    renderWithQueryClient();

    expect(screen.getByTestId("transport-planner-overview")).toBeDefined();
    expect(useTransportSummaries).toHaveBeenCalledWith("trip-1", {
      enabled: true,
    });
  });

  it("renders the planner-only message when role is Guest", () => {
    vi.mocked(useLegs).mockReturnValue({
      data: { legs: [], role: TripRole.Guest },
      isLoading: false,
    } as never);
    vi.mocked(useTransportSummaries).mockReturnValue({
      data: undefined,
      isError: false,
      isLoading: false,
    } as never);

    renderWithQueryClient();

    expect(
      screen.getByText(TRANSPORT_PAGE_COPY.plannerOnlyMessage),
    ).toBeDefined();
    expect(screen.queryByTestId("transport-planner-overview")).toBeNull();
    expect(useTransportSummaries).toHaveBeenCalledWith("trip-1", {
      enabled: false,
    });
  });

  it("renders loading while legs data is not ready", () => {
    vi.mocked(useLegs).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as never);
    vi.mocked(useTransportSummaries).mockReturnValue({
      data: undefined,
      isError: false,
      isLoading: false,
    } as never);

    renderWithQueryClient();

    expect(screen.getByText(TRANSPORT_PAGE_COPY.loadingMessage)).toBeDefined();
    expect(useTransportSummaries).toHaveBeenCalledWith("trip-1", {
      enabled: false,
    });
  });
});

describe("TransportPage — demand and supply wiring", () => {
  it("passes demand from summaries to the planner overview", () => {
    const demand = makeDemand({ driving: 2, needRide: 3 });
    vi.mocked(useLegs).mockReturnValue({
      data: { legs: [makeLegEntry()], role: TripRole.Planner },
      isLoading: false,
    } as never);
    vi.mocked(useTransportSummaries).mockReturnValue({
      data: [
        {
          legId: "leg-1",
          leg: makeLegEntry(),
          demand,
          supply: [],
        },
      ],
      isError: false,
      isLoading: false,
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

  it("passes supply from summaries to the planner overview", () => {
    const offer = makeOffer({ driverName: "Bob", seatCount: 4 });
    vi.mocked(useLegs).mockReturnValue({
      data: { legs: [makeLegEntry()], role: TripRole.Planner },
      isLoading: false,
    } as never);
    vi.mocked(useTransportSummaries).mockReturnValue({
      data: [
        {
          legId: "leg-1",
          leg: makeLegEntry(),
          demand: makeDemand(),
          supply: [offer],
        },
      ],
      isError: false,
      isLoading: false,
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

  it("renders loading while summaries are being fetched for planners", () => {
    vi.mocked(useLegs).mockReturnValue({
      data: { legs: [makeLegEntry()], role: TripRole.Planner },
      isLoading: false,
    } as never);
    vi.mocked(useTransportSummaries).mockReturnValue({
      data: undefined,
      isError: false,
      isLoading: true,
    } as never);

    renderWithQueryClient();

    expect(screen.getByText(TRANSPORT_PAGE_COPY.loadingMessage)).toBeDefined();
    expect(screen.queryByTestId("transport-planner-overview")).toBeNull();
  });

  it("passes InviteOnly supply with inviteeCount to the planner overview", () => {
    const offer = makeOffer({
      driverName: "Carol",
      routeName: "I-90",
      seatCount: 2,
      visibility: TransportOfferVisibility.InviteOnly,
      inviteeCount: 1,
    });
    vi.mocked(useLegs).mockReturnValue({
      data: { legs: [makeLegEntry()], role: TripRole.Planner },
      isLoading: false,
    } as never);
    vi.mocked(useTransportSummaries).mockReturnValue({
      data: [
        {
          legId: "leg-1",
          leg: makeLegEntry(),
          demand: makeDemand({ driving: 1 }),
          supply: [offer],
        },
      ],
      isError: false,
      isLoading: false,
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

  it("renders an error message when planner summaries fail to load", () => {
    vi.mocked(useLegs).mockReturnValue({
      data: { legs: [makeLegEntry()], role: TripRole.Planner },
      isLoading: false,
    } as never);
    vi.mocked(useTransportSummaries).mockReturnValue({
      data: undefined,
      isError: true,
      isLoading: false,
    } as never);

    renderWithQueryClient();

    expect(
      screen.getByText(TRANSPORT_PAGE_COPY.summaryErrorMessage),
    ).toBeDefined();
    expect(screen.queryByTestId("transport-planner-overview")).toBeNull();
  });
});
