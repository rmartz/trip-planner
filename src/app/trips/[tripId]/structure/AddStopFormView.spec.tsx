import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { TRIP_STRUCTURE_COPY } from "./copy";
import { AddStopFormView } from "./AddStopFormView";

afterEach(cleanup);

describe("AddStopFormView — renders form fields", () => {
  it("renders name, start date, and end date fields", () => {
    render(
      <AddStopFormView
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isSubmitting={false}
      />,
    );

    expect(screen.getByLabelText(TRIP_STRUCTURE_COPY.nameLabel)).toBeDefined();
    expect(
      screen.getByLabelText(TRIP_STRUCTURE_COPY.startDateLabel),
    ).toBeDefined();
    expect(
      screen.getByLabelText(TRIP_STRUCTURE_COPY.endDateLabel),
    ).toBeDefined();
  });

  it("renders submit and cancel buttons", () => {
    render(
      <AddStopFormView
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isSubmitting={false}
      />,
    );

    expect(
      screen.getByRole("button", { name: TRIP_STRUCTURE_COPY.submitAddStop }),
    ).toBeDefined();
    expect(
      screen.getByRole("button", { name: TRIP_STRUCTURE_COPY.cancelEdit }),
    ).toBeDefined();
  });
});

describe("AddStopFormView — name validation", () => {
  it("shows name required error when submitted without a name", () => {
    render(
      <AddStopFormView
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isSubmitting={false}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: TRIP_STRUCTURE_COPY.submitAddStop }),
    );

    expect(
      screen.getByText(TRIP_STRUCTURE_COPY.errorNameRequired),
    ).toBeDefined();
  });

  it("does not call onSubmit when name is empty", () => {
    const onSubmit = vi.fn();
    render(
      <AddStopFormView
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        isSubmitting={false}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: TRIP_STRUCTURE_COPY.submitAddStop }),
    );

    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("AddStopFormView — date validation", () => {
  it("shows start date required error when name is provided but start date is not", () => {
    render(
      <AddStopFormView
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isSubmitting={false}
      />,
    );

    fireEvent.change(screen.getByLabelText(TRIP_STRUCTURE_COPY.nameLabel), {
      target: { value: "Vienna" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: TRIP_STRUCTURE_COPY.submitAddStop }),
    );

    expect(
      screen.getByText(TRIP_STRUCTURE_COPY.errorStartDateRequired),
    ).toBeDefined();
  });

  it("shows end date required error when only name and start date are provided", () => {
    render(
      <AddStopFormView
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isSubmitting={false}
      />,
    );

    fireEvent.change(screen.getByLabelText(TRIP_STRUCTURE_COPY.nameLabel), {
      target: { value: "Vienna" },
    });
    fireEvent.change(
      screen.getByLabelText(TRIP_STRUCTURE_COPY.startDateLabel),
      { target: { value: "2025-07-01" } },
    );
    fireEvent.click(
      screen.getByRole("button", { name: TRIP_STRUCTURE_COPY.submitAddStop }),
    );

    expect(
      screen.getByText(TRIP_STRUCTURE_COPY.errorEndDateRequired),
    ).toBeDefined();
  });

  it("shows date order error when end date is before start date", () => {
    render(
      <AddStopFormView
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isSubmitting={false}
      />,
    );

    fireEvent.change(screen.getByLabelText(TRIP_STRUCTURE_COPY.nameLabel), {
      target: { value: "Vienna" },
    });
    fireEvent.change(
      screen.getByLabelText(TRIP_STRUCTURE_COPY.startDateLabel),
      { target: { value: "2025-07-10" } },
    );
    fireEvent.change(screen.getByLabelText(TRIP_STRUCTURE_COPY.endDateLabel), {
      target: { value: "2025-07-01" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: TRIP_STRUCTURE_COPY.submitAddStop }),
    );

    expect(
      screen.getByText(TRIP_STRUCTURE_COPY.errorEndBeforeStart),
    ).toBeDefined();
  });

  it("calls onSubmit with parsed dates when form is valid", () => {
    const onSubmit = vi.fn();
    render(
      <AddStopFormView
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        isSubmitting={false}
      />,
    );

    fireEvent.change(screen.getByLabelText(TRIP_STRUCTURE_COPY.nameLabel), {
      target: { value: "Vienna" },
    });
    fireEvent.change(
      screen.getByLabelText(TRIP_STRUCTURE_COPY.startDateLabel),
      { target: { value: "2025-07-01" } },
    );
    fireEvent.change(screen.getByLabelText(TRIP_STRUCTURE_COPY.endDateLabel), {
      target: { value: "2025-07-05" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: TRIP_STRUCTURE_COPY.submitAddStop }),
    );

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Vienna",
      startDate: new Date("2025-07-01T00:00:00"),
      endDate: new Date("2025-07-05T00:00:00"),
    });
  });
});

describe("AddStopFormView — initial values", () => {
  it("submits pre-populated values without user interaction when all fields are valid", () => {
    const onSubmit = vi.fn();
    render(
      <AddStopFormView
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        isSubmitting={false}
        initialName="Vienna"
        initialStartDate="2025-07-01"
        initialEndDate="2025-07-05"
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: TRIP_STRUCTURE_COPY.submitAddStop }),
    );

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Vienna",
      startDate: new Date("2025-07-01T00:00:00"),
      endDate: new Date("2025-07-05T00:00:00"),
    });
  });
});

describe("AddStopFormView — cancel", () => {
  it("calls onCancel when cancel button is clicked", () => {
    const onCancel = vi.fn();
    render(
      <AddStopFormView
        onSubmit={vi.fn()}
        onCancel={onCancel}
        isSubmitting={false}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: TRIP_STRUCTURE_COPY.cancelEdit }),
    );

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
