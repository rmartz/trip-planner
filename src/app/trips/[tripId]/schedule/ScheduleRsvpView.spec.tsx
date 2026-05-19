import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  type ScheduleRsvpActivity,
  ScheduleRsvpStatus,
  ScheduleRsvpView,
} from "./ScheduleRsvpView";
import { SCHEDULE_RSVP_COPY } from "./ScheduleRsvpView.copy";

afterEach(cleanup);

const COPY = SCHEDULE_RSVP_COPY;

function makeActivity(
  overrides: Partial<ScheduleRsvpActivity> = {},
): ScheduleRsvpActivity {
  return {
    activityId: "act-1",
    name: "Morning hike",
    timeLabel: "Morning",
    rsvp: undefined,
    ...overrides,
  };
}

describe("ScheduleRsvpView — per-activity rendering", () => {
  it("renders the activity name for each scheduled activity", () => {
    render(
      <ScheduleRsvpView
        activities={[
          makeActivity({ activityId: "a1", name: "Morning hike" }),
          makeActivity({ activityId: "a2", name: "Lunch at Barton Springs" }),
        ]}
        onRsvp={vi.fn()}
      />,
    );
    expect(screen.getByText("Morning hike")).toBeDefined();
    expect(screen.getByText("Lunch at Barton Springs")).toBeDefined();
  });

  it("renders the time label for each activity", () => {
    render(
      <ScheduleRsvpView
        activities={[makeActivity({ timeLabel: "Morning" })]}
        onRsvp={vi.fn()}
      />,
    );
    expect(screen.getByText("Morning")).toBeDefined();
  });
});

describe("ScheduleRsvpView — RSVP buttons per card", () => {
  it('renders an "I\'m in" button and a "Skip" button for each activity', () => {
    render(<ScheduleRsvpView activities={[makeActivity()]} onRsvp={vi.fn()} />);
    expect(screen.getByText(COPY.confirmButton)).toBeDefined();
    expect(screen.getByText(COPY.skipButton)).toBeDefined();
  });

  it("renders two sets of buttons when there are two activities", () => {
    render(
      <ScheduleRsvpView
        activities={[
          makeActivity({ activityId: "a1", name: "Activity One" }),
          makeActivity({ activityId: "a2", name: "Activity Two" }),
        ]}
        onRsvp={vi.fn()}
      />,
    );
    expect(screen.getAllByText(COPY.confirmButton).length).toBe(2);
    expect(screen.getAllByText(COPY.skipButton).length).toBe(2);
  });
});

describe("ScheduleRsvpView — button active state reflects RSVP status", () => {
  it('"I\'m in" button has data-active=true when rsvp is Confirmed', () => {
    render(
      <ScheduleRsvpView
        activities={[makeActivity({ rsvp: ScheduleRsvpStatus.Confirmed })]}
        onRsvp={vi.fn()}
      />,
    );
    const confirmBtn = screen.getByText(COPY.confirmButton).closest("button");
    expect(confirmBtn?.getAttribute("data-active")).toBe("true");
  });

  it('"Skip" button has data-active=true when rsvp is Skipped', () => {
    render(
      <ScheduleRsvpView
        activities={[makeActivity({ rsvp: ScheduleRsvpStatus.Skipped })]}
        onRsvp={vi.fn()}
      />,
    );
    const skipBtn = screen.getByText(COPY.skipButton).closest("button");
    expect(skipBtn?.getAttribute("data-active")).toBe("true");
  });

  it("neither button has data-active=true when rsvp is undefined", () => {
    render(
      <ScheduleRsvpView
        activities={[makeActivity({ rsvp: undefined })]}
        onRsvp={vi.fn()}
      />,
    );
    const confirmBtn = screen.getByText(COPY.confirmButton).closest("button");
    const skipBtn = screen.getByText(COPY.skipButton).closest("button");
    expect(confirmBtn?.getAttribute("data-active")).not.toBe("true");
    expect(skipBtn?.getAttribute("data-active")).not.toBe("true");
  });
});

describe("ScheduleRsvpView — onRsvp callback", () => {
  it('clicking "I\'m in" calls onRsvp with activityId and Confirmed', () => {
    const onRsvp = vi.fn();
    render(
      <ScheduleRsvpView
        activities={[makeActivity({ activityId: "act-42" })]}
        onRsvp={onRsvp}
      />,
    );
    fireEvent.click(screen.getByText(COPY.confirmButton));
    expect(onRsvp).toHaveBeenCalledWith("act-42", ScheduleRsvpStatus.Confirmed);
  });

  it('clicking "Skip" calls onRsvp with activityId and Skipped', () => {
    const onRsvp = vi.fn();
    render(
      <ScheduleRsvpView
        activities={[makeActivity({ activityId: "act-42" })]}
        onRsvp={onRsvp}
      />,
    );
    fireEvent.click(screen.getByText(COPY.skipButton));
    expect(onRsvp).toHaveBeenCalledWith("act-42", ScheduleRsvpStatus.Skipped);
  });
});

describe("ScheduleRsvpView — header subline", () => {
  it('renders the "published · please RSVP" subline in the header', () => {
    render(<ScheduleRsvpView activities={[makeActivity()]} onRsvp={vi.fn()} />);
    expect(screen.getByText(COPY.publishedSubline)).toBeDefined();
  });
});

describe("ScheduleRsvpView — empty state", () => {
  it("renders the empty state message when activities is empty", () => {
    render(<ScheduleRsvpView activities={[]} onRsvp={vi.fn()} />);
    expect(screen.getByText(COPY.emptyState)).toBeDefined();
  });

  it("does not render the empty state message when activities are present", () => {
    render(<ScheduleRsvpView activities={[makeActivity()]} onRsvp={vi.fn()} />);
    expect(screen.queryByText(COPY.emptyState)).toBeNull();
  });
});
