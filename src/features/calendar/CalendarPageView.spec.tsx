import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { CalendarPageView } from "./CalendarPageView";
import { CALENDAR_PAGE_COPY } from "./CalendarPageView.copy";
import type { UnavailableRange } from "@/lib/types/unavailable-range";
import type { Trip } from "@/lib/types/trip";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function makeRange(
  overrides: Partial<UnavailableRange> = {},
): UnavailableRange {
  return {
    rangeId: "range-1",
    uid: "uid-1",
    startDate: new Date("2025-06-05T00:00:00"),
    endDate: new Date("2025-06-07T00:00:00"),
    ...overrides,
  };
}

function makeTrip(overrides: Partial<Trip> = {}): Trip {
  return {
    tripId: "trip-1",
    name: "Paris Trip",
    startDate: new Date("2025-06-10T00:00:00"),
    endDate: new Date("2025-06-20T00:00:00"),
    createdAt: new Date("2025-01-01T00:00:00"),
    createdBy: "uid-1",
    memberUids: ["uid-1"],
    inviteToken: "tok-1",
    ...overrides,
  };
}

// Fixed date for month: June 2025
const JUNE_2025 = new Date(2025, 5, 1); // month index 5 = June

describe("/calendar route — month grid renders current month", () => {
  it("renders the month label for the displayed month", () => {
    render(
      <CalendarPageView
        currentMonth={JUNE_2025}
        ranges={[]}
        trips={[]}
        onPrevMonth={vi.fn()}
        onNextMonth={vi.fn()}
        onAddBlock={vi.fn()}
        isLoading={false}
        isError={false}
      />,
    );

    expect(screen.getByText("June 2025")).toBeDefined();
  });

  it("renders weekday header row", () => {
    render(
      <CalendarPageView
        currentMonth={JUNE_2025}
        ranges={[]}
        trips={[]}
        onPrevMonth={vi.fn()}
        onNextMonth={vi.fn()}
        onAddBlock={vi.fn()}
        isLoading={false}
        isError={false}
      />,
    );

    // S appears multiple times (Sun and Sat), check count >= 2
    const sCells = screen.getAllByText("S");
    expect(sCells.length).toBeGreaterThanOrEqual(2);
  });

  it("renders day numbers for the current month", () => {
    render(
      <CalendarPageView
        currentMonth={JUNE_2025}
        ranges={[]}
        trips={[]}
        onPrevMonth={vi.fn()}
        onNextMonth={vi.fn()}
        onAddBlock={vi.fn()}
        isLoading={false}
        isError={false}
      />,
    );

    // June 2025 has 30 days
    expect(screen.getByText("1")).toBeDefined();
    expect(screen.getByText("30")).toBeDefined();
  });

  it("marks blocked days with a data attribute", () => {
    const blockedRange = makeRange({
      startDate: new Date("2025-06-05T00:00:00"),
      endDate: new Date("2025-06-07T00:00:00"),
    });

    render(
      <CalendarPageView
        currentMonth={JUNE_2025}
        ranges={[blockedRange]}
        trips={[]}
        onPrevMonth={vi.fn()}
        onNextMonth={vi.fn()}
        onAddBlock={vi.fn()}
        isLoading={false}
        isError={false}
      />,
    );

    const day5 = screen.getByTestId("calendar-day-2025-06-05");
    expect(day5.dataset["state"]).toBe("blocked");
  });

  it("renders the legend", () => {
    render(
      <CalendarPageView
        currentMonth={JUNE_2025}
        ranges={[]}
        trips={[]}
        onPrevMonth={vi.fn()}
        onNextMonth={vi.fn()}
        onAddBlock={vi.fn()}
        isLoading={false}
        isError={false}
      />,
    );

    expect(screen.getByText(CALENDAR_PAGE_COPY.legendBlocked)).toBeDefined();
    expect(screen.getByText(CALENDAR_PAGE_COPY.legendConflict)).toBeDefined();
  });
});

describe("/calendar route — prev/next month navigation", () => {
  it("calls onPrevMonth when prev chevron is clicked", () => {
    const onPrevMonth = vi.fn();

    render(
      <CalendarPageView
        currentMonth={JUNE_2025}
        ranges={[]}
        trips={[]}
        onPrevMonth={onPrevMonth}
        onNextMonth={vi.fn()}
        onAddBlock={vi.fn()}
        isLoading={false}
        isError={false}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: CALENDAR_PAGE_COPY.prevMonthAriaLabel,
      }),
    );

    expect(onPrevMonth).toHaveBeenCalledOnce();
  });

  it("calls onNextMonth when next chevron is clicked", () => {
    const onNextMonth = vi.fn();

    render(
      <CalendarPageView
        currentMonth={JUNE_2025}
        ranges={[]}
        trips={[]}
        onPrevMonth={vi.fn()}
        onNextMonth={onNextMonth}
        onAddBlock={vi.fn()}
        isLoading={false}
        isError={false}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: CALENDAR_PAGE_COPY.nextMonthAriaLabel,
      }),
    );

    expect(onNextMonth).toHaveBeenCalledOnce();
  });
});

