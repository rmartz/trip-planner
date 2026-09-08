import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { DestinationDetailView } from "./DestinationDetailView";
import { DESTINATION_DETAIL_COPY } from "./DestinationDetailView.copy";
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
    seasonality: "best in spring",
    tripIds: [],
    ...overrides,
  };
}

describe("DestinationDetailView — renders destination details", () => {
  it("renders the destination name", () => {
    render(
      <DestinationDetailView
        destination={makeDestination({ name: "Kyoto" })}
        onEdit={vi.fn()}
        onBack={vi.fn()}
      />,
    );

    expect(screen.getByText("Kyoto")).toBeDefined();
  });

  it("renders the seasonality when present", () => {
    render(
      <DestinationDetailView
        destination={makeDestination({ seasonality: "best in spring" })}
        onEdit={vi.fn()}
        onBack={vi.fn()}
      />,
    );

    expect(screen.getByText("best in spring")).toBeDefined();
  });

  it("renders the no-seasonality fallback when seasonality is absent", () => {
    render(
      <DestinationDetailView
        destination={makeDestination({ seasonality: undefined })}
        onEdit={vi.fn()}
        onBack={vi.fn()}
      />,
    );

    expect(
      screen.getByText(DESTINATION_DETAIL_COPY.noSeasonality),
    ).toBeDefined();
  });
});

describe("DestinationDetailView — share button visibility", () => {
  it("renders the share button when canShare is true", () => {
    render(
      <DestinationDetailView
        destination={makeDestination()}
        onEdit={vi.fn()}
        onBack={vi.fn()}
        canShare={true}
        onShare={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: DESTINATION_DETAIL_COPY.shareButton }),
    ).toBeDefined();
  });

  it("does not render the share button when canShare is false", () => {
    render(
      <DestinationDetailView
        destination={makeDestination()}
        onEdit={vi.fn()}
        onBack={vi.fn()}
        canShare={false}
        onShare={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("button", {
        name: DESTINATION_DETAIL_COPY.shareButton,
      }),
    ).toBeNull();
  });

  it("calls onShare when Share is clicked", () => {
    const onShare = vi.fn();
    render(
      <DestinationDetailView
        destination={makeDestination()}
        onEdit={vi.fn()}
        onBack={vi.fn()}
        canShare={true}
        onShare={onShare}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: DESTINATION_DETAIL_COPY.shareButton }),
    );

    expect(onShare).toHaveBeenCalledTimes(1);
  });
});

describe("DestinationDetailView — actions", () => {
  it("calls onEdit with the destination when Edit is clicked", () => {
    const onEdit = vi.fn();
    const dest = makeDestination({ name: "Lisbon" });
    render(
      <DestinationDetailView
        destination={dest}
        onEdit={onEdit}
        onBack={vi.fn()}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: DESTINATION_DETAIL_COPY.editButton }),
    );

    expect(onEdit).toHaveBeenCalledWith(dest);
  });

  it("calls onBack when Back is clicked", () => {
    const onBack = vi.fn();
    render(
      <DestinationDetailView
        destination={makeDestination()}
        onEdit={vi.fn()}
        onBack={onBack}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: DESTINATION_DETAIL_COPY.backButton }),
    );

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
