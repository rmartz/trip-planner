import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { TimeOfDaySlot } from "@/lib/types/activity";
import {
  type ProposedActivityItem,
  ScheduleBuilderView,
} from "./ScheduleBuilderView";
import { SCHEDULE_BUILDER_COPY } from "./ScheduleBuilderView.copy";

afterEach(cleanup);

function makeActivity(
  overrides: Partial<ProposedActivityItem> = {},
): ProposedActivityItem {
  return {
    activityId: "activity-1",
    name: "Morning hike",
    pinned: false,
    timeOfDaySlot: undefined,
    order: 0,
    ...overrides,
  };
}

describe("ScheduleBuilderView — heading", () => {
  it("renders the page heading", () => {
    render(
      <ScheduleBuilderView
        stopName="London"
        activities={[]}
        onReorder={vi.fn()}
        onPublish={vi.fn()}
      />,
    );
    expect(screen.getByText(SCHEDULE_BUILDER_COPY.heading)).toBeDefined();
  });

  it("renders the heading subtext", () => {
    render(
      <ScheduleBuilderView
        stopName="London"
        activities={[]}
        onReorder={vi.fn()}
        onPublish={vi.fn()}
      />,
    );
    expect(
      screen.getByText(SCHEDULE_BUILDER_COPY.headingSubtext),
    ).toBeDefined();
  });

  it("renders the stop name", () => {
    render(
      <ScheduleBuilderView
        stopName="Paris"
        activities={[]}
        onReorder={vi.fn()}
        onPublish={vi.fn()}
      />,
    );
    expect(
      screen.getByText(SCHEDULE_BUILDER_COPY.stopLabel("Paris")),
    ).toBeDefined();
  });
});

describe("ScheduleBuilderView — draft badge", () => {
  it("renders the draft badge", () => {
    render(
      <ScheduleBuilderView
        stopName="London"
        activities={[]}
        onReorder={vi.fn()}
        onPublish={vi.fn()}
      />,
    );
    expect(screen.getByText(SCHEDULE_BUILDER_COPY.draftBadge)).toBeDefined();
  });
});

describe("ScheduleBuilderView — empty state", () => {
  it("renders an empty message when no activities are provided", () => {
    render(
      <ScheduleBuilderView
        stopName="London"
        activities={[]}
        onReorder={vi.fn()}
        onPublish={vi.fn()}
      />,
    );
    expect(
      screen.getByText(SCHEDULE_BUILDER_COPY.emptyProposals),
    ).toBeDefined();
  });
});

describe("ScheduleBuilderView — pinned activities section", () => {
  it("renders the pinned section heading when pinned activities exist", () => {
    render(
      <ScheduleBuilderView
        stopName="London"
        activities={[makeActivity({ pinned: true })]}
        onReorder={vi.fn()}
        onPublish={vi.fn()}
      />,
    );
    expect(
      screen.getByText(SCHEDULE_BUILDER_COPY.pinnedSectionHeading),
    ).toBeDefined();
  });

  it("does not render the pinned section when no pinned activities exist", () => {
    render(
      <ScheduleBuilderView
        stopName="London"
        activities={[makeActivity({ pinned: false })]}
        onReorder={vi.fn()}
        onPublish={vi.fn()}
      />,
    );
    expect(
      screen.queryByText(SCHEDULE_BUILDER_COPY.pinnedSectionHeading),
    ).toBeNull();
  });

  it("renders pinned activity names in the pinned section", () => {
    render(
      <ScheduleBuilderView
        stopName="London"
        activities={[
          makeActivity({
            activityId: "a-1",
            name: "Birthday dinner",
            pinned: true,
          }),
        ]}
        onReorder={vi.fn()}
        onPublish={vi.fn()}
      />,
    );
    const pinnedItems = screen.getAllByTestId("pinned-activity-item");
    expect(pinnedItems[0]?.textContent).toContain("Birthday dinner");
  });

  it("renders the time-of-day slot label for a pinned activity that has one", () => {
    render(
      <ScheduleBuilderView
        stopName="London"
        activities={[
          makeActivity({
            activityId: "a-1",
            name: "Birthday dinner",
            pinned: true,
            timeOfDaySlot: TimeOfDaySlot.Evening,
          }),
        ]}
        onReorder={vi.fn()}
        onPublish={vi.fn()}
      />,
    );
    expect(
      screen.getByText(SCHEDULE_BUILDER_COPY.slotLabel(TimeOfDaySlot.Evening)),
    ).toBeDefined();
  });

  it("does not render move-up/down buttons for pinned activities", () => {
    render(
      <ScheduleBuilderView
        stopName="London"
        activities={[
          makeActivity({ activityId: "a-1", pinned: true }),
          makeActivity({ activityId: "a-2", pinned: true, order: 1 }),
        ]}
        onReorder={vi.fn()}
        onPublish={vi.fn()}
      />,
    );
    expect(
      screen.queryByRole("button", {
        name: SCHEDULE_BUILDER_COPY.moveUpLabel,
      }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", {
        name: SCHEDULE_BUILDER_COPY.moveDownLabel,
      }),
    ).toBeNull();
  });
});

