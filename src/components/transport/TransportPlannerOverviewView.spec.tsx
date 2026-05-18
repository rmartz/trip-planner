import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  type NonAccountMemberTransportSummary,
  type TransportLegSummary,
  TransportOfferVisibility,
  TransportPlannerOverviewView,
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
    render(
      <TransportPlannerOverviewView
        legs={[makeLegSummary()]}
        onToggleMemberSortedOwn={vi.fn()}
      />,
    );
    expect(screen.getByText(COPY.heading)).toBeDefined();
  });

  it("renders the heading subtext", () => {
    render(
      <TransportPlannerOverviewView
        legs={[makeLegSummary()]}
        onToggleMemberSortedOwn={vi.fn()}
      />,
    );
    expect(screen.getByText(COPY.headingSubtext)).toBeDefined();
  });
});

describe("TransportPlannerOverviewView — empty state", () => {
  it("shows the empty-legs message when no legs are passed", () => {
    render(
      <TransportPlannerOverviewView
        legs={[]}
        onToggleMemberSortedOwn={vi.fn()}
      />,
    );
    expect(screen.getByText(COPY.emptyLegsMessage)).toBeDefined();
  });

  it("does not render any leg sections when legs are empty", () => {
    const { container } = render(
      <TransportPlannerOverviewView
        legs={[]}
        onToggleMemberSortedOwn={vi.fn()}
      />,
    );
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
        onToggleMemberSortedOwn={vi.fn()}
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
        onToggleMemberSortedOwn={vi.fn()}
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
        onToggleMemberSortedOwn={vi.fn()}
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
        onToggleMemberSortedOwn={vi.fn()}
      />,
    );
    expect(screen.getByText(COPY.gapPill(3))).toBeDefined();
  });
});

describe("TransportPlannerOverviewView — demand breakdown", () => {
  it("renders the demand card title", () => {
    render(
      <TransportPlannerOverviewView
        legs={[makeLegSummary()]}
        onToggleMemberSortedOwn={vi.fn()}
      />,
    );
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
              skipLeg: 0,
              noReply: 0,
            },
          }),
        ]}
        onToggleMemberSortedOwn={vi.fn()}
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
              skipLeg: 0,
              noReply: 0,
            },
          }),
        ]}
        onToggleMemberSortedOwn={vi.fn()}
      />,
    );
    expect(screen.getByText(COPY.demandNeedRide)).toBeDefined();
    expect(screen.getByText("4")).toBeDefined();
  });

  it("renders the no-reply count", () => {
    render(
      <TransportPlannerOverviewView
        legs={[
          makeLegSummary({
            demand: {
              driving: 0,
              needRide: 0,
              skipLeg: 0,
              noReply: 5,
            },
          }),
        ]}
        onToggleMemberSortedOwn={vi.fn()}
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
              skipLeg: 6,
              noReply: 0,
            },
          }),
        ]}
        onToggleMemberSortedOwn={vi.fn()}
      />,
    );
    expect(screen.getByText(COPY.demandSkipLeg)).toBeDefined();
    expect(screen.getByText("6")).toBeDefined();
  });
});

describe("TransportPlannerOverviewView — supply card", () => {
  it("renders the supply card title", () => {
    render(
      <TransportPlannerOverviewView
        legs={[makeLegSummary()]}
        onToggleMemberSortedOwn={vi.fn()}
      />,
    );
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
        onToggleMemberSortedOwn={vi.fn()}
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
        onToggleMemberSortedOwn={vi.fn()}
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
        onToggleMemberSortedOwn={vi.fn()}
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
        onToggleMemberSortedOwn={vi.fn()}
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
        onToggleMemberSortedOwn={vi.fn()}
      />,
    );
    expect(screen.getByText(COPY.seatsLabel(7))).toBeDefined();
    expect(screen.getByText(COPY.driversLabel(2))).toBeDefined();
  });
});

function makeNonAccountMember(
  overrides: Partial<NonAccountMemberTransportSummary> = {},
): NonAccountMemberTransportSummary {
  return {
    memberId: "member-1",
    name: "Dana",
    sortedOwnTransport: false,
    ...overrides,
  };
}

