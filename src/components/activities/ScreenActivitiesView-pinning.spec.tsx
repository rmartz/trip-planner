import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ScreenActivitiesView } from "./ScreenActivitiesView";
import { SCREEN_ACTIVITIES_COPY } from "./ScreenActivities.copy";
import { TimeOfDaySlot } from "@/lib/types/activity";
import type { Activity } from "@/lib/types/activity";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function makeActivity(overrides: Partial<Activity> = {}): Activity {
  return {
    activityId: "act-1",
    stopId: "stop-1",
    tripId: "trip-1",
    name: "Hiking",
    estimatedDurationMinutes: 120,
    ...overrides,
  };
}

// Criterion 2: Pinned activities display a 📌 emoji prefix before the activity name
describe("Criterion 2 — pinned activity shows 📌 prefix", () => {
  it("renders 📌 before the name for a pinned activity", () => {
    render(
      <ScreenActivitiesView
        activities={[makeActivity({ name: "Birthday dinner", pinned: true })]}
        canPropose={false}
        onPropose={vi.fn()}
      />,
    );
    expect(
      screen.getByText(SCREEN_ACTIVITIES_COPY.pinnedPrefix + "Birthday dinner"),
    ).toBeDefined();
  });

  it("does not render the pinned prefix for an unpinned activity", () => {
    render(
      <ScreenActivitiesView
        activities={[makeActivity({ name: "Kayaking" })]}
        canPropose={false}
        onPropose={vi.fn()}
      />,
    );
    expect(
      screen.queryByText(SCREEN_ACTIVITIES_COPY.pinnedPrefix + "Kayaking"),
    ).toBeNull();
    expect(screen.getByText("Kayaking")).toBeDefined();
  });
});

// Criterion 3: Planner-only overflow menu (⋯) with Pin / Pin to time slot / Unpin actions
describe("Criterion 3 — Planner overflow menu", () => {
  it("shows overflow menu button (⋯) per activity when canPin is true", () => {
    render(
      <ScreenActivitiesView
        activities={[makeActivity({ activityId: "act-1", name: "Hiking" })]}
        canPropose={false}
        canPin={true}
        onPropose={vi.fn()}
        onPin={vi.fn()}
        onPinToSlot={vi.fn()}
        onUnpin={vi.fn()}
      />,
    );
    expect(
      screen.getByLabelText(SCREEN_ACTIVITIES_COPY.activityMenuLabel),
    ).toBeDefined();
  });

  it("does not show overflow menu when canPin is false", () => {
    render(
      <ScreenActivitiesView
        activities={[makeActivity()]}
        canPropose={false}
        canPin={false}
        onPropose={vi.fn()}
      />,
    );
    expect(
      screen.queryByLabelText(SCREEN_ACTIVITIES_COPY.activityMenuLabel),
    ).toBeNull();
  });

  it("does not show overflow menu when canPin is undefined", () => {
    render(
      <ScreenActivitiesView
        activities={[makeActivity()]}
        canPropose={false}
        onPropose={vi.fn()}
      />,
    );
    expect(
      screen.queryByLabelText(SCREEN_ACTIVITIES_COPY.activityMenuLabel),
    ).toBeNull();
  });

  it("calls onPin with activityId when Pin option is clicked", () => {
    const onPin = vi.fn();
    render(
      <ScreenActivitiesView
        activities={[makeActivity({ activityId: "act-42", name: "Hiking" })]}
        canPropose={false}
        canPin={true}
        onPropose={vi.fn()}
        onPin={onPin}
        onPinToSlot={vi.fn()}
        onUnpin={vi.fn()}
      />,
    );

    fireEvent.click(
      screen.getByLabelText(SCREEN_ACTIVITIES_COPY.activityMenuLabel),
    );
    fireEvent.click(screen.getByText(SCREEN_ACTIVITIES_COPY.pinOption));

    expect(onPin).toHaveBeenCalledWith("act-42");
  });

  it("calls onUnpin with activityId when Unpin option is clicked on a pinned activity", () => {
    const onUnpin = vi.fn();
    render(
      <ScreenActivitiesView
        activities={[
          makeActivity({ activityId: "act-7", name: "Dinner", pinned: true }),
        ]}
        canPropose={false}
        canPin={true}
        onPropose={vi.fn()}
        onPin={vi.fn()}
        onPinToSlot={vi.fn()}
        onUnpin={onUnpin}
      />,
    );

    fireEvent.click(
      screen.getByLabelText(SCREEN_ACTIVITIES_COPY.activityMenuLabel),
    );
    fireEvent.click(screen.getByText(SCREEN_ACTIVITIES_COPY.unpinOption));

    expect(onUnpin).toHaveBeenCalledWith("act-7");
  });

  it("calls onPinToSlot with activityId and slot when a time slot is chosen", () => {
    const onPinToSlot = vi.fn();
    render(
      <ScreenActivitiesView
        activities={[makeActivity({ activityId: "act-99", name: "Brunch" })]}
        canPropose={false}
        canPin={true}
        onPropose={vi.fn()}
        onPin={vi.fn()}
        onPinToSlot={onPinToSlot}
        onUnpin={vi.fn()}
      />,
    );

    fireEvent.click(
      screen.getByLabelText(SCREEN_ACTIVITIES_COPY.activityMenuLabel),
    );
    fireEvent.click(screen.getByText(SCREEN_ACTIVITIES_COPY.pinToSlotOption));
    fireEvent.click(
      screen.getByText(SCREEN_ACTIVITIES_COPY.slotLabel(TimeOfDaySlot.Evening)),
    );

    expect(onPinToSlot).toHaveBeenCalledWith("act-99", TimeOfDaySlot.Evening);
  });
});
