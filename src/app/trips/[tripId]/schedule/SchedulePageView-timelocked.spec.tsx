import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
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

// Criterion 5: Time-pinned activities appear in a "Time-locked" section with darker border and 🔒 on time label
describe("Criterion 5 — Time-locked section for time-pinned activities", () => {
  it("renders the Time-locked section heading when there are time-pinned activities", () => {
    const days = [
      makeScheduleDay({
        activities: [
          makeScheduledActivity({
            activityId: "a-1",
            name: "Birthday dinner",
            timeLocked: true,
            timeSlot: "19:00",
          }),
        ],
      }),
    ];
    render(<SchedulePageView days={days} />);
    expect(
      screen.getByText(SCHEDULE_PAGE_COPY.timeLockedHeading),
    ).toBeDefined();
  });

  it("does not render the Time-locked heading when no activities are time-locked", () => {
    const days = [
      makeScheduleDay({
        activities: [
          makeScheduledActivity({
            activityId: "a-1",
            name: "Hiking",
            timeLocked: false,
          }),
        ],
      }),
    ];
    render(<SchedulePageView days={days} />);
    expect(screen.queryByText(SCHEDULE_PAGE_COPY.timeLockedHeading)).toBeNull();
  });

  it("renders the time-locked activity in the time-locked section", () => {
    const days = [
      makeScheduleDay({
        activities: [
          makeScheduledActivity({
            activityId: "a-locked",
            name: "Birthday dinner",
            timeLocked: true,
            timeSlot: "19:00",
          }),
          makeScheduledActivity({
            activityId: "a-free",
            name: "Hiking",
            timeLocked: false,
            order: 1,
          }),
        ],
      }),
    ];
    render(<SchedulePageView days={days} />);
    const lockedSection = screen
      .getByText(SCHEDULE_PAGE_COPY.timeLockedHeading)
      .closest("[data-testid=time-locked-section]");
    expect(lockedSection?.textContent).toContain("Birthday dinner");
  });

  it("renders the 🔒 lock icon on the time label of a time-locked activity", () => {
    const days = [
      makeScheduleDay({
        activities: [
          makeScheduledActivity({
            activityId: "a-1",
            name: "Birthday dinner",
            timeLocked: true,
            timeSlot: "19:00",
          }),
        ],
      }),
    ];
    render(<SchedulePageView days={days} />);
    expect(
      screen.getByText(SCHEDULE_PAGE_COPY.timeLockedSlotLabel("19:00")),
    ).toBeDefined();
  });

  it("does not render 🔒 on a regular (non-locked) activity time label", () => {
    const days = [
      makeScheduleDay({
        activities: [
          makeScheduledActivity({
            activityId: "a-1",
            name: "Hiking",
            timeLocked: false,
            timeSlot: "09:00",
          }),
        ],
      }),
    ];
    render(<SchedulePageView days={days} />);
    expect(
      screen.queryByText(SCHEDULE_PAGE_COPY.timeLockedSlotLabel("09:00")),
    ).toBeNull();
    expect(
      screen.getByText(SCHEDULE_PAGE_COPY.timeSlotLabel("09:00")),
    ).toBeDefined();
  });

  it("time-locked activity block has the time-locked data-testid", () => {
    const days = [
      makeScheduleDay({
        activities: [
          makeScheduledActivity({
            activityId: "a-1",
            name: "Birthday dinner",
            timeLocked: true,
            timeSlot: "19:00",
          }),
        ],
      }),
    ];
    render(<SchedulePageView days={days} />);
    expect(screen.getByTestId("schedule-activity-block-locked")).toBeDefined();
  });
});
