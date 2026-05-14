import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import type { Trip } from "@/lib/types/trip";
import { TripOverviewPageView } from "./TripOverviewPageView";
import { TRIP_OVERVIEW_PAGE_COPY } from "./TripOverviewPageView.copy";

afterEach(cleanup);

function makeTrip(overrides: Partial<Trip> = {}): Trip {
  return {
    tripId: "trip-1",
    name: "Iceland Ring Road",
    startDate: new Date("2026-08-01T00:00:00"),
    endDate: new Date("2026-08-14T00:00:00"),
    createdAt: new Date("2026-01-15T00:00:00"),
    createdBy: "uid-1",
    memberUids: ["uid-1", "uid-2", "uid-3"],
    inviteToken: "tok-1",
    ...overrides,
  };
}

describe("TripOverviewPageView — loading state", () => {
  it("renders loading text when isLoading is true", () => {
    render(
      <TripOverviewPageView
        trip={undefined}
        isLoading={true}
        isError={false}
      />,
    );
    expect(screen.getByText(TRIP_OVERVIEW_PAGE_COPY.loadingText)).toBeDefined();
  });
});

describe("TripOverviewPageView — error state", () => {
  it("renders error text when isError is true", () => {
    render(
      <TripOverviewPageView
        trip={undefined}
        isLoading={false}
        isError={true}
      />,
    );
    expect(screen.getByText(TRIP_OVERVIEW_PAGE_COPY.errorText)).toBeDefined();
  });
});

describe("TripOverviewPageView — not-found state", () => {
  it("renders the not-found message when not loading, not error, and trip is undefined", () => {
    render(
      <TripOverviewPageView
        trip={undefined}
        isLoading={false}
        isError={false}
      />,
    );
    expect(
      screen.getByText(TRIP_OVERVIEW_PAGE_COPY.notFoundText),
    ).toBeDefined();
  });
});

describe("TripOverviewPageView — header", () => {
  it("renders the trip name when loaded", () => {
    render(
      <TripOverviewPageView
        trip={makeTrip({ name: "Iceland Ring Road" })}
        isLoading={false}
        isError={false}
      />,
    );
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain(
      "Iceland Ring Road",
    );
  });

  it("renders the trip date range when loaded", () => {
    const header = render(
      <TripOverviewPageView
        trip={makeTrip()}
        isLoading={false}
        isError={false}
      />,
    ).container.querySelector("[data-testid=trip-overview-header]");
    expect(header?.textContent ?? "").toMatch(/2026/);
  });

  it("renders a phase pill for the loaded trip", () => {
    const { container } = render(
      <TripOverviewPageView
        trip={makeTrip()}
        isLoading={false}
        isError={false}
      />,
    );
    // PhasePill renders a span with the phase copy. Just verify a header
    // element exists with a phase indicator child.
    const header = container.querySelector(
      "[data-testid=trip-overview-header]",
    );
    expect(header?.querySelectorAll("span").length).toBeGreaterThan(0);
  });
});

