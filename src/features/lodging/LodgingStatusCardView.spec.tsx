import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { LodgingStatusCardView } from "./LodgingStatusCardView";
import { LODGING_STATUS_CARD_COPY } from "./LodgingStatusCardView.copy";
import { LodgingStatus } from "@/lib/types/lodging";
import type { Stop } from "@/lib/types/trip";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function makeStop(overrides: Partial<Stop> = {}): Stop {
  return {
    stopId: "stop-1",
    tripId: "trip-1",
    name: "Austin",
    startDate: new Date("2025-06-01T00:00:00Z"),
    endDate: new Date("2025-06-02T00:00:00Z"),
    order: 1,
    memberUids: ["user-1"],
    ...overrides,
  };
}

describe("LodgingStatusCardView — renders stop name", () => {
  it("displays the stop name in the card header", () => {
    render(
      <LodgingStatusCardView
        stop={makeStop({ name: "Wimberley" })}
        currentStatus={undefined}
        onStatusChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Wimberley")).toBeDefined();
  });
});

describe("LodgingStatusCardView — renders all four radio options when no status set", () => {
  it("renders the Need a place option", () => {
    render(
      <LodgingStatusCardView
        stop={makeStop()}
        currentStatus={undefined}
        onStatusChange={vi.fn()}
      />,
    );

    expect(
      screen.getByText(LODGING_STATUS_CARD_COPY.needLodgingLabel),
    ).toBeDefined();
  });

  it("renders the Have my own option", () => {
    render(
      <LodgingStatusCardView
        stop={makeStop()}
        currentStatus={undefined}
        onStatusChange={vi.fn()}
      />,
    );

    expect(
      screen.getByText(LODGING_STATUS_CARD_COPY.securedPrivateLabel),
    ).toBeDefined();
  });

  it("renders the Want to share option", () => {
    render(
      <LodgingStatusCardView
        stop={makeStop()}
        currentStatus={undefined}
        onStatusChange={vi.fn()}
      />,
    );

    expect(
      screen.getByText(LODGING_STATUS_CARD_COPY.sharingWithLabel),
    ).toBeDefined();
  });

  it("renders the Hosting option", () => {
    render(
      <LodgingStatusCardView
        stop={makeStop()}
        currentStatus={undefined}
        onStatusChange={vi.fn()}
      />,
    );

    expect(
      screen.getByText(LODGING_STATUS_CARD_COPY.securedCapacityLabel),
    ).toBeDefined();
  });
});

describe("LodgingStatusCardView — compact display when status already set", () => {
  it("shows compact status pill for NeedLodging", () => {
    render(
      <LodgingStatusCardView
        stop={makeStop()}
        currentStatus={LodgingStatus.NeedLodging}
        onStatusChange={vi.fn()}
      />,
    );

    expect(
      screen.getByText(LODGING_STATUS_CARD_COPY.needLodgingLabel),
    ).toBeDefined();
    expect(screen.queryByRole("radio")).toBeNull();
  });

  it("shows compact status pill for SecuredPrivate", () => {
    render(
      <LodgingStatusCardView
        stop={makeStop()}
        currentStatus={LodgingStatus.SecuredPrivate}
        onStatusChange={vi.fn()}
      />,
    );

    expect(
      screen.getByText(LODGING_STATUS_CARD_COPY.securedPrivateLabel),
    ).toBeDefined();
    expect(screen.queryByRole("radio")).toBeNull();
  });

  it("shows compact status pill for SharingWith", () => {
    render(
      <LodgingStatusCardView
        stop={makeStop()}
        currentStatus={LodgingStatus.SharingWith}
        onStatusChange={vi.fn()}
      />,
    );

    expect(
      screen.getByText(LODGING_STATUS_CARD_COPY.sharingWithLabel),
    ).toBeDefined();
    expect(screen.queryByRole("radio")).toBeNull();
  });

  it("shows compact status pill for SecuredCapacity", () => {
    render(
      <LodgingStatusCardView
        stop={makeStop()}
        currentStatus={LodgingStatus.SecuredCapacity}
        onStatusChange={vi.fn()}
      />,
    );

    expect(
      screen.getByText(LODGING_STATUS_CARD_COPY.securedCapacityLabel),
    ).toBeDefined();
    expect(screen.queryByRole("radio")).toBeNull();
  });
});

describe("LodgingStatusCardView — tap to edit compact card", () => {
  it("shows radio options after clicking compact card", () => {
    render(
      <LodgingStatusCardView
        stop={makeStop()}
        currentStatus={LodgingStatus.SecuredPrivate}
        onStatusChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText(LODGING_STATUS_CARD_COPY.tapToEditLabel));

    expect(screen.getAllByRole("radio").length).toBe(4);
  });

  it("returns to compact pill when currentStatus transitions from undefined to defined", () => {
    const { rerender } = render(
      <LodgingStatusCardView
        stop={makeStop()}
        currentStatus={LodgingStatus.SecuredPrivate}
        onStatusChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText(LODGING_STATUS_CARD_COPY.tapToEditLabel));
    expect(screen.getAllByRole("radio").length).toBe(4);

    rerender(
      <LodgingStatusCardView
        stop={makeStop()}
        currentStatus={undefined}
        onStatusChange={vi.fn()}
      />,
    );
    expect(screen.getAllByRole("radio").length).toBe(4);

    rerender(
      <LodgingStatusCardView
        stop={makeStop()}
        currentStatus={LodgingStatus.SecuredCapacity}
        onStatusChange={vi.fn()}
      />,
    );

    expect(screen.queryByRole("radio")).toBeNull();
    expect(
      screen.getByText(LODGING_STATUS_CARD_COPY.securedCapacityLabel),
    ).toBeDefined();
  });
});

describe("LodgingStatusCardView — onStatusChange called on radio selection", () => {
  it("calls onStatusChange with NeedLodging when that option is clicked", () => {
    const onStatusChange = vi.fn();
    render(
      <LodgingStatusCardView
        stop={makeStop()}
        currentStatus={undefined}
        onStatusChange={onStatusChange}
      />,
    );

    fireEvent.click(
      screen.getByLabelText(LODGING_STATUS_CARD_COPY.needLodgingLabel),
    );

    expect(onStatusChange).toHaveBeenCalledWith(LodgingStatus.NeedLodging);
  });

  it("calls onStatusChange with SecuredPrivate when that option is clicked", () => {
    const onStatusChange = vi.fn();
    render(
      <LodgingStatusCardView
        stop={makeStop()}
        currentStatus={undefined}
        onStatusChange={onStatusChange}
      />,
    );

    fireEvent.click(
      screen.getByLabelText(LODGING_STATUS_CARD_COPY.securedPrivateLabel),
    );

    expect(onStatusChange).toHaveBeenCalledWith(LodgingStatus.SecuredPrivate);
  });

  it("calls onStatusChange with SharingWith when that option is clicked", () => {
    const onStatusChange = vi.fn();
    render(
      <LodgingStatusCardView
        stop={makeStop()}
        currentStatus={undefined}
        onStatusChange={onStatusChange}
      />,
    );

    fireEvent.click(
      screen.getByLabelText(LODGING_STATUS_CARD_COPY.sharingWithLabel),
    );

    expect(onStatusChange).toHaveBeenCalledWith(LodgingStatus.SharingWith);
  });

  it("calls onStatusChange with SecuredCapacity when that option is clicked", () => {
    const onStatusChange = vi.fn();
    render(
      <LodgingStatusCardView
        stop={makeStop()}
        currentStatus={undefined}
        onStatusChange={onStatusChange}
      />,
    );

    fireEvent.click(
      screen.getByLabelText(LODGING_STATUS_CARD_COPY.securedCapacityLabel),
    );

    expect(onStatusChange).toHaveBeenCalledWith(LodgingStatus.SecuredCapacity);
  });
});
