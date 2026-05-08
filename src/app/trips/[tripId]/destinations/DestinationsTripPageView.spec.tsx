import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { Destination } from "@/lib/types/destination";
import { DestinationsTripPageView } from "./DestinationsTripPageView";
import { DESTINATIONS_TRIP_PAGE_COPY } from "./DestinationsTripPageView.copy";

afterEach(cleanup);

function makeDestination(overrides: Partial<Destination> = {}): Destination {
  return {
    destinationId: "dest-1",
    uid: "uid-1",
    name: "Reykjavik",
    seasonality: "summer",
    tripIds: ["trip-1"],
    ...overrides,
  };
}

describe("DestinationsTripPageView — loading state", () => {
  it("renders loading text when isLoading is true", () => {
    render(
      <DestinationsTripPageView
        destinations={[]}
        isLoading={true}
        isError={false}
      />,
    );
    expect(
      screen.getByText(DESTINATIONS_TRIP_PAGE_COPY.loadingText),
    ).toBeDefined();
  });

  it("does not render the destinations list when loading", () => {
    const { container } = render(
      <DestinationsTripPageView
        destinations={[makeDestination()]}
        isLoading={true}
        isError={false}
      />,
    );
    expect(
      container.querySelector("[data-testid=destinations-trip-list]"),
    ).toBeNull();
  });
});

describe("DestinationsTripPageView — error state", () => {
  it("renders error text when isError is true", () => {
    render(
      <DestinationsTripPageView
        destinations={[]}
        isLoading={false}
        isError={true}
      />,
    );
    expect(
      screen.getByText(DESTINATIONS_TRIP_PAGE_COPY.errorText),
    ).toBeDefined();
  });

  it("does not render the destinations list when in error state", () => {
    const { container } = render(
      <DestinationsTripPageView
        destinations={[makeDestination()]}
        isLoading={false}
        isError={true}
      />,
    );
    expect(
      container.querySelector("[data-testid=destinations-trip-list]"),
    ).toBeNull();
  });
});

describe("DestinationsTripPageView — empty state", () => {
  it("renders empty text when there are no destinations", () => {
    render(
      <DestinationsTripPageView
        destinations={[]}
        isLoading={false}
        isError={false}
      />,
    );
    expect(
      screen.getByText(DESTINATIONS_TRIP_PAGE_COPY.emptyText),
    ).toBeDefined();
  });
});

describe("DestinationsTripPageView — loaded state", () => {
  it("renders each destination's name", () => {
    const destinations = [
      makeDestination({ destinationId: "d-1", name: "Reykjavik" }),
      makeDestination({ destinationId: "d-2", name: "Vik" }),
    ];
    render(
      <DestinationsTripPageView
        destinations={destinations}
        isLoading={false}
        isError={false}
      />,
    );
    expect(screen.getByText("Reykjavik")).toBeDefined();
    expect(screen.getByText("Vik")).toBeDefined();
  });

  it("renders one row per destination inside the list", () => {
    const destinations = [
      makeDestination({ destinationId: "d-1", name: "Reykjavik" }),
      makeDestination({ destinationId: "d-2", name: "Vik" }),
      makeDestination({ destinationId: "d-3", name: "Akureyri" }),
    ];
    const { container } = render(
      <DestinationsTripPageView
        destinations={destinations}
        isLoading={false}
        isError={false}
      />,
    );
    const list = container.querySelector(
      "[data-testid=destinations-trip-list]",
    );
    expect(list?.children.length).toBe(3);
  });

  it("renders the destinations heading when loaded", () => {
    render(
      <DestinationsTripPageView
        destinations={[makeDestination()]}
        isLoading={false}
        isError={false}
      />,
    );
    expect(
      screen.getByRole("heading", {
        name: DESTINATIONS_TRIP_PAGE_COPY.heading,
      }),
    ).toBeDefined();
  });
});
