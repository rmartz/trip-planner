import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { Leg } from "@/lib/types/trip";
import { ArchivePageView } from "./ArchivePageView";
import { ARCHIVE_PAGE_COPY } from "./ArchivePageView.copy";

afterEach(cleanup);

function makeLeg(overrides: Partial<Leg> = {}): Leg {
  return {
    legId: "leg-1",
    tripId: "trip-1",
    fromStopId: "stop-1",
    toStopId: "stop-2",
    name: "London to Paris",
    order: 0,
    memberUids: ["uid-planner"],
    isActive: false,
    ...overrides,
  };
}

describe("ArchivePageView — heading", () => {
  it("renders the page heading", () => {
    render(
      <ArchivePageView
        archivedLegs={[]}
        onRestore={vi.fn()}
        onDeleteForever={vi.fn()}
      />,
    );
    expect(screen.getByText(ARCHIVE_PAGE_COPY.heading)).toBeDefined();
  });

  it("renders the planner-only subtext", () => {
    render(
      <ArchivePageView
        archivedLegs={[]}
        onRestore={vi.fn()}
        onDeleteForever={vi.fn()}
      />,
    );
    expect(screen.getByText(ARCHIVE_PAGE_COPY.subtext)).toBeDefined();
  });
});

describe("ArchivePageView — empty state", () => {
  it("renders empty state message when no archived legs", () => {
    render(
      <ArchivePageView
        archivedLegs={[]}
        onRestore={vi.fn()}
        onDeleteForever={vi.fn()}
      />,
    );
    expect(screen.getByText(ARCHIVE_PAGE_COPY.emptyState)).toBeDefined();
  });

  it("does not render section heading when no archived legs", () => {
    render(
      <ArchivePageView
        archivedLegs={[]}
        onRestore={vi.fn()}
        onDeleteForever={vi.fn()}
      />,
    );
    expect(
      screen.queryByText(ARCHIVE_PAGE_COPY.removedLegsHeading(0)),
    ).toBeNull();
  });
});

describe("ArchivePageView — archived legs section", () => {
  it("renders removed legs section heading with count", () => {
    const legs = [makeLeg({ legId: "leg-1" }), makeLeg({ legId: "leg-2" })];
    render(
      <ArchivePageView
        archivedLegs={legs}
        onRestore={vi.fn()}
        onDeleteForever={vi.fn()}
      />,
    );
    expect(
      screen.getByText(ARCHIVE_PAGE_COPY.removedLegsHeading(2)),
    ).toBeDefined();
  });

  it("renders each archived leg name", () => {
    const legs = [
      makeLeg({ legId: "leg-1", name: "London to Paris" }),
      makeLeg({ legId: "leg-2", name: "Paris to Berlin" }),
    ];
    render(
      <ArchivePageView
        archivedLegs={legs}
        onRestore={vi.fn()}
        onDeleteForever={vi.fn()}
      />,
    );
    expect(screen.getByText("London to Paris")).toBeDefined();
    expect(screen.getByText("Paris to Berlin")).toBeDefined();
  });

  it("renders Restore button for each leg", () => {
    const legs = [makeLeg({ legId: "leg-1", name: "London to Paris" })];
    render(
      <ArchivePageView
        archivedLegs={legs}
        onRestore={vi.fn()}
        onDeleteForever={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: ARCHIVE_PAGE_COPY.restoreButton }),
    ).toBeDefined();
  });

  it("renders Delete forever button for each leg", () => {
    const legs = [makeLeg({ legId: "leg-1", name: "London to Paris" })];
    render(
      <ArchivePageView
        archivedLegs={legs}
        onRestore={vi.fn()}
        onDeleteForever={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", {
        name: ARCHIVE_PAGE_COPY.deleteForeverButton,
      }),
    ).toBeDefined();
  });
});

describe("ArchivePageView — actions", () => {
  it("calls onRestore with legId when Restore is clicked", () => {
    const onRestore = vi.fn();
    const legs = [makeLeg({ legId: "leg-abc" })];
    render(
      <ArchivePageView
        archivedLegs={legs}
        onRestore={onRestore}
        onDeleteForever={vi.fn()}
      />,
    );
    screen
      .getByRole("button", { name: ARCHIVE_PAGE_COPY.restoreButton })
      .click();
    expect(onRestore).toHaveBeenCalledWith("leg-abc");
  });

  it("calls onDeleteForever with legId when Delete forever is clicked", () => {
    const onDeleteForever = vi.fn();
    const legs = [makeLeg({ legId: "leg-xyz" })];
    render(
      <ArchivePageView
        archivedLegs={legs}
        onRestore={vi.fn()}
        onDeleteForever={onDeleteForever}
      />,
    );
    screen
      .getByRole("button", { name: ARCHIVE_PAGE_COPY.deleteForeverButton })
      .click();
    expect(onDeleteForever).toHaveBeenCalledWith("leg-xyz");
  });
});
