import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import {
  TransportPlannerOverviewView,
  TransportOfferVisibility,
  type TransportLegSummary,
} from "./TransportPlannerOverviewView";
import { TRANSPORT_PLANNER_OVERVIEW_COPY } from "./TransportPlannerOverviewView.copy";
import type { Leg } from "@/lib/types/trip";

afterEach(cleanup);

const COPY = TRANSPORT_PLANNER_OVERVIEW_COPY;

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

function makeLegSummary(
  overrides: Partial<TransportLegSummary> = {},
): TransportLegSummary {
  return {
    leg: makeLeg(),
    demand: {
      driving: 1,
      needRide: 3,
      haveOwn: 0,
      skipLeg: 0,
      noReply: 0,
    },
    supply: [
      {
        driverName: "Marco",
        routeName: "Marco's car",
        seatCount: 4,
        visibility: TransportOfferVisibility.Public,
      },
    ],
    ...overrides,
  };
}

describe("TransportPlannerOverviewView — page header", () => {
  it("renders the heading", () => {
    render(<TransportPlannerOverviewView legs={[makeLegSummary()]} />);
    expect(screen.getByText(COPY.heading)).toBeDefined();
  });

  it("renders the heading subtext", () => {
    render(<TransportPlannerOverviewView legs={[makeLegSummary()]} />);
    expect(screen.getByText(COPY.headingSubtext)).toBeDefined();
  });
});

describe("TransportPlannerOverviewView — empty state", () => {
  it("shows the empty-legs message when no legs are passed", () => {
    render(<TransportPlannerOverviewView legs={[]} />);
    expect(screen.getByText(COPY.emptyLegsMessage)).toBeDefined();
  });

  it("does not render any leg sections when legs are empty", () => {
    const { container } = render(<TransportPlannerOverviewView legs={[]} />);
    expect(
      container.querySelectorAll("[data-testid=transport-leg-section]").length,
    ).toBe(0);
  });
});

describe("TransportPlannerOverviewView — per-leg cards", () => {
  it("renders the leg name in the section title", () => {
    render(
      <TransportPlannerOverviewView
        legs={[
          makeLegSummary({ leg: makeLeg({ name: "Austin → San Antonio" }) }),
        ]}
      />,
    );
    expect(screen.getByText("Austin → San Antonio")).toBeDefined();
  });

  it("renders one section per leg", () => {
    const { container } = render(
      <TransportPlannerOverviewView
        legs={[
          makeLegSummary({ leg: makeLeg({ legId: "l1", name: "Leg One" }) }),
          makeLegSummary({ leg: makeLeg({ legId: "l2", name: "Leg Two" }) }),
        ]}
      />,
    );
    expect(
      container.querySelectorAll("[data-testid=transport-leg-section]").length,
    ).toBe(2);
  });
});

describe("TransportPlannerOverviewView — status pill", () => {
  it("shows the covered pill when seat count meets demand", () => {
    render(
      <TransportPlannerOverviewView
        legs={[
          makeLegSummary({
            demand: {
              driving: 1,
              needRide: 2,
              haveOwn: 0,
              skipLeg: 0,
              noReply: 0,
            },
            supply: [
              {
                driverName: "Marco",
                routeName: "Marco's car",
                seatCount: 3,
                visibility: TransportOfferVisibility.Public,
              },
            ],
          }),
        ]}
      />,
    );
    expect(screen.getByText(COPY.okPill)).toBeDefined();
  });

  it("shows the gap pill when seat count is below demand", () => {
    render(
      <TransportPlannerOverviewView
        legs={[
          makeLegSummary({
            demand: {
              driving: 0,
              needRide: 5,
              haveOwn: 0,
              skipLeg: 0,
              noReply: 0,
            },
            supply: [
              {
                driverName: "Marco",
                routeName: "Marco's car",
                seatCount: 2,
                visibility: TransportOfferVisibility.Public,
              },
            ],
          }),
        ]}
      />,
    );
    expect(screen.getByText(COPY.gapPill(3))).toBeDefined();
  });
});

