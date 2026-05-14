import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { TripList } from "./TripList";
import { TRIP_LIST_COPY } from "./TripList.copy";
import { PHASE_PILL_COPY } from "./PhasePill.copy";
import { TripPhase } from "@/lib/types/trip";
import type { Trip } from "@/lib/types/trip";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

vi.mock("@/hooks/use-trips");

import { useTrips } from "@/hooks/use-trips";

function makeTrip(overrides: Partial<Trip> = {}): Trip {
  return {
    tripId: "trip-1",
    name: "Paris Trip",
    startDate: new Date("2025-06-01T12:00:00Z"),
    endDate: new Date("2025-06-08T12:00:00Z"),
    createdAt: new Date("2025-01-01T12:00:00Z"),
    createdBy: "uid-x",
    memberUids: ["uid-x"],
    inviteToken: "tok-1",
    ...overrides,
  };
}

describe("TripList", () => {
  it("renders loading state", () => {
    vi.mocked(useTrips).mockReturnValue({
      isLoading: true,
      isError: false,
      data: undefined,
    } as unknown as ReturnType<typeof useTrips>);

    render(<TripList />);

    expect(screen.getByText(TRIP_LIST_COPY.loadingText)).toBeDefined();
  });

  it("renders error state", () => {
    vi.mocked(useTrips).mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
    } as unknown as ReturnType<typeof useTrips>);

    render(<TripList />);

    expect(screen.getByText(TRIP_LIST_COPY.errorText)).toBeDefined();
  });

  it("renders empty state heading", () => {
    vi.mocked(useTrips).mockReturnValue({
      isLoading: false,
      isError: false,
      data: [],
    } as unknown as ReturnType<typeof useTrips>);

    render(<TripList />);

    expect(screen.getByText(TRIP_LIST_COPY.emptyStateHeading)).toBeDefined();
  });

  it("renders create trip CTA in empty state", () => {
    vi.mocked(useTrips).mockReturnValue({
      isLoading: false,
      isError: false,
      data: [],
    } as unknown as ReturnType<typeof useTrips>);

    render(<TripList />);

    expect(screen.getByText(TRIP_LIST_COPY.createTripButton)).toBeDefined();
  });

  it("renders trip name in populated state", () => {
    vi.mocked(useTrips).mockReturnValue({
      isLoading: false,
      isError: false,
      data: [makeTrip({ name: "Alps Adventure" })],
    } as unknown as ReturnType<typeof useTrips>);

    render(<TripList />);

    expect(screen.getByText("Alps Adventure")).toBeDefined();
  });

  it("renders trip count in populated state", () => {
    vi.mocked(useTrips).mockReturnValue({
      isLoading: false,
      isError: false,
      data: [makeTrip(), makeTrip({ tripId: "trip-2", name: "Japan Trip" })],
    } as unknown as ReturnType<typeof useTrips>);

    render(<TripList />);

    expect(screen.getByText("2 trips")).toBeDefined();
  });

  it("renders the Planning phase pill on a trip card with one member", () => {
    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    vi.mocked(useTrips).mockReturnValue({
      isLoading: false,
      isError: false,
      data: [makeTrip({ memberUids: ["uid-x"], endDate: future })],
    } as unknown as ReturnType<typeof useTrips>);

    render(<TripList />);

    expect(screen.getByText(PHASE_PILL_COPY[TripPhase.Planning])).toBeDefined();
  });

  it("renders the Coordination phase pill on a trip card with multiple members", () => {
    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    vi.mocked(useTrips).mockReturnValue({
      isLoading: false,
      isError: false,
      data: [makeTrip({ memberUids: ["uid-x", "uid-y"], endDate: future })],
    } as unknown as ReturnType<typeof useTrips>);

    render(<TripList />);

    expect(
      screen.getByText(PHASE_PILL_COPY[TripPhase.Coordination]),
    ).toBeDefined();
  });

  it("renders the Settling Up phase pill on a trip card when end date has passed", () => {
    const past = new Date("2020-01-01T00:00:00Z");
    vi.mocked(useTrips).mockReturnValue({
      isLoading: false,
      isError: false,
      data: [makeTrip({ endDate: past })],
    } as unknown as ReturnType<typeof useTrips>);

    render(<TripList />);

    expect(
      screen.getByText(PHASE_PILL_COPY[TripPhase.SettlingUp]),
    ).toBeDefined();
  });
});
