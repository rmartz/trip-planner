import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { TimeOfDaySlot } from "@/lib/types/activity";
import { ScheduleBuilderView } from "../ScheduleBuilderView";
import { SCHEDULE_BUILDER_COPY } from "../ScheduleBuilderView.copy";
import { makeActivity } from "./fixtures";

afterEach(cleanup);

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
