import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { TimeOfDaySlot } from "@/lib/types/activity";
import { ScheduleBuilderView } from "../ScheduleBuilderView";
import { SCHEDULE_BUILDER_COPY } from "../ScheduleBuilderView.copy";
import { makeActivity } from "./fixtures";

afterEach(cleanup);

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

  it("renders pinned activities sorted by order", () => {
    render(
      <ScheduleBuilderView
        stopName="London"
        activities={[
          makeActivity({
            activityId: "a-2",
            name: "Second",
            pinned: true,
            order: 1,
          }),
          makeActivity({
            activityId: "a-1",
            name: "First",
            pinned: true,
            order: 0,
          }),
        ]}
        onReorder={vi.fn()}
        onPublish={vi.fn()}
      />,
    );
    const pinnedItems = screen.getAllByTestId("pinned-activity-item");
    expect(pinnedItems[0]?.textContent).toContain("First");
    expect(pinnedItems[1]?.textContent).toContain("Second");
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
          makeActivity({ activityId: "a-1", name: "Alpha", pinned: true }),
          makeActivity({
            activityId: "a-2",
            name: "Beta",
            pinned: true,
            order: 1,
          }),
        ]}
        onReorder={vi.fn()}
        onPublish={vi.fn()}
      />,
    );
    expect(
      screen.queryByRole("button", {
        name: SCHEDULE_BUILDER_COPY.moveUpLabel("Alpha"),
      }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", {
        name: SCHEDULE_BUILDER_COPY.moveDownLabel("Alpha"),
      }),
    ).toBeNull();
  });
});
