import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LodgingGuestOfferStatus } from "@/components/lodging/LodgingGuestOverviewView";
import { LodgingStatus } from "@/lib/types/lodging";
import { type Stop, TripRole } from "@/lib/types/trip";

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");

  return {
    ...actual,
    use: () => ({ tripId: "trip-1" }),
  };
});

vi.mock("@/hooks/use-auth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/hooks/use-stops", () => ({
  useStops: vi.fn(),
}));

vi.mock("@/hooks/use-trip-members", () => ({
  tripMembersQueryOptions: vi.fn(() => ({
    queryFn: vi.fn(),
    queryKey: ["trip-members", "trip-1"],
  })),
}));

vi.mock("@/hooks/use-stop-lodging", () => ({
  stopLodgingQueryOptions: vi.fn((_tripId: string, stopId: string) => ({
    queryFn: vi.fn(),
    queryKey: ["lodging", "trip-1", stopId],
  })),
}));

vi.mock("@/components/nav/AppShell", () => ({
  AppShell: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: vi.fn() }),
}));

const guestOverviewSpy = vi.fn();

vi.mock("@/components/lodging/LodgingGuestOverviewView", () => ({
  LodgingGuestOfferStatus: {
    Accepted: "accepted",
    Declined: "declined",
    Pending: "pending",
  },
  LodgingGuestOverviewView: (props: unknown) => {
    guestOverviewSpy(props);
    return <div data-testid="lodging-guest-overview" />;
  },
}));

vi.mock("@/components/lodging/LodgingPlannerOverviewView", () => ({
  LodgingPlannerOverviewView: () => (
    <div data-testid="lodging-planner-overview" />
  ),
}));

vi.mock("@/components/lodging/LodgingHostGuestPicker", () => ({
  LodgingHostGuestPicker: ({ stopId }: { stopId: string }) => (
    <div data-testid={`picker-${stopId}`} />
  ),
}));

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual<typeof import("@tanstack/react-query")>(
    "@tanstack/react-query",
  );

  return {
    ...actual,
    useQueries: vi.fn(),
    useQuery: vi.fn(),
  };
});

import { useAuth } from "@/hooks/use-auth";
import { useStops } from "@/hooks/use-stops";
import LodgingPage from "./page";
import { useQueries, useQuery } from "@tanstack/react-query";

afterEach(() => {
  cleanup();
  guestOverviewSpy.mockReset();
  vi.clearAllMocks();
});

function makeStop(overrides: Partial<Stop> = {}): Stop {
  return {
    stopId: "stop-1",
    tripId: "trip-1",
    name: "Austin",
    startDate: new Date("2025-06-01T00:00:00.000Z"),
    endDate: new Date("2025-06-02T00:00:00.000Z"),
    order: 0,
    memberUids: ["uid-host", "uid-guest"],
    ...overrides,
  };
}

function renderWithQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <LodgingPage params={Promise.resolve({ tripId: "trip-1" })} />
    </QueryClientProvider>,
  );
}

describe("LodgingPage", () => {
  it("renders a host guest picker for stops where the current user has secured capacity", () => {
    vi.mocked(useAuth).mockReturnValue({
      loading: false,
      profile: undefined,
      user: { uid: "uid-host" },
    } as never);
    vi.mocked(useStops).mockReturnValue({
      data: {
        role: TripRole.Guest,
        stops: [makeStop()],
      },
    } as never);
    vi.mocked(useQuery).mockReturnValue({
      data: [],
    } as never);
    vi.mocked(useQueries).mockReturnValue([
      {
        data: [
          {
            uid: "uid-host",
            stopId: "stop-1",
            status: LodgingStatus.SecuredCapacity,
            updatedAt: new Date("2025-06-03T00:00:00.000Z"),
          },
        ],
      },
    ] as never);

    renderWithQueryClient();

    expect(screen.getByTestId("picker-stop-1")).toBeDefined();
  });

  it("passes visible secured-capacity offers through to the guest overview", () => {
    vi.mocked(useAuth).mockReturnValue({
      loading: false,
      profile: undefined,
      user: { uid: "uid-guest" },
    } as never);
    vi.mocked(useStops).mockReturnValue({
      data: {
        role: TripRole.Guest,
        stops: [makeStop()],
      },
    } as never);
    vi.mocked(useQuery).mockReturnValue({
      data: [
        {
          uid: "uid-host",
          displayName: "Alex",
        },
      ],
    } as never);
    vi.mocked(useQueries).mockReturnValue([
      {
        data: [
          {
            guestCount: 2,
            stopId: "stop-1",
            uid: "uid-host",
            status: LodgingStatus.SecuredCapacity,
            updatedAt: new Date("2025-06-03T00:00:00.000Z"),
          },
        ],
      },
    ] as never);

    renderWithQueryClient();

    expect(guestOverviewSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        stops: [
          expect.objectContaining({
            offers: [
              expect.objectContaining({
                bedCount: 2,
                hostName: "Alex",
                offerLabel: "Austin",
                status: LodgingGuestOfferStatus.Pending,
              }),
            ],
          }),
        ],
      }),
    );
  });
});