describe("ScheduleBuilderView — proposed activities section", () => {
  it("renders the proposed section heading when unpinned activities exist", () => {
    render(
      <ScheduleBuilderView
        stopName="London"
        activities={[makeActivity({ pinned: false })]}
        onReorder={vi.fn()}
        onPublish={vi.fn()}
      />,
    );
    expect(
      screen.getByText(SCHEDULE_BUILDER_COPY.proposedSectionHeading),
    ).toBeDefined();
  });

  it("renders each unpinned activity name in the proposed section", () => {
    render(
      <ScheduleBuilderView
        stopName="London"
        activities={[
          makeActivity({ activityId: "a-1", name: "Kayaking", pinned: false }),
          makeActivity({
            activityId: "a-2",
            name: "Museum tour",
            pinned: false,
            order: 1,
          }),
        ]}
        onReorder={vi.fn()}
        onPublish={vi.fn()}
      />,
    );
    expect(screen.getByText("Kayaking")).toBeDefined();
    expect(screen.getByText("Museum tour")).toBeDefined();
  });

  it("renders activities in ascending order by `order`", () => {
    render(
      <ScheduleBuilderView
        stopName="London"
        activities={[
          makeActivity({
            activityId: "a-second",
            name: "Second",
            pinned: false,
            order: 1,
          }),
          makeActivity({
            activityId: "a-first",
            name: "First",
            pinned: false,
            order: 0,
          }),
          makeActivity({
            activityId: "a-third",
            name: "Third",
            pinned: false,
            order: 2,
          }),
        ]}
        onReorder={vi.fn()}
        onPublish={vi.fn()}
      />,
    );
    const items = screen.getAllByTestId("proposed-activity-item");
    expect(items[0]?.textContent).toContain("First");
    expect(items[1]?.textContent).toContain("Second");
    expect(items[2]?.textContent).toContain("Third");
  });

  it("renders the time-of-day slot label for a proposed activity that has one", () => {
    render(
      <ScheduleBuilderView
        stopName="London"
        activities={[
          makeActivity({
            activityId: "a-1",
            name: "Morning walk",
            pinned: false,
            timeOfDaySlot: TimeOfDaySlot.Morning,
          }),
        ]}
        onReorder={vi.fn()}
        onPublish={vi.fn()}
      />,
    );
    expect(
      screen.getByText(SCHEDULE_BUILDER_COPY.slotLabel(TimeOfDaySlot.Morning)),
    ).toBeDefined();
  });
});