describe("TripOverviewPageView — section navigation", () => {
  it("renders a link to the destinations sub-route", () => {
    render(
      <TripOverviewPageView
        trip={makeTrip({ tripId: "trip-1" })}
        isLoading={false}
        isError={false}
      />,
    );
    const link = screen.getByRole("link", {
      name: TRIP_OVERVIEW_PAGE_COPY.sectionDestinations,
    });
    expect(link.getAttribute("href")).toBe("/trips/trip-1/destinations");
  });

  it("renders a link to the availability sub-route", () => {
    render(
      <TripOverviewPageView
        trip={makeTrip({ tripId: "trip-1" })}
        isLoading={false}
        isError={false}
      />,
    );
    const link = screen.getByRole("link", {
      name: TRIP_OVERVIEW_PAGE_COPY.sectionAvailability,
    });
    expect(link.getAttribute("href")).toBe("/trips/trip-1/availability");
  });

  it("renders a link to the existing members sub-route", () => {
    render(
      <TripOverviewPageView
        trip={makeTrip({ tripId: "trip-7" })}
        isLoading={false}
        isError={false}
      />,
    );
    const link = screen.getByRole("link", {
      name: TRIP_OVERVIEW_PAGE_COPY.sectionMembers,
    });
    expect(link.getAttribute("href")).toBe("/trips/trip-7/members");
  });

  it("renders a link to the existing lodging sub-route", () => {
    render(
      <TripOverviewPageView
        trip={makeTrip({ tripId: "trip-7" })}
        isLoading={false}
        isError={false}
      />,
    );
    const link = screen.getByRole("link", {
      name: TRIP_OVERVIEW_PAGE_COPY.sectionLodging,
    });
    expect(link.getAttribute("href")).toBe("/trips/trip-7/lodging");
  });

  it("renders a link to the existing structure sub-route", () => {
    render(
      <TripOverviewPageView
        trip={makeTrip({ tripId: "trip-7" })}
        isLoading={false}
        isError={false}
      />,
    );
    const link = screen.getByRole("link", {
      name: TRIP_OVERVIEW_PAGE_COPY.sectionStructure,
    });
    expect(link.getAttribute("href")).toBe("/trips/trip-7/structure");
  });

  it("renders a link to the existing archive sub-route", () => {
    render(
      <TripOverviewPageView
        trip={makeTrip({ tripId: "trip-7" })}
        isLoading={false}
        isError={false}
      />,
    );
    const link = screen.getByRole("link", {
      name: TRIP_OVERVIEW_PAGE_COPY.sectionArchive,
    });
    expect(link.getAttribute("href")).toBe("/trips/trip-7/archive");
  });

  it("renders links for all 12 sub-sections", () => {
    const { container } = render(
      <TripOverviewPageView
        trip={makeTrip({ tripId: "trip-1" })}
        isLoading={false}
        isError={false}
      />,
    );
    const nav = container.querySelector("[data-testid=trip-overview-sections]");
    const links = within(nav as HTMLElement).getAllByRole("link");
    expect(links.length).toBe(12);
  });

  it("does not render section navigation when loading", () => {
    const { container } = render(
      <TripOverviewPageView
        trip={undefined}
        isLoading={true}
        isError={false}
      />,
    );
    expect(
      container.querySelector("[data-testid=trip-overview-sections]"),
    ).toBeNull();
  });

  it("does not render section navigation in the error state", () => {
    const { container } = render(
      <TripOverviewPageView
        trip={undefined}
        isLoading={false}
        isError={true}
      />,
    );
    expect(
      container.querySelector("[data-testid=trip-overview-sections]"),
    ).toBeNull();
  });
});

describe("TripOverviewPageView — lodging gap sub-line", () => {
  it("shows a gap sub-line on the lodging card when lodgingGapCount > 0", () => {
    render(
      <TripOverviewPageView
        trip={makeTrip({ tripId: "trip-1" })}
        isLoading={false}
        isError={false}
        lodgingGapCount={2}
      />,
    );
    const link = screen.getByRole("link", {
      name: TRIP_OVERVIEW_PAGE_COPY.sectionLodging,
    });
    expect(link.textContent).toContain(
      TRIP_OVERVIEW_PAGE_COPY.lodgingGapSubline(2),
    );
  });

  it("does not show a gap sub-line when lodgingGapCount is 0", () => {
    render(
      <TripOverviewPageView
        trip={makeTrip({ tripId: "trip-1" })}
        isLoading={false}
        isError={false}
        lodgingGapCount={0}
      />,
    );
    const link = screen.getByRole("link", {
      name: TRIP_OVERVIEW_PAGE_COPY.sectionLodging,
    });
    expect(link.textContent).not.toContain("gap");
  });

  it("does not show a gap sub-line when lodgingGapCount is undefined", () => {
    render(
      <TripOverviewPageView
        trip={makeTrip({ tripId: "trip-1" })}
        isLoading={false}
        isError={false}
      />,
    );
    const link = screen.getByRole("link", {
      name: TRIP_OVERVIEW_PAGE_COPY.sectionLodging,
    });
    expect(link.textContent).not.toContain("gap");
  });
});
