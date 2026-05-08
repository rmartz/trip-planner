import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import {
  LodgingPlannerOverviewView,
  LodgingVisibility,
} from "./LodgingPlannerOverviewView";
import { LODGING_PLANNER_OVERVIEW_COPY } from "./LodgingPlannerOverviewView.copy";
import type { LodgingStopSummary } from "./LodgingPlannerOverviewView";
import type { Stop } from "@/lib/types/trip";

afterEach(cleanup);

const COPY = LODGING_PLANNER_OVERVIEW_COPY;

function makeStop(overrides: Partial<Stop> = {}): Stop {
  return {
    stopId: "stop-1",
    tripId: "trip-1",
    name: "Austin",
    startDate: new Date("2025-06-01T00:00:00Z"),
    endDate: new Date("2025-06-03T00:00:00Z"),
    order: 0,
    memberUids: ["uid-1"],
    ...overrides,
  };
}

function makeStopSummary(
  overrides: Partial<LodgingStopSummary> = {},
): LodgingStopSummary {
  return {
    stop: makeStop(),
    demand: {
      needLodging: 2,
      haveOwn: 1,
      sharing: 1,
      noReply: 3,
    },
    supply: [
      {
        hostName: "Marco",
        offerLabel: "Marco's place",
        bedCount: 4,
        visibility: LodgingVisibility.Public,
      },
    ],
    ...overrides,
  };
}

describe("LodgingPlannerOverviewView — renders page header", () => {
  it("renders the heading", () => {
    render(<LodgingPlannerOverviewView stops={[makeStopSummary()]} />);

    expect(screen.getByText(COPY.heading)).toBeDefined();
  });

  it("renders the heading subtext", () => {
    render(<LodgingPlannerOverviewView stops={[makeStopSummary()]} />);

    expect(screen.getByText(COPY.headingSubtext)).toBeDefined();
  });
});

describe("LodgingPlannerOverviewView — renders one section per stop", () => {
  it("renders the stop name in the section title", () => {
    render(
      <LodgingPlannerOverviewView
        stops={[makeStopSummary({ stop: makeStop({ name: "Wimberley" }) })]}
      />,
    );

    expect(screen.getByText("Wimberley")).toBeDefined();
  });

  it("renders a section for each stop", () => {
    render(
      <LodgingPlannerOverviewView
        stops={[
          makeStopSummary({ stop: makeStop({ stopId: "s1", name: "Austin" }) }),
          makeStopSummary({
            stop: makeStop({ stopId: "s2", name: "Wimberley" }),
          }),
        ]}
      />,
    );

    expect(screen.getByText("Austin")).toBeDefined();
    expect(screen.getByText("Wimberley")).toBeDefined();
  });
});

describe("LodgingPlannerOverviewView — balanced status pill", () => {
  it("shows balanced pill when supply meets demand", () => {
    render(
      <LodgingPlannerOverviewView
        stops={[
          makeStopSummary({
            demand: { needLodging: 2, haveOwn: 0, sharing: 0, noReply: 0 },
            supply: [
              {
                hostName: "Marco",
                offerLabel: "Marco's place",
                bedCount: 3,
                visibility: LodgingVisibility.Public,
              },
            ],
          }),
        ]}
      />,
    );

    expect(screen.getByText(COPY.balancedPill)).toBeDefined();
  });

  it("shows balanced pill when supply exactly equals demand", () => {
    render(
      <LodgingPlannerOverviewView
        stops={[
          makeStopSummary({
            demand: { needLodging: 2, haveOwn: 0, sharing: 0, noReply: 0 },
            supply: [
              {
                hostName: "Host",
                offerLabel: "Host's place",
                bedCount: 2,
                visibility: LodgingVisibility.Public,
              },
            ],
          }),
        ]}
      />,
    );

    expect(screen.getByText(COPY.balancedPill)).toBeDefined();
  });
});