describe("ScheduleBuilderView — move up/down controls", () => {
  it("renders move-up and move-down buttons for reorderable activities", () => {
    render(
      <ScheduleBuilderView
        stopName="London"
        activities={[
          makeActivity({ activityId: "a-1", pinned: false, order: 0 }),
          makeActivity({ activityId: "a-2", pinned: false, order: 1 }),
        ]}
        onReorder={vi.fn()}
        onPublish={vi.fn()}
      />,
    );
    expect(
      screen.getAllByRole("button", {
        name: SCHEDULE_BUILDER_COPY.moveUpLabel,
      }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("button", {
        name: SCHEDULE_BUILDER_COPY.moveDownLabel,
      }).length,
    ).toBeGreaterThan(0);
  });

  it("calls onReorder with the new activity-id order when Move Up is clicked on the second item", () => {
    const onReorder = vi.fn();
    render(
      <ScheduleBuilderView
        stopName="London"
        activities={[
          makeActivity({
            activityId: "a-1",
            name: "First",
            pinned: false,
            order: 0,
          }),
          makeActivity({
            activityId: "a-2",
            name: "Second",
            pinned: false,
            order: 1,
          }),
        ]}
        onReorder={onReorder}
        onPublish={vi.fn()}
      />,
    );
    // The second item's Move Up button is at index 1 (index 0 is the first item's disabled button)
    const moveUpButtons = screen.getAllByRole("button", {
      name: SCHEDULE_BUILDER_COPY.moveUpLabel,
    });
    const secondMoveUp = moveUpButtons[1];
    expect(secondMoveUp).toBeDefined();
    fireEvent.click(secondMoveUp!);
    expect(onReorder).toHaveBeenCalledWith(["a-2", "a-1"]);
  });

  it("calls onReorder with the new activity-id order when Move Down is clicked on the first item", () => {
    const onReorder = vi.fn();
    render(
      <ScheduleBuilderView
        stopName="London"
        activities={[
          makeActivity({
            activityId: "a-1",
            name: "First",
            pinned: false,
            order: 0,
          }),
          makeActivity({
            activityId: "a-2",
            name: "Second",
            pinned: false,
            order: 1,
          }),
        ]}
        onReorder={onReorder}
        onPublish={vi.fn()}
      />,
    );
    const moveDownButtons = screen.getAllByRole("button", {
      name: SCHEDULE_BUILDER_COPY.moveDownLabel,
    });
    const firstMoveDown = moveDownButtons[0];
    expect(firstMoveDown).toBeDefined();
    fireEvent.click(firstMoveDown!);
    expect(onReorder).toHaveBeenCalledWith(["a-2", "a-1"]);
  });

  it("disables Move Up button for the first unpinned activity", () => {
    render(
      <ScheduleBuilderView
        stopName="London"
        activities={[
          makeActivity({ activityId: "a-1", pinned: false, order: 0 }),
          makeActivity({ activityId: "a-2", pinned: false, order: 1 }),
        ]}
        onReorder={vi.fn()}
        onPublish={vi.fn()}
      />,
    );
    const moveUpButtons = screen.getAllByRole("button", {
      name: SCHEDULE_BUILDER_COPY.moveUpLabel,
    });
    expect((moveUpButtons[0] as HTMLButtonElement).disabled).toBe(true);
  });

  it("disables Move Down button for the last unpinned activity", () => {
    render(
      <ScheduleBuilderView
        stopName="London"
        activities={[
          makeActivity({ activityId: "a-1", pinned: false, order: 0 }),
          makeActivity({ activityId: "a-2", pinned: false, order: 1 }),
        ]}
        onReorder={vi.fn()}
        onPublish={vi.fn()}
      />,
    );
    const moveDownButtons = screen.getAllByRole("button", {
      name: SCHEDULE_BUILDER_COPY.moveDownLabel,
    });
    expect(
      (moveDownButtons[moveDownButtons.length - 1] as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });
});

describe("ScheduleBuilderView — publish action", () => {
  it("renders the publish button", () => {
    render(
      <ScheduleBuilderView
        stopName="London"
        activities={[]}
        onReorder={vi.fn()}
        onPublish={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: SCHEDULE_BUILDER_COPY.publishButton }),
    ).toBeDefined();
  });

  it("calls onPublish when the publish button is clicked", () => {
    const onPublish = vi.fn();
    render(
      <ScheduleBuilderView
        stopName="London"
        activities={[]}
        onReorder={vi.fn()}
        onPublish={onPublish}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: SCHEDULE_BUILDER_COPY.publishButton }),
    );
    expect(onPublish).toHaveBeenCalledTimes(1);
  });
});
