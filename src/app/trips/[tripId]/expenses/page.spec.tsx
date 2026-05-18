import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ExpenseLinkedEntityType } from "@/lib/types/expense";
import { ExpensePreFillType } from "./ExpensesListPageView";
import { EXPENSES_LIST_PAGE_COPY } from "./ExpensesListPageView.copy";

const pushSpy = vi.fn();

vi.mock("next/navigation", () => ({
  useParams: () => ({ tripId: "trip-1" }),
  useRouter: () => ({ push: pushSpy }),
}));

vi.mock("@/components/nav/AppShell", () => ({
  AppShell: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/hooks/use-trip", () => ({
  useTrip: vi.fn(),
}));

vi.mock("@/hooks/use-legs", () => ({
  useLegs: vi.fn(),
}));

vi.mock("@/hooks/use-stops", () => ({
  useStops: vi.fn(),
}));

import { useLegs } from "@/hooks/use-legs";
import { useStops } from "@/hooks/use-stops";
import { useTrip } from "@/hooks/use-trip";
import ExpensesPage from "./page";

afterEach(() => {
  cleanup();
  pushSpy.mockReset();
  vi.clearAllMocks();
});

describe("ExpensesPage — quick-add wiring", () => {
  it("builds and renders quick-add pills from stop attendance, lodging, activity RSVP, and transport entities", () => {
    vi.mocked(useTrip).mockReturnValue({
      data: { name: "Paris Trip" },
      isError: false,
      isLoading: false,
    } as never);
    vi.mocked(useStops).mockReturnValue({
      data: {
        stops: [{ stopId: "stop-paris", name: "Paris", memberUids: ["uid-1"] }],
      },
    } as never);
    vi.mocked(useLegs).mockReturnValue({
      data: {
        legs: [
          { legId: "leg-1", name: "Paris to Lyon", memberUids: ["uid-2"] },
        ],
      },
    } as never);

    render(<ExpensesPage />);

    expect(
      screen.getByText(EXPENSES_LIST_PAGE_COPY.preFillHeading),
    ).toBeDefined();
    expect(screen.getByText("Activity RSVP: Paris")).toBeDefined();
    expect(screen.getByText("Lodging unit: Paris")).toBeDefined();
    expect(screen.getByText("Stop attendance: Paris")).toBeDefined();
    expect(screen.getByText("Transport leg: Paris to Lyon")).toBeDefined();
  });

  it("navigates to new expense route with linked entity type and participant prefill when a pill is clicked", () => {
    vi.mocked(useTrip).mockReturnValue({
      data: { name: "Paris Trip" },
      isError: false,
      isLoading: false,
    } as never);
    vi.mocked(useStops).mockReturnValue({
      data: {
        stops: [{ stopId: "stop-paris", name: "Paris", memberUids: ["uid-1"] }],
      },
    } as never);
    vi.mocked(useLegs).mockReturnValue({
      data: { legs: [] },
    } as never);

    render(<ExpensesPage />);
    fireEvent.click(
      screen.getByRole("button", { name: "Activity RSVP: Paris" }),
    );

    expect(pushSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        `/trips/trip-1/expenses/new?linkedEntityId=stop-paris&linkedEntityLabel=Activity+RSVP%3A+Paris&linkedEntityType=${ExpenseLinkedEntityType.Activity}&participantMemberIds=uid-1`,
      ),
    );
  });
});

describe("ExpensePreFillType — coverage", () => {
  it("includes activity RSVP type for quick-add options", () => {
    expect(ExpensePreFillType.ActivityRsvp).toBe("activity_rsvp");
  });
});