describe("TransportPlannerOverviewView — non-account members section", () => {
  it("renders the non-account members section title when members are present", () => {
    render(
      <TransportPlannerOverviewView
        legs={[
          makeLegSummary({
            nonAccountMembers: [makeNonAccountMember()],
          }),
        ]}
        onToggleMemberSortedOwn={vi.fn()}
      />,
    );

    expect(screen.getByText(COPY.nonAccountMembersTitle)).toBeDefined();
  });

  it("renders each non-account member by name", () => {
    render(
      <TransportPlannerOverviewView
        legs={[
          makeLegSummary({
            nonAccountMembers: [
              makeNonAccountMember({ memberId: "m-1", name: "Dana" }),
              makeNonAccountMember({ memberId: "m-2", name: "Eli" }),
            ],
          }),
        ]}
        onToggleMemberSortedOwn={vi.fn()}
      />,
    );

    expect(screen.getByText("Dana")).toBeDefined();
    expect(screen.getByText("Eli")).toBeDefined();
  });

  it("does not render the non-account members section when nonAccountMembers is absent", () => {
    render(
      <TransportPlannerOverviewView
        legs={[makeLegSummary()]}
        onToggleMemberSortedOwn={vi.fn()}
      />,
    );

    expect(screen.queryByText(COPY.nonAccountMembersTitle)).toBeNull();
  });

  it("does not render the non-account members section when the list is empty", () => {
    render(
      <TransportPlannerOverviewView
        legs={[makeLegSummary({ nonAccountMembers: [] })]}
        onToggleMemberSortedOwn={vi.fn()}
      />,
    );

    expect(screen.queryByText(COPY.nonAccountMembersTitle)).toBeNull();
  });
});

describe("TransportPlannerOverviewView — sorted-own checkbox reflects current state", () => {
  it("renders member checkbox as checked when sortedOwnTransport is true", () => {
    render(
      <TransportPlannerOverviewView
        legs={[
          makeLegSummary({
            nonAccountMembers: [
              makeNonAccountMember({
                memberId: "m-1",
                name: "Dana",
                sortedOwnTransport: true,
              }),
            ],
          }),
        ]}
        onToggleMemberSortedOwn={vi.fn()}
      />,
    );

    const checkedBox = screen.getByLabelText("Dana");
    expect((checkedBox as HTMLInputElement).checked).toBe(true);
  });

  it("renders member checkbox as unchecked when sortedOwnTransport is false", () => {
    render(
      <TransportPlannerOverviewView
        legs={[
          makeLegSummary({
            nonAccountMembers: [
              makeNonAccountMember({
                memberId: "m-1",
                name: "Dana",
                sortedOwnTransport: false,
              }),
            ],
          }),
        ]}
        onToggleMemberSortedOwn={vi.fn()}
      />,
    );

    const uncheckedBox = screen.getByLabelText("Dana");
    expect((uncheckedBox as HTMLInputElement).checked).toBe(false);
  });
});

describe("TransportPlannerOverviewView — toggling sorted-own fires onToggleMemberSortedOwn", () => {
  it("calls onToggleMemberSortedOwn with legId, memberId, and true when checking", () => {
    const onToggle = vi.fn();
    render(
      <TransportPlannerOverviewView
        legs={[
          makeLegSummary({
            leg: makeLeg({ legId: "leg-99" }),
            nonAccountMembers: [
              makeNonAccountMember({ memberId: "m-42", name: "Dana" }),
            ],
          }),
        ]}
        onToggleMemberSortedOwn={onToggle}
      />,
    );

    fireEvent.click(screen.getByLabelText("Dana"));
    expect(onToggle).toHaveBeenCalledWith("leg-99", "m-42", true);
  });

  it("calls onToggleMemberSortedOwn with false when unchecking", () => {
    const onToggle = vi.fn();
    render(
      <TransportPlannerOverviewView
        legs={[
          makeLegSummary({
            leg: makeLeg({ legId: "leg-99" }),
            nonAccountMembers: [
              makeNonAccountMember({
                memberId: "m-42",
                name: "Dana",
                sortedOwnTransport: true,
              }),
            ],
          }),
        ]}
        onToggleMemberSortedOwn={onToggle}
      />,
    );

    fireEvent.click(screen.getByLabelText("Dana"));
    expect(onToggle).toHaveBeenCalledWith("leg-99", "m-42", false);
  });
});