describe("LodgingPlannerOverviewView — gap status pill", () => {
  it("shows gap pill when supply is less than demand", () => {
    render(
      <LodgingPlannerOverviewView
        stops={[
          makeStopSummary({
            demand: { needLodging: 4, haveOwn: 0, sharing: 0, noReply: 0 },
            supply: [
              {
                hostName: "Marco",
                offerLabel: "Marco's place",
                bedCount: 2,
                visibility: LodgingVisibility.Public,
              },
            ],
          }),
        ]}
      />,
    );

    expect(screen.getByText(COPY.gapPill(-2))).toBeDefined();
  });

  it("shows gap pill when there are no hosts", () => {
    render(
      <LodgingPlannerOverviewView
        stops={[
          makeStopSummary({
            demand: { needLodging: 3, haveOwn: 0, sharing: 0, noReply: 0 },
            supply: [],
          }),
        ]}
      />,
    );

    expect(screen.getByText(COPY.gapPill(-3))).toBeDefined();
  });
});

describe("LodgingPlannerOverviewView — demand card", () => {
  it("renders the demand card title", () => {
    render(<LodgingPlannerOverviewView stops={[makeStopSummary()]} />);

    expect(screen.getByText(COPY.demandCardTitle)).toBeDefined();
  });

  it("renders the need-lodging count", () => {
    render(
      <LodgingPlannerOverviewView
        stops={[
          makeStopSummary({
            demand: { needLodging: 3, haveOwn: 1, sharing: 2, noReply: 0 },
          }),
        ]}
      />,
    );

    expect(screen.getByText(COPY.statusNeedLodging)).toBeDefined();
    expect(screen.getByText("3")).toBeDefined();
  });

  it("renders the no-reply count", () => {
    render(
      <LodgingPlannerOverviewView
        stops={[
          makeStopSummary({
            demand: { needLodging: 0, haveOwn: 0, sharing: 0, noReply: 5 },
          }),
        ]}
      />,
    );

    expect(screen.getByText(COPY.statusNoReply)).toBeDefined();
    expect(screen.getByText("5")).toBeDefined();
  });
});

describe("LodgingPlannerOverviewView — supply card", () => {
  it("renders the supply card title", () => {
    render(<LodgingPlannerOverviewView stops={[makeStopSummary()]} />);

    expect(screen.getByText(COPY.supplyCardTitle)).toBeDefined();
  });

  it("renders host offer label and bed count", () => {
    render(
      <LodgingPlannerOverviewView
        stops={[
          makeStopSummary({
            supply: [
              {
                hostName: "Tara",
                offerLabel: "Tara's couch",
                bedCount: 2,
                visibility: LodgingVisibility.Public,
              },
            ],
          }),
        ]}
      />,
    );

    expect(screen.getByText("Tara's couch")).toBeDefined();
    expect(screen.getByText(COPY.bedsLabel(2))).toBeDefined();
    expect(screen.getByText(COPY.publicVisibility)).toBeDefined();
  });

  it("renders invite-only visibility with count", () => {
    render(
      <LodgingPlannerOverviewView
        stops={[
          makeStopSummary({
            supply: [
              {
                hostName: "Tara",
                offerLabel: "Tara's couch",
                bedCount: 2,
                visibility: LodgingVisibility.InviteOnly,
                inviteeCount: 3,
              },
            ],
          }),
        ]}
      />,
    );

    expect(screen.getByText(COPY.inviteOnlyVisibility(3))).toBeDefined();
  });

  it("renders total beds count from all hosts", () => {
    render(
      <LodgingPlannerOverviewView
        stops={[
          makeStopSummary({
            supply: [
              {
                hostName: "Marco",
                offerLabel: "Marco's place",
                bedCount: 4,
                visibility: LodgingVisibility.Public,
              },
              {
                hostName: "Tara",
                offerLabel: "Tara's couch",
                bedCount: 2,
                visibility: LodgingVisibility.Public,
              },
            ],
          }),
        ]}
      />,
    );

    expect(screen.getByText(COPY.bedsLabel(6))).toBeDefined();
    expect(screen.getByText(COPY.hostsLabel(2))).toBeDefined();
  });
});
