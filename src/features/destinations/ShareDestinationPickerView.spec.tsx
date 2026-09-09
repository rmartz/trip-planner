import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  type ShareablePlanner,
  ShareDestinationPickerView,
} from "./ShareDestinationPickerView";
import { SHARE_DESTINATION_PICKER_COPY } from "./ShareDestinationPickerView.copy";
import type { Destination } from "@/lib/types/destination";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function makeDestination(overrides: Partial<Destination> = {}): Destination {
  return {
    destinationId: "dest-1",
    uid: "user-1",
    name: "Paris",
    tripIds: [],
    ...overrides,
  };
}

function makePlanner(
  overrides: Partial<ShareablePlanner> = {},
): ShareablePlanner {
  return {
    uid: "user-2",
    displayName: "Alice",
    ...overrides,
  };
}

describe("ShareDestinationPickerView — renders destination name", () => {
  it("renders the destination name being shared", () => {
    render(
      <ShareDestinationPickerView
        destination={makeDestination({ name: "Kyoto" })}
        planners={[makePlanner()]}
        isLoading={false}
        isSubmitting={false}
        isError={false}
        onSelectPlanner={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText("Kyoto")).toBeDefined();
  });
});

describe("ShareDestinationPickerView — planner list", () => {
  it("renders each planner's display name", () => {
    render(
      <ShareDestinationPickerView
        destination={makeDestination()}
        planners={[
          makePlanner({ uid: "user-2", displayName: "Alice" }),
          makePlanner({ uid: "user-3", displayName: "Bob" }),
        ]}
        isLoading={false}
        isSubmitting={false}
        isError={false}
        onSelectPlanner={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText("Alice")).toBeDefined();
    expect(screen.getByText("Bob")).toBeDefined();
  });

  it("renders loading state when isLoading is true", () => {
    render(
      <ShareDestinationPickerView
        destination={makeDestination()}
        planners={[]}
        isLoading={true}
        isSubmitting={false}
        isError={false}
        onSelectPlanner={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(
      screen.getByText(SHARE_DESTINATION_PICKER_COPY.loadingText),
    ).toBeDefined();
  });

  it("renders empty state when there are no planners", () => {
    render(
      <ShareDestinationPickerView
        destination={makeDestination()}
        planners={[]}
        isLoading={false}
        isSubmitting={false}
        isError={false}
        onSelectPlanner={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(
      screen.getByText(SHARE_DESTINATION_PICKER_COPY.noPlannersText),
    ).toBeDefined();
  });
});

describe("ShareDestinationPickerView — selecting a planner", () => {
  it("calls onSelectPlanner with the correct planner when clicked", () => {
    const onSelectPlanner = vi.fn();
    const planner = makePlanner({ uid: "user-2", displayName: "Alice" });

    render(
      <ShareDestinationPickerView
        destination={makeDestination()}
        planners={[planner]}
        isLoading={false}
        isSubmitting={false}
        isError={false}
        onSelectPlanner={onSelectPlanner}
        onCancel={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Alice"));

    expect(onSelectPlanner).toHaveBeenCalledWith(planner);
  });
});

describe("ShareDestinationPickerView — cancel", () => {
  it("calls onCancel when Cancel is clicked", () => {
    const onCancel = vi.fn();

    render(
      <ShareDestinationPickerView
        destination={makeDestination()}
        planners={[]}
        isLoading={false}
        isSubmitting={false}
        isError={false}
        onSelectPlanner={vi.fn()}
        onCancel={onCancel}
      />,
    );

    fireEvent.click(
      screen.getByText(SHARE_DESTINATION_PICKER_COPY.cancelButton),
    );

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
