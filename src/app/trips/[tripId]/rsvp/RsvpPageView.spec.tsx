import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { TripRole } from "@/lib/types/trip";
import {
  RsvpPageView,
  RsvpStatus,
  type RsvpScheduledActivity,
} from "./RsvpPageView";
import { RSVP_PAGE_COPY } from "./RsvpPageView.copy";

afterEach(cleanup);

function makeActivity(
  overrides: Partial<RsvpScheduledActivity> = {},
): RsvpScheduledActivity {
  return {
    activityId: "act-1",
    name: "Welcome breakfast",
    timeSlot: "09:00",
    status: RsvpStatus.Pending,
    ...overrides,
  };
}

describe("RsvpPageView — loading state", () => {
  it("renders loading text when isLoading is true", () => {
    render(
      <RsvpPageView
        activities={[]}
        viewerRole={TripRole.Guest}
        isLoading={true}
        isError={false}
        onConfirm={vi.fn()}
        onDecline={vi.fn()}
      />,
    );
    expect(screen.getByText(RSVP_PAGE_COPY.loadingText)).toBeDefined();
  });

  it("does not render the RSVP list when loading", () => {
    const { container } = render(
      <RsvpPageView
        activities={[makeActivity()]}
        viewerRole={TripRole.Guest}
        isLoading={true}
        isError={false}
        onConfirm={vi.fn()}
        onDecline={vi.fn()}
      />,
    );
    expect(container.querySelector("[data-testid=rsvp-list]")).toBeNull();
  });
});

describe("RsvpPageView — error state", () => {
  it("renders error text when isError is true", () => {
    render(
      <RsvpPageView
        activities={[]}
        viewerRole={TripRole.Guest}
        isLoading={false}
        isError={true}
        onConfirm={vi.fn()}
        onDecline={vi.fn()}
      />,
    );
    expect(screen.getByText(RSVP_PAGE_COPY.errorText)).toBeDefined();
  });

  it("does not render the RSVP list when in error state", () => {
    const { container } = render(
      <RsvpPageView
        activities={[makeActivity()]}
        viewerRole={TripRole.Guest}
        isLoading={false}
        isError={true}
        onConfirm={vi.fn()}
        onDecline={vi.fn()}
      />,
    );
    expect(container.querySelector("[data-testid=rsvp-list]")).toBeNull();
  });
});

describe("RsvpPageView — empty state", () => {
  it("renders empty text when no activities are scheduled (guest)", () => {
    render(
      <RsvpPageView
        activities={[]}
        viewerRole={TripRole.Guest}
        isLoading={false}
        isError={false}
        onConfirm={vi.fn()}
        onDecline={vi.fn()}
      />,
    );
    expect(screen.getByText(RSVP_PAGE_COPY.emptyText)).toBeDefined();
  });
});

describe("RsvpPageView — heading", () => {
  it("renders the page heading", () => {
    render(
      <RsvpPageView
        activities={[]}
        viewerRole={TripRole.Guest}
        isLoading={false}
        isError={false}
        onConfirm={vi.fn()}
        onDecline={vi.fn()}
      />,
    );
    expect(screen.getByText(RSVP_PAGE_COPY.heading)).toBeDefined();
  });

  it("renders the heading subtext", () => {
    render(
      <RsvpPageView
        activities={[]}
        viewerRole={TripRole.Guest}
        isLoading={false}
        isError={false}
        onConfirm={vi.fn()}
        onDecline={vi.fn()}
      />,
    );
    expect(screen.getByText(RSVP_PAGE_COPY.headingSubtext)).toBeDefined();
  });
});

