import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ScheduleBuilderView } from "../ScheduleBuilderView";
import { SCHEDULE_BUILDER_COPY } from "../ScheduleBuilderView.copy";
import { makeActivity } from "../ScheduleBuilderView.fixtures";

afterEach(cleanup);

describe("ScheduleBuilderView — move up/down controls", () => {
  it("renders move-up and move-down buttons for reorderable activities", () => {
    render(
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
    expect(
      screen.getAllByRole("button", {
        name: SCHEDULE_BUILDER_COPY.moveUpLabel("Alpha"),
      }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("button", {
        name: SCHEDULE_BUILDER_COPY.moveDownLabel("Alpha"),
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
    const secondMoveUp = screen.getByRole("button", {
      name: SCHEDULE_BUILDER_COPY.moveUpLabel("Second"),
    });
    fireEvent.click(secondMoveUp);
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
    const firstMoveDown = screen.getByRole("button", {
      name: SCHEDULE_BUILDER_COPY.moveDownLabel("First"),
    });
    fireEvent.click(firstMoveDown);
    expect(onReorder).toHaveBeenCalledWith(["a-2", "a-1"]);
  });

  it("disables Move Up button for the first unpinned activity", () => {
    render(
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
    const firstMoveUp = screen.getByRole("button", {
      name: SCHEDULE_BUILDER_COPY.moveUpLabel("Alpha"),
    });
    expect((firstMoveUp as HTMLButtonElement).disabled).toBe(true);
  });

  it("disables Move Down button for the last unpinned activity", () => {
    render(
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
    const lastMoveDown = screen.getByRole("button", {
      name: SCHEDULE_BUILDER_COPY.moveDownLabel("Beta"),
    });
    expect((lastMoveDown as HTMLButtonElement).disabled).toBe(true);
  });
});

describe("ScheduleBuilderView — moveActivity bounds guard", () => {
  it("does not call onReorder when Move Up is clicked on the first activity", () => {
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
    fireEvent.click(
      screen.getByRole("button", {
        name: SCHEDULE_BUILDER_COPY.moveUpLabel("First"),
      }),
    );
    expect(onReorder).not.toHaveBeenCalled();
  });

  it("does not call onReorder when Move Down is clicked on the last activity", () => {
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
            name: "Last",
            pinned: false,
            order: 1,
          }),
        ]}
        onReorder={onReorder}
        onPublish={vi.fn()}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: SCHEDULE_BUILDER_COPY.moveDownLabel("Last"),
      }),
    );
    expect(onReorder).not.toHaveBeenCalled();
  });
});
