import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { AppDrawerView } from "./AppDrawerView";
import { APP_DRAWER_COPY } from "./AppDrawer.copy";
import type { Trip } from "@/lib/types/trip";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

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

describe("AppDrawer user scope renders navigation sections", () => {
  it("renders the 'You' section heading", () => {
    render(
      <AppDrawerView
        scope="user"
        userEmail="user@example.com"
        recentTrips={[]}
        onSignOut={vi.fn()}
      />,
    );
    expect(screen.getByText(APP_DRAWER_COPY.userSectionHeading)).toBeDefined();
  });

  it("renders the sign out button", () => {
    render(
      <AppDrawerView
        scope="user"
        userEmail="user@example.com"
        recentTrips={[]}
        onSignOut={vi.fn()}
      />,
    );
    expect(screen.getByText(APP_DRAWER_COPY.signOut)).toBeDefined();
  });

  it("renders user email", () => {
    render(
      <AppDrawerView
        scope="user"
        userEmail="traveler@example.com"
        recentTrips={[]}
        onSignOut={vi.fn()}
      />,
    );
    expect(screen.getByText("traveler@example.com")).toBeDefined();
  });

  it("renders Trips nav item", () => {
    render(
      <AppDrawerView
        scope="user"
        userEmail="user@example.com"
        recentTrips={[]}
        onSignOut={vi.fn()}
      />,
    );
    expect(screen.getByText(APP_DRAWER_COPY.navTrips)).toBeDefined();
  });

  it("renders recent trips section heading when trips exist", () => {
    render(
      <AppDrawerView
        scope="user"
        userEmail="user@example.com"
        recentTrips={[makeTrip()]}
        onSignOut={vi.fn()}
      />,
    );
    expect(
      screen.getByText(APP_DRAWER_COPY.recentTripsSectionHeading),
    ).toBeDefined();
  });

  it("renders recent trip name in the list", () => {
    render(
      <AppDrawerView
        scope="user"
        userEmail="user@example.com"
        recentTrips={[makeTrip({ name: "Tokyo Adventure" })]}
        onSignOut={vi.fn()}
      />,
    );
    expect(screen.getByText("Tokyo Adventure")).toBeDefined();
  });
});

describe("AppDrawer trip scope renders trip navigation", () => {
  it("renders the 'This trip' section heading", () => {
    render(
      <AppDrawerView
        scope="trip"
        userEmail="user@example.com"
        activeTrip={makeTrip({ name: "Paris Trip" })}
        otherTrips={[]}
        onSignOut={vi.fn()}
      />,
    );
    expect(screen.getByText(APP_DRAWER_COPY.tripSectionHeading)).toBeDefined();
  });

  it("renders the active trip name", () => {
    render(
      <AppDrawerView
        scope="trip"
        userEmail="user@example.com"
        activeTrip={makeTrip({ name: "Alps Adventure" })}
        otherTrips={[]}
        onSignOut={vi.fn()}
      />,
    );
    expect(screen.getByText("Alps Adventure")).toBeDefined();
  });

  it("renders the sign out button", () => {
    render(
      <AppDrawerView
        scope="trip"
        userEmail="user@example.com"
        activeTrip={makeTrip()}
        otherTrips={[]}
        onSignOut={vi.fn()}
      />,
    );
    expect(screen.getByText(APP_DRAWER_COPY.signOut)).toBeDefined();
  });

  it("renders 'All trips' back link in switch section", () => {
    render(
      <AppDrawerView
        scope="trip"
        userEmail="user@example.com"
        activeTrip={makeTrip()}
        otherTrips={[]}
        onSignOut={vi.fn()}
      />,
    );
    expect(screen.getByText(APP_DRAWER_COPY.allTrips)).toBeDefined();
  });

  it("renders other trip names in switch section", () => {
    render(
      <AppDrawerView
        scope="trip"
        userEmail="user@example.com"
        activeTrip={makeTrip({ tripId: "trip-1", name: "Paris Trip" })}
        otherTrips={[makeTrip({ tripId: "trip-2", name: "Japan Trip" })]}
        onSignOut={vi.fn()}
      />,
    );
    expect(screen.getByText("Japan Trip")).toBeDefined();
  });
});