describe("TransportPlannerOverviewView — demand breakdown", () => {
  it("renders the demand card title", () => {
    render(<TransportPlannerOverviewView legs={[makeLegSummary()]} />);
    expect(screen.getByText(COPY.demandCardTitle)).toBeDefined();
  });

  it("renders the driving count", () => {
    render(
      <TransportPlannerOverviewView
        legs={[
          makeLegSummary({
            demand: {
              driving: 2,
              needRide: 0,
              haveOwn: 0,
              skipLeg: 0,
              noReply: 0,
            },
          }),
        ]}
      />,
    );
    expect(screen.getByText(COPY.demandDriving)).toBeDefined();
    expect(screen.getByText("2")).toBeDefined();
  });

  it("renders the need-ride count", () => {
    render(
      <TransportPlannerOverviewView
        legs={[
          makeLegSummary({
            demand: {
              driving: 0,
              needRide: 4,
              haveOwn: 0,
              skipLeg: 0,
              noReply: 0,
            },
          }),
        ]}
      />,
    );
    expect(screen.getByText(COPY.demandNeedRide)).toBeDefined();
    expect(screen.getByText("4")).toBeDefined();
  });

  it("renders the have-own count", () => {
    render(
      <TransportPlannerOverviewView
        legs={[
          makeLegSummary({
            demand: {
              driving: 0,
              needRide: 0,
              haveOwn: 3,
              skipLeg: 0,
              noReply: 0,
            },
          }),
        ]}
      />,
    );
    expect(screen.getByText(COPY.demandHaveOwn)).toBeDefined();
    expect(screen.getByText("3")).toBeDefined();
  });

  it("renders the no-reply count", () => {
    render(
      <TransportPlannerOverviewView
        legs={[
          makeLegSummary({
            demand: {
              driving: 0,
              needRide: 0,
              haveOwn: 0,
              skipLeg: 0,
              noReply: 5,
            },
          }),
        ]}
      />,
    );
    expect(screen.getByText(COPY.demandNoReply)).toBeDefined();
    expect(screen.getByText("5")).toBeDefined();
  });

  it("renders the skip-leg count", () => {
    render(
      <TransportPlannerOverviewView
        legs={[
          makeLegSummary({
            demand: {
              driving: 0,
              needRide: 0,
              haveOwn: 0,
              skipLeg: 6,
              noReply: 0,
            },
          }),
        ]}
      />,
    );
    expect(screen.getByText(COPY.demandSkipLeg)).toBeDefined();
    expect(screen.getByText("6")).toBeDefined();
  });
});

describe("TransportPlannerOverviewView — supply card", () => {
  it("renders the supply card title", () => {
    render(<TransportPlannerOverviewView legs={[makeLegSummary()]} />);
    expect(screen.getByText(COPY.supplyCardTitle)).toBeDefined();
  });

  it("renders the driver name, route name, and seat count", () => {
    render(
      <TransportPlannerOverviewView
        legs={[
          makeLegSummary({
            supply: [
              {
                driverName: "Tara",
                routeName: "Tara's SUV",
                seatCount: 3,
                visibility: TransportOfferVisibility.Public,
              },
            ],
          }),
        ]}
      />,
    );
    expect(screen.getByText("Tara · Tara's SUV")).toBeDefined();
    expect(screen.getByText(COPY.seatsLabel(3))).toBeDefined();
  });

  it("renders public visibility label", () => {
    render(
      <TransportPlannerOverviewView
        legs={[
          makeLegSummary({
            supply: [
              {
                driverName: "Marco",
                routeName: "Marco's car",
                seatCount: 4,
                visibility: TransportOfferVisibility.Public,
              },
            ],
          }),
        ]}
      />,
    );
    expect(screen.getByText(COPY.publicVisibility)).toBeDefined();
  });

  it("renders invite-only visibility with count", () => {
    render(
      <TransportPlannerOverviewView
        legs={[
          makeLegSummary({
            supply: [
              {
                driverName: "Tara",
                routeName: "Tara's SUV",
                seatCount: 3,
                visibility: TransportOfferVisibility.InviteOnly,
                inviteeCount: 4,
              },
            ],
          }),
        ]}
      />,
    );
    expect(screen.getByText(COPY.inviteOnlyVisibility(4))).toBeDefined();
  });

  it("renders invite-only label without count when inviteeCount is absent", () => {
    render(
      <TransportPlannerOverviewView
        legs={[
          makeLegSummary({
            supply: [
              {
                driverName: "Tara",
                routeName: "Tara's SUV",
                seatCount: 3,
                visibility: TransportOfferVisibility.InviteOnly,
              },
            ],
          }),
        ]}
      />,
    );
    expect(screen.getByText(COPY.inviteOnlyLabel)).toBeDefined();
  });

  it("renders total seats and driver count when there are multiple drivers", () => {
    render(
      <TransportPlannerOverviewView
        legs={[
          makeLegSummary({
            supply: [
              {
                driverName: "Marco",
                routeName: "Marco's car",
                seatCount: 4,
                visibility: TransportOfferVisibility.Public,
              },
              {
                driverName: "Tara",
                routeName: "Tara's SUV",
                seatCount: 3,
                visibility: TransportOfferVisibility.Public,
              },
            ],
          }),
        ]}
      />,
    );
    expect(screen.getByText(COPY.seatsLabel(7))).toBeDefined();
    expect(screen.getByText(COPY.driversLabel(2))).toBeDefined();
  });
});
