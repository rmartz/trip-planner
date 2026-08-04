import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  type TransportGuestLegSummary,
  TransportGuestOverviewView,
  type TransportSeatOffer,
} from "./TransportGuestOverviewView";
import { TRANSPORT_GUEST_OVERVIEW_COPY } from "./TransportGuestOverviewView.copy";
import type { Leg } from "@/lib/types/trip";

afterEach(cleanup);

const COPY = TRANSPORT_GUEST_OVERVIEW_COPY;

function makeLeg(overrides: Partial<Leg> = {}): Leg {
  return {
    legId: "leg-1",
    tripId: "trip-1",
    fromStopId: "stop-1",
    toStopId: "stop-2",
    name: "Austin → Wimberley",
    order: 0,
    memberUids: ["uid-1"],
    isActive: true,
    ...overrides,
  };
}

function makeSeatOffer(
  overrides: Partial<TransportSeatOffer> = {},
): TransportSeatOffer {
  return {
    offerId: "offer-1",
    driverName: "Marco",
    driverUid: "driver-uid-1",
    routeName: "Marco's car",
    seatCount: 3,
    ...overrides,
  };
}

function makeLegSummary(
  overrides: Partial<TransportGuestLegSummary> = {},
): TransportGuestLegSummary {
  return {
    leg: makeLeg(),
    offers: [makeSeatOffer()],
    ...overrides,
  };
}

describe("TransportGuestOverviewView — page header", () => {
  it("renders the heading", () => {
    render(
      <TransportGuestOverviewView
        legs={[makeLegSummary()]}
        onClaimSeat={vi.fn()}
      />,
    );
    expect(screen.getByText(COPY.heading)).toBeDefined();
  });

  it("renders the heading subtext", () => {
    render(
      <TransportGuestOverviewView
        legs={[makeLegSummary()]}
        onClaimSeat={vi.fn()}
      />,
    );
    expect(screen.getByText(COPY.headingSubtext)).toBeDefined();
  });
});

describe("TransportGuestOverviewView — empty state", () => {
  it("shows the no-legs message when no legs are passed", () => {
    render(<TransportGuestOverviewView legs={[]} onClaimSeat={vi.fn()} />);
    expect(screen.getByText(COPY.noLegsText)).toBeDefined();
  });
});

describe("TransportGuestOverviewView — leg sections", () => {
  it("renders the leg name", () => {
    render(
      <TransportGuestOverviewView
        legs={[
          makeLegSummary({ leg: makeLeg({ name: "Austin → San Antonio" }) }),
        ]}
        onClaimSeat={vi.fn()}
      />,
    );
    expect(screen.getByText("Austin → San Antonio")).toBeDefined();
  });

  it("renders one section per leg", () => {
    const { container } = render(
      <TransportGuestOverviewView
        legs={[
          makeLegSummary({ leg: makeLeg({ legId: "l1", name: "Leg One" }) }),
          makeLegSummary({ leg: makeLeg({ legId: "l2", name: "Leg Two" }) }),
        ]}
        onClaimSeat={vi.fn()}
      />,
    );
    expect(
      container.querySelectorAll("[data-testid=transport-guest-leg-section]")
        .length,
    ).toBe(2);
  });

  it("shows the empty-offers message when a leg has no offers", () => {
    render(
      <TransportGuestOverviewView
        legs={[makeLegSummary({ offers: [] })]}
        onClaimSeat={vi.fn()}
      />,
    );
    expect(screen.getByText(COPY.emptyOffersText)).toBeDefined();
  });
});

describe("TransportGuestOverviewView — seat offer card", () => {
  it("renders the 'Visible to you' label with the driver's car name", () => {
    render(
      <TransportGuestOverviewView
        legs={[
          makeLegSummary({
            offers: [
              makeSeatOffer({ driverName: "Tara", routeName: "Tara's SUV" }),
            ],
          }),
        ]}
        onClaimSeat={vi.fn()}
      />,
    );
    expect(screen.getByText(COPY.seatOfferLabel("Tara's SUV"))).toBeDefined();
  });

  it("renders the seats-available line with seat count", () => {
    render(
      <TransportGuestOverviewView
        legs={[makeLegSummary({ offers: [makeSeatOffer({ seatCount: 4 })] })]}
        onClaimSeat={vi.fn()}
      />,
    );
    expect(screen.getByText(COPY.seatsAvailable(4))).toBeDefined();
  });

  it("renders the claim-seat button", () => {
    render(
      <TransportGuestOverviewView
        legs={[makeLegSummary()]}
        onClaimSeat={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", {
        name: COPY.claimSeatAriaLabel("Marco"),
      }),
    ).toBeDefined();
  });
});

describe("TransportGuestOverviewView — claim seat action", () => {
  it("calls onClaimSeat with legId and driverUid when claim button is clicked", () => {
    const onClaimSeat = vi.fn();
    render(
      <TransportGuestOverviewView
        legs={[
          makeLegSummary({
            leg: makeLeg({ legId: "leg-99" }),
            offers: [makeSeatOffer({ driverUid: "driver-42" })],
          }),
        ]}
        onClaimSeat={onClaimSeat}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: COPY.claimSeatAriaLabel("Marco") }),
    );
    expect(onClaimSeat).toHaveBeenCalledWith("leg-99", "driver-42");
  });
});
