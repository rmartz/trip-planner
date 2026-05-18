import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ScheduleBuilderView } from "../ScheduleBuilderView";
import { SCHEDULE_BUILDER_COPY } from "../ScheduleBuilderView.copy";
import { makeActivity } from "../ScheduleBuilderView.fixtures";

afterEach(cleanup);

describe("ScheduleBuilderView — publish action", () => {
  it("renders the publish button", () => {
    render(
      <ScheduleBuilderView
        stopName="London"
        activities={[makeActivity({ pinned: false })]}
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
        activities={[makeActivity({ pinned: false })]}
        onReorder={vi.fn()}
        onPublish={onPublish}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: SCHEDULE_BUILDER_COPY.publishButton }),
    );
    expect(onPublish).toHaveBeenCalledTimes(1);
  });

  it("disables the publish button when no activities exist", () => {
    render(
      <ScheduleBuilderView
        stopName="London"
        activities={[]}
        onReorder={vi.fn()}
        onPublish={vi.fn()}
      />,
    );
    const publishButton = screen.getByRole("button", {
      name: SCHEDULE_BUILDER_COPY.publishButton,
    });
    expect((publishButton as HTMLButtonElement).disabled).toBe(true);
  });
});
