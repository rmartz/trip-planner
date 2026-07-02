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

  it("calls onPublish with the ordered activity ids when clicked", () => {
    const onPublish = vi.fn();
    render(
      <ScheduleBuilderView
        stopName="London"
        activities={[
          makeActivity({ activityId: "pin-1", pinned: true, order: 0 }),
          makeActivity({ activityId: "prop-1", pinned: false, order: 0 }),
          makeActivity({ activityId: "prop-2", pinned: false, order: 1 }),
        ]}
        onReorder={vi.fn()}
        onPublish={onPublish}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: SCHEDULE_BUILDER_COPY.publishButton }),
    );
    expect(onPublish).toHaveBeenCalledWith(["pin-1", "prop-1", "prop-2"]);
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

  it("shows the publishing label and disables the button while publishing", () => {
    render(
      <ScheduleBuilderView
        stopName="London"
        activities={[makeActivity({ pinned: false })]}
        onReorder={vi.fn()}
        onPublish={vi.fn()}
        isPublishing
      />,
    );
    const publishButton = screen.getByRole("button", {
      name: SCHEDULE_BUILDER_COPY.publishingButton,
    });
    expect((publishButton as HTMLButtonElement).disabled).toBe(true);
  });

  it("shows the published badge and re-publish affordance once published", () => {
    render(
      <ScheduleBuilderView
        stopName="London"
        activities={[makeActivity({ pinned: false })]}
        onReorder={vi.fn()}
        onPublish={vi.fn()}
        isPublished
      />,
    );
    expect(
      screen.getByText(SCHEDULE_BUILDER_COPY.publishedBadge),
    ).toBeDefined();
    expect(
      screen.getByRole("button", {
        name: SCHEDULE_BUILDER_COPY.rePublishButton,
      }),
    ).toBeDefined();
  });

  it("surfaces the publish error message when provided", () => {
    render(
      <ScheduleBuilderView
        stopName="London"
        activities={[makeActivity({ pinned: false })]}
        onReorder={vi.fn()}
        onPublish={vi.fn()}
        errorMessage={SCHEDULE_BUILDER_COPY.forbiddenError}
      />,
    );
    expect(
      screen.getByText(SCHEDULE_BUILDER_COPY.forbiddenError).textContent,
    ).toBe(SCHEDULE_BUILDER_COPY.forbiddenError);
  });
});
