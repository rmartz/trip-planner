import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { TimeOfDaySlot } from "@/lib/types/activity";
import { ScheduleBuilderView } from "../ScheduleBuilderView";
import { SCHEDULE_BUILDER_COPY } from "../ScheduleBuilderView.copy";
import { makeActivity } from "./fixtures";

afterEach(cleanup);

describe("ScheduleBuilderView — unpinned field reactivity with stable IDs", () => {
  it("reflects an updated activity name when the ID set is unchanged", () => {
    const { rerender } = render(
      <ScheduleBuilderView
        stopName="London"
        activities={[
          makeActivity({ activityId: "a-1", name: "Old name", pinned: false }),
        ]}
        onReorder={vi.fn()}
        onPublish={vi.fn()}
      />,
    );

    rerender(
      <ScheduleBuilderView
        stopName="London"
        activities={[
          makeActivity({ activityId: "a-1", name: "New name", pinned: false }),
        ]}
        onReorder={vi.fn()}
        onPublish={vi.fn()}
      />,
    );

    expect(screen.getByText("New name")).toBeDefined();
    expect(screen.queryByText("Old name")).toBeNull();
  });

  it("reflects an updated time-of-day slot when the ID set is unchanged", () => {
    const { rerender } = render(
      <ScheduleBuilderView
        stopName="London"
        activities={[
          makeActivity({
            activityId: "a-1",
            name: "Walk",
            pinned: false,
            timeOfDaySlot: TimeOfDaySlot.Morning,
          }),
        ]}
        onReorder={vi.fn()}
        onPublish={vi.fn()}
      />,
    );

    rerender(
      <ScheduleBuilderView
        stopName="London"
        activities={[
          makeActivity({
            activityId: "a-1",
            name: "Walk",
            pinned: false,
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
    expect(
      screen.queryByText(
        SCHEDULE_BUILDER_COPY.slotLabel(TimeOfDaySlot.Morning),
      ),
    ).toBeNull();
  });

  it("preserves a user reorder while still reflecting updated fields under the same IDs", () => {
    const onReorder = vi.fn();
    const { rerender } = render(
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

    // User moves the second item up: order becomes [a-2, a-1].
    screen
      .getByRole("button", {
        name: SCHEDULE_BUILDER_COPY.moveUpLabel("Second"),
      })
      .click();
    expect(onReorder).toHaveBeenCalledWith(["a-2", "a-1"]);

    // Props re-render with the same IDs but a renamed a-1.
    rerender(
      <ScheduleBuilderView
        stopName="London"
        activities={[
          makeActivity({
            activityId: "a-1",
            name: "First renamed",
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

    const items = screen.getAllByTestId("proposed-activity-item");
    // Reorder preserved: a-2 ("Second") first, a-1 ("First renamed") second.
    expect(items[0]?.textContent).toContain("Second");
    expect(items[1]?.textContent).toContain("First renamed");
    expect(screen.queryByText("First")).toBeNull();
  });
});
