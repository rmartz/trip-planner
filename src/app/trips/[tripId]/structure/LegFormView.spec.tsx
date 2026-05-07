import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import type { Stop } from "@/lib/types/trip";
import { LEG_FORM_COPY } from "./copy";
import { LegFormView } from "./LegFormView";

afterEach(cleanup);

function makeStop(overrides: Partial<Stop> = {}): Stop {
  return {
    stopId: "stop-1",
    tripId: "trip-1",
    name: "London",
    startDate: new Date("2025-06-01T00:00:00.000Z"),
    endDate: new Date("2025-06-05T00:00:00.000Z"),
    order: 0,
    memberUids: ["uid-1"],
    ...overrides,
  };
}

const STOPS = [
  makeStop({ stopId: "stop-1", name: "London", order: 0 }),
  makeStop({ stopId: "stop-2", name: "Paris", order: 1 }),
  makeStop({ stopId: "stop-3", name: "Rome", order: 2 }),
];

describe("LegFormView — renders form fields", () => {
  it("renders fromStop and toStop dropdowns", () => {
    render(
      <LegFormView
        stops={STOPS}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isSubmitting={false}
      />,
    );

    expect(screen.getByLabelText(LEG_FORM_COPY.fromStopLabel)).toBeDefined();
    expect(screen.getByLabelText(LEG_FORM_COPY.toStopLabel)).toBeDefined();
  });

  it("renders submit and cancel buttons", () => {
    render(
      <LegFormView
        stops={STOPS}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isSubmitting={false}
      />,
    );

    expect(
      screen.getByRole("button", { name: LEG_FORM_COPY.submitAddLeg }),
    ).toBeDefined();
    expect(
      screen.getByRole("button", { name: LEG_FORM_COPY.cancelEdit }),
    ).toBeDefined();
  });

  it("renders stop names as options in both dropdowns", () => {
    render(
      <LegFormView
        stops={STOPS}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isSubmitting={false}
      />,
    );

    expect(screen.getAllByRole("option", { name: "London" })).toHaveLength(2);
    expect(screen.getAllByRole("option", { name: "Paris" })).toHaveLength(2);
    expect(screen.getAllByRole("option", { name: "Rome" })).toHaveLength(2);
  });
});

describe("LegFormView — fromStop validation", () => {
  it("shows error when submitted without selecting a fromStop", () => {
    render(
      <LegFormView
        stops={STOPS}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isSubmitting={false}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: LEG_FORM_COPY.submitAddLeg }),
    );

    expect(screen.getByText(LEG_FORM_COPY.errorFromStopRequired)).toBeDefined();
  });

  it("does not call onSubmit when fromStop is not selected", () => {
    const onSubmit = vi.fn();
    render(
      <LegFormView
        stops={STOPS}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        isSubmitting={false}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: LEG_FORM_COPY.submitAddLeg }),
    );

    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("LegFormView — toStop validation", () => {
  it("shows error when submitted without selecting a toStop", () => {
    render(
      <LegFormView
        stops={STOPS}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isSubmitting={false}
      />,
    );

    fireEvent.change(screen.getByLabelText(LEG_FORM_COPY.fromStopLabel), {
      target: { value: "stop-1" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: LEG_FORM_COPY.submitAddLeg }),
    );

    expect(screen.getByText(LEG_FORM_COPY.errorToStopRequired)).toBeDefined();
  });

  it("shows error when fromStop and toStop are the same", () => {
    render(
      <LegFormView
        stops={STOPS}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isSubmitting={false}
      />,
    );

    fireEvent.change(screen.getByLabelText(LEG_FORM_COPY.fromStopLabel), {
      target: { value: "stop-1" },
    });
    fireEvent.change(screen.getByLabelText(LEG_FORM_COPY.toStopLabel), {
      target: { value: "stop-1" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: LEG_FORM_COPY.submitAddLeg }),
    );

    expect(screen.getByText(LEG_FORM_COPY.errorSameStop)).toBeDefined();
  });

  it("calls onSubmit with fromStopId and toStopId when form is valid", () => {
    const onSubmit = vi.fn();
    render(
      <LegFormView
        stops={STOPS}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        isSubmitting={false}
      />,
    );

    fireEvent.change(screen.getByLabelText(LEG_FORM_COPY.fromStopLabel), {
      target: { value: "stop-1" },
    });
    fireEvent.change(screen.getByLabelText(LEG_FORM_COPY.toStopLabel), {
      target: { value: "stop-2" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: LEG_FORM_COPY.submitAddLeg }),
    );

    expect(onSubmit).toHaveBeenCalledWith({
      fromStopId: "stop-1",
      toStopId: "stop-2",
    });
  });
});

describe("LegFormView — cancel", () => {
  it("calls onCancel when cancel button is clicked", () => {
    const onCancel = vi.fn();
    render(
      <LegFormView
        stops={STOPS}
        onSubmit={vi.fn()}
        onCancel={onCancel}
        isSubmitting={false}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: LEG_FORM_COPY.cancelEdit }),
    );

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

describe("LegFormView — submitting state", () => {
  it("disables the submit button while submitting", () => {
    render(
      <LegFormView
        stops={STOPS}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isSubmitting={true}
      />,
    );

    const button = screen.getByRole("button", {
      name: LEG_FORM_COPY.submitAddLeg,
    });
    expect((button as HTMLButtonElement).disabled).toBe(true);
  });
});
