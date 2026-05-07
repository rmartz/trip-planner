import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { TripList } from "./TripList";
import { TRIP_LIST_COPY } from "./TripList.copy";
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
});
