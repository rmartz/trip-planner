import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import {
  LodgingGuestOfferStatus,
  LodgingGuestOverviewView,
  type LodgingGuestOffer,
  type LodgingGuestStopSummary,
} from "./LodgingGuestOverviewView";
import { LODGING_GUEST_OVERVIEW_COPY } from "./LodgingGuestOverviewView.copy";
import type { Stop } from "@/lib/types/trip";

afterEach(cleanup);

function makeStop(overrides: Partial<Stop> = {}): Stop {
  return {
    endDate: new Date("2026-08-05T00:00:00"),
    memberUids: ["uid-1", "uid-2"],
    name: "Paris",
    order: 0,
    startDate: new Date("2026-08-01T00:00:00"),
    stopId: "stop-paris",
    tripId: "trip-1",
    ...overrides,
  };
}

function makeOffer(
  overrides: Partial<LodgingGuestOffer> = {},
): LodgingGuestOffer {
  return {
    bedCount: 2,
    hostName: "Alice",
    offerId: "offer-1",
    offerLabel: "Apartment near the Seine",
    status: LodgingGuestOfferStatus.Pending,
    ...overrides,
  };
}

function makeStopSummary(
  overrides: Partial<LodgingGuestStopSummary> = {},
): LodgingGuestStopSummary {
  return {
    offers: [makeOffer()],
    sortedOwnLodging: false,
    stop: makeStop(),
    ...overrides,
  };
}

describe("LodgingGuestOverviewView — heading", () => {
  it("renders the heading and subtext", () => {
    render(
      <LodgingGuestOverviewView
        stops={[makeStopSummary()]}
        onAcceptOffer={vi.fn()}
        onDeclineOffer={vi.fn()}
        onToggleSortedOwn={vi.fn()}
      />,
    );
    expect(screen.getByText(LODGING_GUEST_OVERVIEW_COPY.heading)).toBeDefined();
    expect(
      screen.getByText(LODGING_GUEST_OVERVIEW_COPY.headingSubtext),
    ).toBeDefined();
  });
});

describe("LodgingGuestOverviewView — no stops", () => {
  it("renders the no-stops message when stops is empty", () => {
    render(
      <LodgingGuestOverviewView
        stops={[]}
        onAcceptOffer={vi.fn()}
        onDeclineOffer={vi.fn()}
        onToggleSortedOwn={vi.fn()}
      />,
    );
    expect(
      screen.getByText(LODGING_GUEST_OVERVIEW_COPY.noStopsText),
    ).toBeDefined();
  });
});

describe("LodgingGuestOverviewView — stop sections", () => {
  it("renders one section per stop", () => {
    render(
      <LodgingGuestOverviewView
        stops={[
          makeStopSummary({ stop: makeStop({ stopId: "s-1", name: "Paris" }) }),
          makeStopSummary({ stop: makeStop({ stopId: "s-2", name: "Lyon" }) }),
        ]}
        onAcceptOffer={vi.fn()}
        onDeclineOffer={vi.fn()}
        onToggleSortedOwn={vi.fn()}
      />,
    );
    expect(screen.getAllByTestId("lodging-guest-stop-section").length).toBe(2);
  });

  it("renders each stop's name", () => {
    render(
      <LodgingGuestOverviewView
        stops={[
          makeStopSummary({ stop: makeStop({ stopId: "s-1", name: "Paris" }) }),
          makeStopSummary({ stop: makeStop({ stopId: "s-2", name: "Lyon" }) }),
        ]}
        onAcceptOffer={vi.fn()}
        onDeclineOffer={vi.fn()}
        onToggleSortedOwn={vi.fn()}
      />,
    );
    expect(screen.getByText("Paris")).toBeDefined();
    expect(screen.getByText("Lyon")).toBeDefined();
  });
});

