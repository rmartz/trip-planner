import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { SchedulePageView } from "./SchedulePageView";
import type { ScheduledActivity, ScheduleDay } from "./SchedulePageView";
import { SCHEDULE_PAGE_COPY } from "./SchedulePageView.copy";

afterEach(cleanup);

function makeScheduledActivity(
  overrides: Partial<ScheduledActivity> = {},
): ScheduledActivity {
  return {
    activityId: "activity-1",
    name: "Breakfast at the cafe",
    timeSlot: "09:00",
    order: 0,
    ...overrides,
  };
}

function makeScheduleDay(overrides: Partial<ScheduleDay> = {}): ScheduleDay {
  return {
    dayKey: "2026-06-01",
    label: "Mon, Jun 1",
    activities: [],
    ...overrides,
  };
}

describe("SchedulePageView — heading", () => {
  it("renders the page heading", () => {
    render(<SchedulePageView days={[]} />);
    expect(screen.getByText(SCHEDULE_PAGE_COPY.heading)).toBeDefined();
  });

  it("renders the heading subtext", () => {
    render(<SchedulePageView days={[]} />);
    expect(screen.getByText(SCHEDULE_PAGE_COPY.headingSubtext)).toBeDefined();
  });
});

describe("SchedulePageView — empty schedule", () => {
  it("renders the empty schedule message when no days are provided", () => {
    render(<SchedulePageView days={[]} />);
    expect(
      screen.getByText(SCHEDULE_PAGE_COPY.emptyScheduleMessage),
    ).toBeDefined();
  });
});

describe("SchedulePageView — day grouping", () => {
  it("renders a section per day with the day label", () => {
    const days = [
      makeScheduleDay({ dayKey: "2026-06-01", label: "Mon, Jun 1" }),
      makeScheduleDay({ dayKey: "2026-06-02", label: "Tue, Jun 2" }),
    ];
    render(<SchedulePageView days={days} />);
    expect(screen.getByText("Mon, Jun 1")).toBeDefined();
    expect(screen.getByText("Tue, Jun 2")).toBeDefined();
  });

  it("renders one day section per day", () => {
    const days = [
      makeScheduleDay({ dayKey: "2026-06-01" }),
      makeScheduleDay({ dayKey: "2026-06-02" }),
      makeScheduleDay({ dayKey: "2026-06-03" }),
    ];
    render(<SchedulePageView days={days} />);
    expect(screen.getAllByTestId("schedule-day-section").length).toBe(3);
  });

  it("renders an empty-day message when a day has no activities", () => {
    const days = [makeScheduleDay({ activities: [] })];
    render(<SchedulePageView days={days} />);
    expect(screen.getByText(SCHEDULE_PAGE_COPY.emptyDayMessage)).toBeDefined();
  });
});

describe("SchedulePageView — activity blocks", () => {
  it("renders each activity name within its day", () => {
    const days = [
      makeScheduleDay({
        activities: [
          makeScheduledActivity({
            activityId: "a-1",
            name: "Morning hike",
          }),
          makeScheduledActivity({
            activityId: "a-2",
            name: "Lunch at bistro",
            order: 1,
          }),
        ],
      }),
    ];
    render(<SchedulePageView days={days} />);
    expect(screen.getByText("Morning hike")).toBeDefined();
    expect(screen.getByText("Lunch at bistro")).toBeDefined();
  });

  it("renders each activity time slot", () => {
    const days = [
      makeScheduleDay({
        activities: [
          makeScheduledActivity({
            activityId: "a-1",
            timeSlot: "09:00",
          }),
          makeScheduledActivity({
            activityId: "a-2",
            timeSlot: "13:30",
            order: 1,
          }),
        ],
      }),
    ];
    render(<SchedulePageView days={days} />);
    expect(screen.getByText("09:00")).toBeDefined();
    expect(screen.getByText("13:30")).toBeDefined();
  });

  it("renders activity blocks in ascending order by `order`", () => {
    const days = [
      makeScheduleDay({
        activities: [
          makeScheduledActivity({
            activityId: "a-second",
            name: "Second activity",
            order: 1,
          }),
          makeScheduledActivity({
            activityId: "a-first",
            name: "First activity",
            order: 0,
          }),
          makeScheduledActivity({
            activityId: "a-third",
            name: "Third activity",
            order: 2,
          }),
        ],
      }),
    ];
    render(<SchedulePageView days={days} />);
    const blocks = screen.getAllByTestId("schedule-activity-block");
    expect(blocks[0]?.textContent).toContain("First activity");
    expect(blocks[1]?.textContent).toContain("Second activity");
    expect(blocks[2]?.textContent).toContain("Third activity");
  });
});
