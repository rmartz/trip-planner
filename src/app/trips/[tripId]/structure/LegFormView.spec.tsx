import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { Stop } from "@/lib/types/trip";
import { LEG_FORM_COPY } from "./LegFormView.copy";
import { LegFormView } from "./LegFormView";

afterEach(cleanup);

// Mock ShadCN Select with a native <select> that the tests can drive with fireEvent.change.
// The mock extracts the `id` from SelectTrigger and renders a plain <select id={id}> so
// that screen.getByLabelText() resolves via the Label's htmlFor association.
vi.mock("@/components/ui/select", async () => {
  const React = await import("react");

  const SelectTrigger: React.FC<{
    id?: string;
    children?: React.ReactNode;
  }> = () => null;

  function SelectValue() {
    return null;
  }

  function SelectContent({ children }: { children?: React.ReactNode }) {
    return React.createElement(React.Fragment, null, children);
  }

  function SelectItem({
    value,
    children,
  }: {
    value: string;
    children?: React.ReactNode;
  }) {
    return React.createElement("option", { value }, children);
  }

  function Select({
    children,
    value,
    onValueChange,
  }: {
    children: React.ReactNode;
    value?: string;
    onValueChange?: (v: string) => void;
  }) {
    let selectId: string | undefined;
    const contentChildren: React.ReactNode[] = [];

    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child)) {
        if (child.type === SelectTrigger) {
          selectId = (child.props as { id?: string }).id;
        }
        if (child.type === SelectContent) {
          contentChildren.push(child);
        }
      }
    });

    return React.createElement(
      "select",
      {
        id: selectId,
        value: value ?? "",
        onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
          onValueChange?.(e.target.value),
      },
      React.createElement("option", { value: "" }),
      ...contentChildren,
    );
  }

  return { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
});

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

  it("renders name and notes fields", () => {
    render(
      <LegFormView
        stops={STOPS}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isSubmitting={false}
      />,
    );

    expect(screen.getByLabelText(LEG_FORM_COPY.nameLabel)).toBeDefined();
    expect(screen.getByLabelText(LEG_FORM_COPY.notesLabel)).toBeDefined();
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
});

describe("LegFormView — name validation", () => {
  it("shows error when submitted without a name", () => {
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
      target: { value: "stop-2" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: LEG_FORM_COPY.submitAddLeg }),
    );

    expect(screen.getByText(LEG_FORM_COPY.errorNameRequired)).toBeDefined();
  });

  it("does not call onSubmit when name is blank", () => {
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

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("calls onSubmit with name and stops when form is valid", () => {
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
    fireEvent.change(screen.getByLabelText(LEG_FORM_COPY.nameLabel), {
      target: { value: "London to Paris" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: LEG_FORM_COPY.submitAddLeg }),
    );

    expect(onSubmit).toHaveBeenCalledWith({
      fromStopId: "stop-1",
      toStopId: "stop-2",
      name: "London to Paris",
    });
  });

  it("includes notes in onSubmit when provided", () => {
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
    fireEvent.change(screen.getByLabelText(LEG_FORM_COPY.nameLabel), {
      target: { value: "London to Paris" },
    });
    fireEvent.change(screen.getByLabelText(LEG_FORM_COPY.notesLabel), {
      target: { value: "Via Eurostar" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: LEG_FORM_COPY.submitAddLeg }),
    );

    expect(onSubmit).toHaveBeenCalledWith({
      fromStopId: "stop-1",
      toStopId: "stop-2",
      name: "London to Paris",
      notes: "Via Eurostar",
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