describe("LodgingGuestOverviewView — offers", () => {
  it("renders one row per visible offer", () => {
    const { container } = render(
      <LodgingGuestOverviewView
        stops={[
          makeStopSummary({
            offers: [
              makeOffer({ offerId: "o-1" }),
              makeOffer({ offerId: "o-2" }),
              makeOffer({ offerId: "o-3" }),
            ],
          }),
        ]}
        onAcceptOffer={vi.fn()}
        onDeclineOffer={vi.fn()}
        onToggleSortedOwn={vi.fn()}
      />,
    );
    const list = container.querySelector(
      "[data-testid=lodging-guest-offer-list]",
    );
    expect(list?.children.length).toBe(3);
  });

  it("renders the empty-offers message when no offers are visible for a stop", () => {
    render(
      <LodgingGuestOverviewView
        stops={[makeStopSummary({ offers: [] })]}
        onAcceptOffer={vi.fn()}
        onDeclineOffer={vi.fn()}
        onToggleSortedOwn={vi.fn()}
      />,
    );
    expect(
      screen.getByText(LODGING_GUEST_OVERVIEW_COPY.emptyOffersText),
    ).toBeDefined();
  });

  it("renders the offer's host name and label", () => {
    render(
      <LodgingGuestOverviewView
        stops={[
          makeStopSummary({
            offers: [
              makeOffer({
                offerId: "o-1",
                hostName: "Carol",
                offerLabel: "Lakeside cabin",
              }),
            ],
          }),
        ]}
        onAcceptOffer={vi.fn()}
        onDeclineOffer={vi.fn()}
        onToggleSortedOwn={vi.fn()}
      />,
    );
    expect(screen.getByText("Carol")).toBeDefined();
    expect(screen.getByText(/Lakeside cabin/)).toBeDefined();
  });

  it("invokes onAcceptOffer with stop id and offer id when accept is clicked", () => {
    const onAcceptOffer = vi.fn();
    render(
      <LodgingGuestOverviewView
        stops={[
          makeStopSummary({
            stop: makeStop({ stopId: "stop-42" }),
            offers: [makeOffer({ offerId: "offer-99" })],
          }),
        ]}
        onAcceptOffer={onAcceptOffer}
        onDeclineOffer={vi.fn()}
        onToggleSortedOwn={vi.fn()}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: LODGING_GUEST_OVERVIEW_COPY.acceptOfferButton,
      }),
    );
    expect(onAcceptOffer).toHaveBeenCalledWith("stop-42", "offer-99");
  });

  it("invokes onDeclineOffer with stop id and offer id when decline is clicked", () => {
    const onDeclineOffer = vi.fn();
    render(
      <LodgingGuestOverviewView
        stops={[
          makeStopSummary({
            stop: makeStop({ stopId: "stop-42" }),
            offers: [makeOffer({ offerId: "offer-99" })],
          }),
        ]}
        onAcceptOffer={vi.fn()}
        onDeclineOffer={onDeclineOffer}
        onToggleSortedOwn={vi.fn()}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: LODGING_GUEST_OVERVIEW_COPY.declineOfferButton,
      }),
    );
    expect(onDeclineOffer).toHaveBeenCalledWith("stop-42", "offer-99");
  });

  it("renders the Accepted status label for accepted offers", () => {
    render(
      <LodgingGuestOverviewView
        stops={[
          makeStopSummary({
            offers: [makeOffer({ status: LodgingGuestOfferStatus.Accepted })],
          }),
        ]}
        onAcceptOffer={vi.fn()}
        onDeclineOffer={vi.fn()}
        onToggleSortedOwn={vi.fn()}
      />,
    );
    expect(
      screen.getByText(LODGING_GUEST_OVERVIEW_COPY.offerStatusAccepted),
    ).toBeDefined();
  });
});

describe("LodgingGuestOverviewView — sorted own lodging", () => {
  it("renders the sorted-own-lodging label", () => {
    render(
      <LodgingGuestOverviewView
        stops={[makeStopSummary()]}
        onAcceptOffer={vi.fn()}
        onDeclineOffer={vi.fn()}
        onToggleSortedOwn={vi.fn()}
      />,
    );
    expect(
      screen.getByText(LODGING_GUEST_OVERVIEW_COPY.sortedOwnLodgingLabel),
    ).toBeDefined();
  });

  it("invokes onToggleSortedOwn with stop id and new value when toggled", () => {
    const onToggleSortedOwn = vi.fn();
    render(
      <LodgingGuestOverviewView
        stops={[
          makeStopSummary({
            stop: makeStop({ stopId: "stop-42" }),
            sortedOwnLodging: false,
          }),
        ]}
        onAcceptOffer={vi.fn()}
        onDeclineOffer={vi.fn()}
        onToggleSortedOwn={onToggleSortedOwn}
      />,
    );
    fireEvent.click(
      screen.getByLabelText(LODGING_GUEST_OVERVIEW_COPY.sortedOwnLodgingLabel),
    );
    expect(onToggleSortedOwn).toHaveBeenCalledWith("stop-42", true);
  });
});
