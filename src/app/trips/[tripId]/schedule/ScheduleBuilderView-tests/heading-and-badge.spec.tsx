import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ScheduleBuilderView } from "../ScheduleBuilderView";
import { SCHEDULE_BUILDER_COPY } from "../ScheduleBuilderView.copy";

afterEach(cleanup);

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
    expect(screen.getByText("Paris")).toBeDefined();
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
