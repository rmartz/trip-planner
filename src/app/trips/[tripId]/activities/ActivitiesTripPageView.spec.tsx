import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { InterestVote } from "@/lib/types/interest-vote";
import { TripRole } from "@/lib/types/trip";
import {
  ActivitiesTripPageView,
  type ActivityProposal,
} from "./ActivitiesTripPageView";
import { ACTIVITIES_TRIP_PAGE_COPY } from "./ActivitiesTripPageView.copy";
import { VOTE_ROW_COPY } from "@/components/ui/VoteRow.copy";

afterEach(cleanup);

function makeProposal(
  overrides: Partial<ActivityProposal> = {},
): ActivityProposal {
  return {
    proposalId: "prop-1",
    name: "Hiking the Ridge Trail",
    description: "Bring water and sunscreen.",
    proposerName: "Alice",
    counts: { yes: 2, maybe: 1, no: 0 },
    timeHint: "Saturday morning",
    userVote: undefined,
    voterNames: { yes: [], maybe: [], no: [] },
    ...overrides,
  };
}

describe("ActivitiesTripPageView — loading state", () => {
  it("renders loading text when isLoading is true", () => {
    render(
      <ActivitiesTripPageView
        proposals={[]}
        isLoading={true}
        isError={false}
        onVote={vi.fn()}
      />,
    );
    expect(
      screen.getByText(ACTIVITIES_TRIP_PAGE_COPY.loadingText),
    ).toBeDefined();
  });

  it("does not render the proposals list when loading", () => {
    const { container } = render(
      <ActivitiesTripPageView
        proposals={[makeProposal()]}
        isLoading={true}
        isError={false}
        onVote={vi.fn()}
      />,
    );
    expect(
      container.querySelector("[data-testid=activities-trip-list]"),
    ).toBeNull();
  });
});

describe("ActivitiesTripPageView — error state", () => {
  it("renders error text when isError is true", () => {
    render(
      <ActivitiesTripPageView
        proposals={[]}
        isLoading={false}
        isError={true}
        onVote={vi.fn()}
      />,
    );
    expect(screen.getByText(ACTIVITIES_TRIP_PAGE_COPY.errorText)).toBeDefined();
  });

  it("does not render the proposals list when in error state", () => {
    const { container } = render(
      <ActivitiesTripPageView
        proposals={[makeProposal()]}
        isLoading={false}
        isError={true}
        onVote={vi.fn()}
      />,
    );
    expect(
      container.querySelector("[data-testid=activities-trip-list]"),
    ).toBeNull();
  });
});

describe("ActivitiesTripPageView — empty state", () => {
  it("renders empty text when there are no proposals", () => {
    render(
      <ActivitiesTripPageView
        proposals={[]}
        isLoading={false}
        isError={false}
        onVote={vi.fn()}
      />,
    );
    expect(screen.getByText(ACTIVITIES_TRIP_PAGE_COPY.emptyText)).toBeDefined();
  });
});

