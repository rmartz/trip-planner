import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ScreenActivitiesView } from "../ScreenActivitiesView";
import { VOTE_ROW_COPY } from "@/components/ui/VoteRow.copy";
import type { Activity } from "@/lib/types/activity";
import { InterestVote } from "@/lib/types/interest-vote";
import { TripRole } from "@/lib/types/trip";
import type { VoteCounts } from "@/components/ui/VoteRow";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function makeActivity(overrides: Partial<Activity> = {}): Activity {
  return {
    activityId: "act-1",
    stopId: "stop-1",
    tripId: "trip-1",
    name: "Hiking",
    estimatedDurationMinutes: 120,
    ...overrides,
  };
}

function makeVoteCounts(overrides: Partial<VoteCounts> = {}): VoteCounts {
  return { yes: 0, maybe: 0, no: 0, ...overrides };
}

describe("ScreenActivitiesView — guest sees VoteRow on activity cards", () => {
  it("renders Yes, Maybe, and No buttons for a guest on an activity card", () => {
    render(
      <ScreenActivitiesView
        activities={[makeActivity()]}
        canPropose={false}
        onPropose={vi.fn()}
        role={TripRole.Guest}
        activityVotes={{
          "act-1": { userVote: undefined, counts: makeVoteCounts() },
        }}
        onVote={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: VOTE_ROW_COPY.yesLabel }),
    ).toBeDefined();
    expect(
      screen.getByRole("button", { name: VOTE_ROW_COPY.maybeLabel }),
    ).toBeDefined();
    expect(
      screen.getByRole("button", { name: VOTE_ROW_COPY.noLabel }),
    ).toBeDefined();
  });

  it("calls onVote with the activity id and Yes when Yes is clicked", () => {
    const onVote = vi.fn();
    render(
      <ScreenActivitiesView
        activities={[makeActivity({ activityId: "act-42" })]}
        canPropose={false}
        onPropose={vi.fn()}
        role={TripRole.Guest}
        activityVotes={{
          "act-42": { userVote: undefined, counts: makeVoteCounts() },
        }}
        onVote={onVote}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: VOTE_ROW_COPY.yesLabel }),
    );

    expect(onVote).toHaveBeenCalledWith("act-42", InterestVote.Yes);
  });

  it("calls onVote with the activity id and Maybe when Maybe is clicked", () => {
    const onVote = vi.fn();
    render(
      <ScreenActivitiesView
        activities={[makeActivity({ activityId: "act-7" })]}
        canPropose={false}
        onPropose={vi.fn()}
        role={TripRole.Guest}
        activityVotes={{
          "act-7": { userVote: undefined, counts: makeVoteCounts() },
        }}
        onVote={onVote}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: VOTE_ROW_COPY.maybeLabel }),
    );

    expect(onVote).toHaveBeenCalledWith("act-7", InterestVote.Maybe);
  });

  it("calls onVote with the activity id and No when No is clicked", () => {
    const onVote = vi.fn();
    render(
      <ScreenActivitiesView
        activities={[makeActivity({ activityId: "act-3" })]}
        canPropose={false}
        onPropose={vi.fn()}
        role={TripRole.Guest}
        activityVotes={{
          "act-3": { userVote: undefined, counts: makeVoteCounts() },
        }}
        onVote={onVote}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: VOTE_ROW_COPY.noLabel }),
    );

    expect(onVote).toHaveBeenCalledWith("act-3", InterestVote.No);
  });

  it("shows the Yes button as selected (aria-pressed=true) when the user has voted Yes", () => {
    render(
      <ScreenActivitiesView
        activities={[makeActivity()]}
        canPropose={false}
        onPropose={vi.fn()}
        role={TripRole.Guest}
        activityVotes={{
          "act-1": { userVote: InterestVote.Yes, counts: makeVoteCounts() },
        }}
        onVote={vi.fn()}
      />,
    );

    const yesBtn = screen.getByRole("button", { name: VOTE_ROW_COPY.yesLabel });
    expect(yesBtn.getAttribute("aria-pressed")).toBe("true");
  });

  it("does not render VoteRow buttons when the activity has no activityVotes entry", () => {
    render(
      <ScreenActivitiesView
        activities={[makeActivity({ activityId: "act-missing" })]}
        canPropose={false}
        onPropose={vi.fn()}
        role={TripRole.Guest}
        activityVotes={{}}
        onVote={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("button", { name: VOTE_ROW_COPY.yesLabel }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: VOTE_ROW_COPY.maybeLabel }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: VOTE_ROW_COPY.noLabel }),
    ).toBeNull();
  });
});

describe("ScreenActivitiesView — aggregate vote counts shown above vote row", () => {
  it("displays aggregate counts from activityVotes for a guest", () => {
    render(
      <ScreenActivitiesView
        activities={[makeActivity()]}
        canPropose={false}
        onPropose={vi.fn()}
        role={TripRole.Guest}
        activityVotes={{
          "act-1": {
            userVote: undefined,
            counts: makeVoteCounts({ yes: 3, maybe: 1, no: 2 }),
          },
        }}
        onVote={vi.fn()}
      />,
    );

    expect(
      screen.getByText(VOTE_ROW_COPY.aggregateCounts(3, 1, 2)),
    ).toBeDefined();
  });
});

describe("ScreenActivitiesView — planner does not see VoteRow buttons", () => {
  it("does not render Yes/Maybe/No buttons when role is Planner", () => {
    render(
      <ScreenActivitiesView
        activities={[makeActivity()]}
        canPropose={true}
        onPropose={vi.fn()}
        role={TripRole.Planner}
        activityVotes={{
          "act-1": { userVote: undefined, counts: makeVoteCounts() },
        }}
        onVote={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("button", { name: VOTE_ROW_COPY.yesLabel }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: VOTE_ROW_COPY.maybeLabel }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: VOTE_ROW_COPY.noLabel }),
    ).toBeNull();
  });
});
