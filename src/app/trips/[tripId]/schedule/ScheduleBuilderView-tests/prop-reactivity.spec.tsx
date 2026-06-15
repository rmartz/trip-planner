import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ScheduleBuilderView } from "../ScheduleBuilderView";
import { SCHEDULE_BUILDER_COPY } from "../ScheduleBuilderView.copy";
import { makeActivity } from "./fixtures";

afterEach(cleanup);

describe("ScheduleBuilderView — activities prop reactivity", () => {
  it("shows a newly added unpinned activity when the activities prop gains a new entry", () => {
    const { rerender } = render(
      <ScheduleBuilderView
        stopName="London"
        activities={[
          makeActivity({
            activityId: "a-1",
            name: "Alpha",
            pinned: false,
            order: 0,
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
            name: "Alpha",
            pinned: false,
            order: 0,
          }),
          makeActivity({
            activityId: "a-2",
            name: "Beta",
            pinned: false,
            order: 1,
          }),
        ]}
        onReorder={vi.fn()}
        onPublish={vi.fn()}
      />,
    );

    expect(screen.getByText("Beta")).toBeDefined();
  });

  it("hides a removed unpinned activity when the activities prop drops an entry", () => {
    const { rerender } = render(
      <ScheduleBuilderView
        stopName="London"
        activities={[
          makeActivity({
            activityId: "a-1",
            name: "Alpha",
            pinned: false,
            order: 0,
          }),
          makeActivity({
            activityId: "a-2",
            name: "Beta",
            pinned: false,
            order: 1,
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
            name: "Alpha",
            pinned: false,
            order: 0,
          }),
        ]}
        onReorder={vi.fn()}
        onPublish={vi.fn()}
      />,
    );

    expect(screen.getAllByTestId("proposed-activity-item").length).toBe(1);
  });

  it("preserves local reorder when the activities prop re-renders with the same IDs", () => {
    const activities = [
      makeActivity({
        activityId: "a-1",
        name: "Alpha",
        pinned: false,
        order: 0,
      }),
      makeActivity({
        activityId: "a-2",
        name: "Beta",
        pinned: false,
        order: 1,
      }),
    ];
    const onReorder = vi.fn();

    const { rerender } = render(
      <ScheduleBuilderView
        stopName="London"
        activities={activities}
        onReorder={onReorder}
        onPublish={vi.fn()}
      />,
    );

    // Reorder: move Beta up
    fireEvent.click(
      screen.getByRole("button", {
        name: SCHEDULE_BUILDER_COPY.moveUpLabel("Beta"),
      }),
    );

    // Re-render with the same activities array (same IDs, same reference)
    rerender(
      <ScheduleBuilderView
        stopName="London"
        activities={activities}
        onReorder={onReorder}
        onPublish={vi.fn()}
      />,
    );

    // Beta should still be first (local reorder preserved)
    const items = screen.getAllByTestId("proposed-activity-item");
    expect(items[0]?.textContent).toContain("Beta");
  });
});