describe("ActivitiesTripPageView — loaded state", () => {
  it("renders each proposal's title", () => {
    render(
      <ActivitiesTripPageView
        proposals={[
          makeProposal({ proposalId: "p-1", name: "Hiking" }),
          makeProposal({ proposalId: "p-2", name: "Kayaking" }),
        ]}
        isLoading={false}
        isError={false}
        onVote={vi.fn()}
      />,
    );
    expect(screen.getByText("Hiking")).toBeDefined();
    expect(screen.getByText("Kayaking")).toBeDefined();
  });

  it("renders one row per proposal inside the list", () => {
    const { container } = render(
      <ActivitiesTripPageView
        proposals={[
          makeProposal({ proposalId: "p-1", name: "Hiking" }),
          makeProposal({ proposalId: "p-2", name: "Kayaking" }),
          makeProposal({ proposalId: "p-3", name: "Cooking class" }),
        ]}
        isLoading={false}
        isError={false}
        onVote={vi.fn()}
      />,
    );
    const list = container.querySelector("[data-testid=activities-trip-list]");
    expect(list?.children.length).toBe(3);
  });

  it("renders the activities heading when loaded", () => {
    render(
      <ActivitiesTripPageView
        proposals={[makeProposal()]}
        isLoading={false}
        isError={false}
        onVote={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("heading", {
        name: ACTIVITIES_TRIP_PAGE_COPY.heading,
      }),
    ).toBeDefined();
  });

  it("renders the proposer name for each proposal", () => {
    render(
      <ActivitiesTripPageView
        proposals={[
          makeProposal({
            proposalId: "p-1",
            name: "Hiking",
            proposerName: "Alice",
          }),
        ]}
        isLoading={false}
        isError={false}
        onVote={vi.fn()}
      />,
    );
    expect(
      screen.getByText(`${ACTIVITIES_TRIP_PAGE_COPY.proposedByPrefix} Alice`),
    ).toBeDefined();
  });

  it("renders the description for each proposal", () => {
    render(
      <ActivitiesTripPageView
        proposals={[
          makeProposal({
            proposalId: "p-1",
            name: "Hiking",
            description: "Bring water and sunscreen.",
          }),
        ]}
        isLoading={false}
        isError={false}
        onVote={vi.fn()}
      />,
    );
    expect(screen.getByText("Bring water and sunscreen.")).toBeDefined();
  });

  it("renders the time hint for each proposal", () => {
    render(
      <ActivitiesTripPageView
        proposals={[
          makeProposal({
            proposalId: "p-1",
            name: "Hiking",
            timeHint: "Saturday morning",
          }),
        ]}
        isLoading={false}
        isError={false}
        onVote={vi.fn()}
      />,
    );
    expect(
      screen.getByText(
        `${ACTIVITIES_TRIP_PAGE_COPY.timeHintPrefix} Saturday morning`,
      ),
    ).toBeDefined();
  });

  it("renders Yes/Maybe/No vote buttons via VoteRow for each proposal", () => {
    render(
      <ActivitiesTripPageView
        proposals={[makeProposal()]}
        isLoading={false}
        isError={false}
        onVote={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Yes" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Maybe" })).toBeDefined();
    expect(screen.getByRole("button", { name: "No" })).toBeDefined();
  });

  it("invokes onVote with the proposal id and selected vote when a VoteRow button is clicked", () => {
    const onVote = vi.fn();
    render(
      <ActivitiesTripPageView
        proposals={[makeProposal({ proposalId: "p-42", name: "Hiking" })]}
        isLoading={false}
        isError={false}
        onVote={onVote}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Yes" }));
    expect(onVote).toHaveBeenCalledWith("p-42", InterestVote.Yes);
  });
});

describe("ActivitiesTripPageView — planner role: by-name inset visible", () => {
  it("renders the by-name sub-header for planners", () => {
    render(
      <ActivitiesTripPageView
        proposals={[
          makeProposal({
            proposalId: "p-1",
            voterNames: { yes: ["Marco"], maybe: [], no: [] },
          }),
        ]}
        isLoading={false}
        isError={false}
        role={TripRole.Planner}
        onVote={vi.fn()}
      />,
    );
    expect(
      screen.getByText(ACTIVITIES_TRIP_PAGE_COPY.byNameSubheader),
    ).toBeDefined();
  });

  it("renders yes voter names in the inset", () => {
    render(
      <ActivitiesTripPageView
        proposals={[
          makeProposal({
            proposalId: "p-1",
            voterNames: { yes: ["Marco", "Jess"], maybe: [], no: [] },
          }),
        ]}
        isLoading={false}
        isError={false}
        role={TripRole.Planner}
        onVote={vi.fn()}
      />,
    );
    expect(screen.getByText(/Marco/)).toBeDefined();
    expect(screen.getByText(/Jess/)).toBeDefined();
  });

  it("renders maybe voter names in the inset", () => {
    render(
      <ActivitiesTripPageView
        proposals={[
          makeProposal({
            proposalId: "p-1",
            voterNames: { yes: [], maybe: ["Kev"], no: [] },
          }),
        ]}
        isLoading={false}
        isError={false}
        role={TripRole.Planner}
        onVote={vi.fn()}
      />,
    );
    expect(screen.getByText(/Kev/)).toBeDefined();
  });

  it("renders no voter names in the inset", () => {
    render(
      <ActivitiesTripPageView
        proposals={[
          makeProposal({
            proposalId: "p-1",
            voterNames: { yes: [], maybe: [], no: ["Pat"] },
          }),
        ]}
        isLoading={false}
        isError={false}
        role={TripRole.Planner}
        onVote={vi.fn()}
      />,
    );
    expect(screen.getByText(/Pat/)).toBeDefined();
  });

  it("shows overflow +N when more than 3 voters in a category", () => {
    render(
      <ActivitiesTripPageView
        proposals={[
          makeProposal({
            proposalId: "p-1",
            voterNames: {
              yes: ["Marco", "Jess", "Tara", "Bob", "Carol"],
              maybe: [],
              no: [],
            },
          }),
        ]}
        isLoading={false}
        isError={false}
        role={TripRole.Planner}
        onVote={vi.fn()}
      />,
    );
    expect(
      screen.getByText(ACTIVITIES_TRIP_PAGE_COPY.overflowLabel(2)),
    ).toBeDefined();
  });

  it("renders aggregate vote counts for planners", () => {
    render(
      <ActivitiesTripPageView
        proposals={[
          makeProposal({
            proposalId: "p-1",
            counts: { yes: 4, maybe: 1, no: 2 },
          }),
        ]}
        isLoading={false}
        isError={false}
        role={TripRole.Planner}
        onVote={vi.fn()}
      />,
    );
    expect(
      screen.getByText(VOTE_ROW_COPY.aggregateCounts(4, 1, 2)),
    ).toBeDefined();
  });

  it("does not show vote buttons when role is planner", () => {
    render(
      <ActivitiesTripPageView
        proposals={[makeProposal({ proposalId: "p-1" })]}
        isLoading={false}
        isError={false}
        role={TripRole.Planner}
        onVote={vi.fn()}
      />,
    );
    expect(screen.queryByRole("button", { name: "Yes" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Maybe" })).toBeNull();
    expect(screen.queryByRole("button", { name: "No" })).toBeNull();
  });
});

describe("ActivitiesTripPageView — guest role: by-name inset hidden", () => {
  it("does not render the by-name sub-header for guests", () => {
    render(
      <ActivitiesTripPageView
        proposals={[makeProposal({ proposalId: "p-1" })]}
        isLoading={false}
        isError={false}
        role={TripRole.Guest}
        onVote={vi.fn()}
      />,
    );
    expect(
      screen.queryByText(ACTIVITIES_TRIP_PAGE_COPY.byNameSubheader),
    ).toBeNull();
  });

  it("renders vote buttons for guests", () => {
    render(
      <ActivitiesTripPageView
        proposals={[makeProposal({ proposalId: "p-1" })]}
        isLoading={false}
        isError={false}
        role={TripRole.Guest}
        onVote={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Yes" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Maybe" })).toBeDefined();
    expect(screen.getByRole("button", { name: "No" })).toBeDefined();
  });
});
