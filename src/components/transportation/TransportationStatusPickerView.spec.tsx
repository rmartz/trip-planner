import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { TransportationStatus } from "@/lib/types/transportation";
import { TransportationStatusPickerView } from "./TransportationStatusPickerView";
import { TRANSPORTATION_STATUS_PICKER_COPY } from "./TransportationStatusPickerView.copy";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function makeProps(
  overrides: Partial<
    React.ComponentProps<typeof TransportationStatusPickerView>
  > = {},
): React.ComponentProps<typeof TransportationStatusPickerView> {
  return {
    legId: "leg-1",
    routeName: "I-35 caravan",
    departureLabel: "Fri 4pm",
    value: TransportationStatus.NeedTransportation,
    onChange: vi.fn(),
    ...overrides,
  };
}

describe("TransportationStatusPickerView — renders route name and departure label", () => {
  it("renders the route name in the leg heading", () => {
    render(<TransportationStatusPickerView {...makeProps()} />);

    expect(screen.getByText(/I-35 caravan/)).toBeDefined();
  });

  it("renders the departure label in the leg heading", () => {
    render(<TransportationStatusPickerView {...makeProps()} />);

    expect(screen.getByText(/Fri 4pm/)).toBeDefined();
  });
});

describe("TransportationStatusPickerView — renders all five status options", () => {
  it("renders Driving option", () => {
    render(<TransportationStatusPickerView {...makeProps()} />);

    expect(
      screen.getByLabelText(
        TRANSPORTATION_STATUS_PICKER_COPY.statusLabels[
          TransportationStatus.Driving
        ],
      ),
    ).toBeDefined();
  });

  it("renders Need a ride option", () => {
    render(<TransportationStatusPickerView {...makeProps()} />);

    expect(
      screen.getByLabelText(
        TRANSPORTATION_STATUS_PICKER_COPY.statusLabels[
          TransportationStatus.NeedTransportation
        ],
      ),
    ).toBeDefined();
  });

  it("renders Have own car option", () => {
    render(<TransportationStatusPickerView {...makeProps()} />);

    expect(
      screen.getByLabelText(
        TRANSPORTATION_STATUS_PICKER_COPY.statusLabels[
          TransportationStatus.DrivingWithSeats
        ],
      ),
    ).toBeDefined();
  });

  it("renders Skipping this leg option", () => {
    render(<TransportationStatusPickerView {...makeProps()} />);

    expect(
      screen.getByLabelText(
        TRANSPORTATION_STATUS_PICKER_COPY.statusLabels[
          TransportationStatus.FlyingOrOther
        ],
      ),
    ).toBeDefined();
  });

  it("renders No reply option", () => {
    render(<TransportationStatusPickerView {...makeProps()} />);

    expect(
      screen.getByLabelText(
        TRANSPORTATION_STATUS_PICKER_COPY.statusLabels[
          TransportationStatus.RidingWith
        ],
      ),
    ).toBeDefined();
  });
});

describe("TransportationStatusPickerView — reflects current selection", () => {
  it("marks the current status as checked", () => {
    render(
      <TransportationStatusPickerView
        {...makeProps({ value: TransportationStatus.Driving })}
      />,
    );

    const drivingRadio = screen.getByLabelText(
      TRANSPORTATION_STATUS_PICKER_COPY.statusLabels[
        TransportationStatus.Driving
      ],
    );
    expect((drivingRadio as HTMLInputElement).checked).toBe(true);
  });

  it("does not mark other options as checked", () => {
    render(
      <TransportationStatusPickerView
        {...makeProps({ value: TransportationStatus.Driving })}
      />,
    );

    const needRideRadio = screen.getByLabelText(
      TRANSPORTATION_STATUS_PICKER_COPY.statusLabels[
        TransportationStatus.NeedTransportation
      ],
    );
    expect((needRideRadio as HTMLInputElement).checked).toBe(false);
  });
});

describe("TransportationStatusPickerView — calls onChange on selection", () => {
  it("calls onChange with Driving when that option is selected", () => {
    const onChange = vi.fn();
    render(
      <TransportationStatusPickerView
        {...makeProps({
          value: TransportationStatus.NeedTransportation,
          onChange,
        })}
      />,
    );

    fireEvent.click(
      screen.getByLabelText(
        TRANSPORTATION_STATUS_PICKER_COPY.statusLabels[
          TransportationStatus.Driving
        ],
      ),
    );

    expect(onChange).toHaveBeenCalledWith(TransportationStatus.Driving);
  });

  it("calls onChange with NeedTransportation when that option is selected", () => {
    const onChange = vi.fn();
    render(
      <TransportationStatusPickerView
        {...makeProps({ value: TransportationStatus.Driving, onChange })}
      />,
    );

    fireEvent.click(
      screen.getByLabelText(
        TRANSPORTATION_STATUS_PICKER_COPY.statusLabels[
          TransportationStatus.NeedTransportation
        ],
      ),
    );

    expect(onChange).toHaveBeenCalledWith(
      TransportationStatus.NeedTransportation,
    );
  });
});