describe("/calendar route — conflict highlight only for overlapping trips", () => {
  it("marks a day as conflict when a blocked range overlaps an active trip date", () => {
    // Trip: June 10–20. Block: June 12–14 (overlaps trip)
    const conflictRange = makeRange({
      rangeId: "range-conflict",
      startDate: new Date("2025-06-12T00:00:00"),
      endDate: new Date("2025-06-14T00:00:00"),
    });
    const trip = makeTrip({
      startDate: new Date("2025-06-10T00:00:00"),
      endDate: new Date("2025-06-20T00:00:00"),
    });

    render(
      <CalendarPageView
        currentMonth={JUNE_2025}
        ranges={[conflictRange]}
        trips={[trip]}
        onPrevMonth={vi.fn()}
        onNextMonth={vi.fn()}
        onAddBlock={vi.fn()}
        isLoading={false}
        isError={false}
      />,
    );

    const day12 = screen.getByTestId("calendar-day-2025-06-12");
    expect(day12.dataset["state"]).toBe("conflict");
  });

  it("does not mark a blocked day as conflict when it does not overlap any trip", () => {
    // Block: June 5–7. Trip: June 10–20 (no overlap)
    const nonConflictRange = makeRange({
      rangeId: "range-safe",
      startDate: new Date("2025-06-05T00:00:00"),
      endDate: new Date("2025-06-07T00:00:00"),
    });
    const trip = makeTrip({
      startDate: new Date("2025-06-10T00:00:00"),
      endDate: new Date("2025-06-20T00:00:00"),
    });

    render(
      <CalendarPageView
        currentMonth={JUNE_2025}
        ranges={[nonConflictRange]}
        trips={[trip]}
        onPrevMonth={vi.fn()}
        onNextMonth={vi.fn()}
        onAddBlock={vi.fn()}
        isLoading={false}
        isError={false}
      />,
    );

    const day5 = screen.getByTestId("calendar-day-2025-06-05");
    expect(day5.dataset["state"]).toBe("blocked");
  });
});

describe("/calendar route — + Block button opens add-range form", () => {
  it("calls onAddBlock when + Block button is clicked", () => {
    const onAddBlock = vi.fn();

    render(
      <CalendarPageView
        currentMonth={JUNE_2025}
        ranges={[]}
        trips={[]}
        onPrevMonth={vi.fn()}
        onNextMonth={vi.fn()}
        onAddBlock={onAddBlock}
        isLoading={false}
        isError={false}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: CALENDAR_PAGE_COPY.addBlockButtonLabel,
      }),
    );

    expect(onAddBlock).toHaveBeenCalledOnce();
  });
});

describe("/calendar route — upcoming blocks list with overlap warnings", () => {
  it("renders the upcoming blocks section heading", () => {
    render(
      <CalendarPageView
        currentMonth={JUNE_2025}
        ranges={[makeRange()]}
        trips={[]}
        onPrevMonth={vi.fn()}
        onNextMonth={vi.fn()}
        onAddBlock={vi.fn()}
        isLoading={false}
        isError={false}
      />,
    );

    expect(
      screen.getByText(CALENDAR_PAGE_COPY.upcomingBlocksSectionTitle),
    ).toBeDefined();
  });

  it("renders each block's date range in the upcoming list", () => {
    const range = makeRange({
      startDate: new Date("2025-06-05T00:00:00"),
      endDate: new Date("2025-06-07T00:00:00"),
    });

    render(
      <CalendarPageView
        currentMonth={JUNE_2025}
        ranges={[range]}
        trips={[]}
        onPrevMonth={vi.fn()}
        onNextMonth={vi.fn()}
        onAddBlock={vi.fn()}
        isLoading={false}
        isError={false}
      />,
    );

    // Should show Jun 5 somewhere and Jun 7 somewhere in the date range text
    const listItem = screen.getByTestId("block-card-range-1");
    expect(listItem.textContent).toContain("Jun 5");
    expect(listItem.textContent).toContain("Jun 7");
  });

  it("renders overlap warning for a block that overlaps an active trip", () => {
    const conflictRange = makeRange({
      rangeId: "range-conflict",
      startDate: new Date("2025-06-12T00:00:00"),
      endDate: new Date("2025-06-14T00:00:00"),
    });
    const trip = makeTrip({ name: "Paris Trip" });

    render(
      <CalendarPageView
        currentMonth={JUNE_2025}
        ranges={[conflictRange]}
        trips={[trip]}
        onPrevMonth={vi.fn()}
        onNextMonth={vi.fn()}
        onAddBlock={vi.fn()}
        isLoading={false}
        isError={false}
      />,
    );

    const card = screen.getByTestId("block-card-range-conflict");
    expect(card.textContent).toContain(
      `${CALENDAR_PAGE_COPY.overlapWarningPrefix}Paris Trip`,
    );
  });

  it("does not render overlap warning for a block that does not overlap any trip", () => {
    const safeRange = makeRange({
      startDate: new Date("2025-06-05T00:00:00"),
      endDate: new Date("2025-06-07T00:00:00"),
    });
    const trip = makeTrip({
      startDate: new Date("2025-06-10T00:00:00"),
      endDate: new Date("2025-06-20T00:00:00"),
    });

    render(
      <CalendarPageView
        currentMonth={JUNE_2025}
        ranges={[safeRange]}
        trips={[trip]}
        onPrevMonth={vi.fn()}
        onNextMonth={vi.fn()}
        onAddBlock={vi.fn()}
        isLoading={false}
        isError={false}
      />,
    );

    const card = screen.getByTestId("block-card-range-1");
    expect(card.textContent).not.toContain(
      CALENDAR_PAGE_COPY.overlapWarningPrefix,
    );
  });
});
