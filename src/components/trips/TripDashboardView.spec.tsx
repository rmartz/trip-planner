import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { TripDashboardView } from "./TripDashboardView";
import { TRIP_DASHBOARD_COPY } from "./TripDashboardView.copy";
import type { Trip } from "@/lib/types/trip";

afterEach(cleanup);

function makeTrip(overrides: Partial<Trip> = {}): Trip {
  return {
    tripId: "trip-1",
    name: "Paris Trip",
    startDate: new Date("2026-08-01T12:00:00Z"),
    endDate: new Date("2026-08-08T12:00:00Z"),
    createdAt: new Date("2025-01-01T12:00:00Z"),
    createdBy: "uid-x",
    memberUids: ["uid-x"],
    ...overrides,
  };
}

describe("User home renders the 2x2 Quick Access grid above the active trips list", () => {
  it("renders the Quick Access section heading", () => {
    render(<TripDashboardView activeTrips={[]} pastTrips={[]} />);
    expect(
      screen.getByText(TRIP_DASHBOARD_COPY.quickAccessHeading),
    ).toBeDefined();
  });

  it("renders all 4 Quick Access cards", () => {
    render(<TripDashboardView activeTrips={[]} pastTrips={[]} />);
    expect(
      screen.getByText(TRIP_DASHBOARD_COPY.quickAccessTrips),
    ).toBeDefined();
    expect(
      screen.getByText(TRIP_DASHBOARD_COPY.quickAccessDestinations),
    ).toBeDefined();
    expect(
      screen.getByText(TRIP_DASHBOARD_COPY.quickAccessCalendar),
    ).toBeDefined();
    expect(
      screen.getByText(TRIP_DASHBOARD_COPY.quickAccessNotifications),
    ).toBeDefined();
  });

  it("renders Quick Access grid before the active trips section", () => {
    const trip = makeTrip();
    render(<TripDashboardView activeTrips={[trip]} pastTrips={[]} />);
    const quickAccess = screen.getByText(
      TRIP_DASHBOARD_COPY.quickAccessHeading,
    );
    const activeSection = screen.getByText(
      TRIP_DASHBOARD_COPY.activeTripsHeading,
    );
    expect(
      quickAccess.compareDocumentPosition(activeSection) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});

describe("Header uses hybrid pattern (hamburger left, notification bell right)", () => {
  it("renders the hamburger menu button", () => {
    render(<TripDashboardView activeTrips={[]} pastTrips={[]} />);
    expect(
      screen.getByRole("button", {
        name: TRIP_DASHBOARD_COPY.openMenuAriaLabel,
      }),
    ).toBeDefined();
  });

  it("renders the notification bell button", () => {
    render(<TripDashboardView activeTrips={[]} pastTrips={[]} />);
    expect(
      screen.getByRole("button", {
        name: TRIP_DASHBOARD_COPY.notificationsAriaLabel,
      }),
    ).toBeDefined();
  });

  it("renders the Trip Planner title in the header", () => {
    render(<TripDashboardView activeTrips={[]} pastTrips={[]} />);
    expect(screen.getByText(TRIP_DASHBOARD_COPY.appTitle)).toBeDefined();
  });
});

describe("Trip cards surface phase pill, date range with countdown, and avatar stack", () => {
  it("renders the phase pill on an active trip card", () => {
    // Single member + future endDate = Planning phase
    const futureStart = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const futureEnd = new Date(Date.now() + 37 * 24 * 60 * 60 * 1000);
    const trip = makeTrip({
      startDate: futureStart,
      endDate: futureEnd,
      memberUids: ["uid-x"],
    });
    render(<TripDashboardView activeTrips={[trip]} pastTrips={[]} />);
    expect(screen.getByText(TRIP_DASHBOARD_COPY.phasePlanning)).toBeDefined();
  });

  it("renders date range for a trip card", () => {
    const trip = makeTrip({
      startDate: new Date("2026-08-01T12:00:00Z"),
      endDate: new Date("2026-08-08T12:00:00Z"),
    });
    render(<TripDashboardView activeTrips={[trip]} pastTrips={[]} />);
    const card = screen
      .getByText("Paris Trip")
      .closest("[data-slot='trip-card']");
    expect(card?.textContent).toContain("Aug");
  });

  it("renders the member count (avatar stack proxy) on a trip card", () => {
    const trip = makeTrip({ memberUids: ["uid-a", "uid-b", "uid-c"] });
    render(<TripDashboardView activeTrips={[trip]} pastTrips={[]} />);
    const card = screen
      .getByText("Paris Trip")
      .closest("[data-slot='trip-card']");
    expect(card?.textContent).toContain("3");
  });

  it("renders the gap-count pill when gapCount is provided", () => {
    const trip = makeTrip({ gapCount: 2 });
    render(<TripDashboardView activeTrips={[trip]} pastTrips={[]} />);
    expect(screen.getByText("2 gaps")).toBeDefined();
  });

  it("does not render a gap-count pill when gapCount is 0", () => {
    const trip = makeTrip({ gapCount: 0 });
    render(<TripDashboardView activeTrips={[trip]} pastTrips={[]} />);
    expect(screen.queryByText("0 gaps")).toBeNull();
  });
});

describe("Active vs. Past sections are visually distinct", () => {
  it("renders the Active trips section heading", () => {
    const trip = makeTrip();
    render(<TripDashboardView activeTrips={[trip]} pastTrips={[]} />);
    expect(
      screen.getByText(TRIP_DASHBOARD_COPY.activeTripsHeading),
    ).toBeDefined();
  });

  it("renders the Past trips section heading when there are past trips", () => {
    const pastTrip = makeTrip({ tripId: "trip-past", name: "Rome Trip" });
    render(<TripDashboardView activeTrips={[]} pastTrips={[pastTrip]} />);
    expect(
      screen.getByText(TRIP_DASHBOARD_COPY.pastTripsHeading),
    ).toBeDefined();
  });

  it("does not render the Past section heading when there are no past trips", () => {
    render(<TripDashboardView activeTrips={[]} pastTrips={[]} />);
    expect(screen.queryByText(TRIP_DASHBOARD_COPY.pastTripsHeading)).toBeNull();
  });

  it("past trip cards have faded styling", () => {
    const pastTrip = makeTrip({ tripId: "trip-past", name: "Rome Trip" });
    render(<TripDashboardView activeTrips={[]} pastTrips={[pastTrip]} />);
    const card = screen
      .getByText("Rome Trip")
      .closest("[data-slot='trip-card']");
    expect(card?.className).toContain("opacity");
  });
});