describe("RsvpPageView — guest loaded state (activity list)", () => {
  it("renders one row per scheduled activity", () => {
    const { container } = render(
      <RsvpPageView
        activities={[
          makeActivity({ activityId: "a-1", name: "Hike" }),
          makeActivity({ activityId: "a-2", name: "Lunch" }),
          makeActivity({ activityId: "a-3", name: "Museum" }),
        ]}
        viewerRole={TripRole.Guest}
        isLoading={false}
        isError={false}
        onConfirm={vi.fn()}
        onDecline={vi.fn()}
      />,
    );
    const list = container.querySelector("[data-testid=rsvp-list]");
    expect(list?.children.length).toBe(3);
  });

  it("renders each activity's name", () => {
    render(
      <RsvpPageView
        activities={[
          makeActivity({ activityId: "a-1", name: "Hike" }),
          makeActivity({ activityId: "a-2", name: "Lunch" }),
        ]}
        viewerRole={TripRole.Guest}
        isLoading={false}
        isError={false}
        onConfirm={vi.fn()}
        onDecline={vi.fn()}
      />,
    );
    expect(screen.getByText("Hike")).toBeDefined();
    expect(screen.getByText("Lunch")).toBeDefined();
  });

  it("renders each activity's time slot", () => {
    render(
      <RsvpPageView
        activities={[
          makeActivity({ activityId: "a-1", timeSlot: "09:00" }),
          makeActivity({ activityId: "a-2", timeSlot: "13:30" }),
        ]}
        viewerRole={TripRole.Guest}
        isLoading={false}
        isError={false}
        onConfirm={vi.fn()}
        onDecline={vi.fn()}
      />,
    );
    expect(screen.getByText("09:00")).toBeDefined();
    expect(screen.getByText("13:30")).toBeDefined();
  });

  it("renders confirm and decline buttons for each activity", () => {
    render(
      <RsvpPageView
        activities={[makeActivity()]}
        viewerRole={TripRole.Guest}
        isLoading={false}
        isError={false}
        onConfirm={vi.fn()}
        onDecline={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: RSVP_PAGE_COPY.confirmButton }),
    ).toBeDefined();
    expect(
      screen.getByRole("button", { name: RSVP_PAGE_COPY.declineButton }),
    ).toBeDefined();
  });

  it("invokes onConfirm with the activity id when confirm is clicked", () => {
    const onConfirm = vi.fn();
    render(
      <RsvpPageView
        activities={[makeActivity({ activityId: "a-42" })]}
        viewerRole={TripRole.Guest}
        isLoading={false}
        isError={false}
        onConfirm={onConfirm}
        onDecline={vi.fn()}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: RSVP_PAGE_COPY.confirmButton }),
    );
    expect(onConfirm).toHaveBeenCalledWith("a-42");
  });

  it("invokes onDecline with the activity id when decline is clicked", () => {
    const onDecline = vi.fn();
    render(
      <RsvpPageView
        activities={[makeActivity({ activityId: "a-42" })]}
        viewerRole={TripRole.Guest}
        isLoading={false}
        isError={false}
        onConfirm={vi.fn()}
        onDecline={onDecline}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: RSVP_PAGE_COPY.declineButton }),
    );
    expect(onDecline).toHaveBeenCalledWith("a-42");
  });
});

describe("RsvpPageView — planner role", () => {
  it("renders the planner notice when viewer is a Planner", () => {
    render(
      <RsvpPageView
        activities={[makeActivity()]}
        viewerRole={TripRole.Planner}
        isLoading={false}
        isError={false}
        onConfirm={vi.fn()}
        onDecline={vi.fn()}
      />,
    );
    expect(screen.getByText(RSVP_PAGE_COPY.plannerNoticeText)).toBeDefined();
  });

  it("does not render the RSVP list when viewer is a Planner", () => {
    const { container } = render(
      <RsvpPageView
        activities={[makeActivity()]}
        viewerRole={TripRole.Planner}
        isLoading={false}
        isError={false}
        onConfirm={vi.fn()}
        onDecline={vi.fn()}
      />,
    );
    expect(container.querySelector("[data-testid=rsvp-list]")).toBeNull();
  });

  it("does not render the planner notice when viewer is a Guest", () => {
    render(
      <RsvpPageView
        activities={[makeActivity()]}
        viewerRole={TripRole.Guest}
        isLoading={false}
        isError={false}
        onConfirm={vi.fn()}
        onDecline={vi.fn()}
      />,
    );
    expect(screen.queryByText(RSVP_PAGE_COPY.plannerNoticeText)).toBeNull();
  });
});
