import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  type LodgingGuestCandidate,
  LodgingHostGuestPickerView,
} from "./LodgingHostGuestPickerView";
import { LODGING_HOST_GUEST_PICKER_COPY } from "./LodgingHostGuestPickerView.copy";

afterEach(cleanup);

const COPY = LODGING_HOST_GUEST_PICKER_COPY;

function makeGuest(
  overrides: Partial<LodgingGuestCandidate> = {},
): LodgingGuestCandidate {
  return {
    uid: "uid-1",
    displayName: "Alice",
    ...overrides,
  };
}

describe("LodgingHostGuestPickerView — renders guest list", () => {
  it("renders each guest by display name", () => {
    render(
      <LodgingHostGuestPickerView
        guests={[
          makeGuest({ uid: "uid-1", displayName: "Alice" }),
          makeGuest({ uid: "uid-2", displayName: "Bob" }),
        ]}
        selectedUids={new Set()}
        onToggleGuest={vi.fn()}
        onSave={vi.fn()}
        isSubmitting={false}
      />,
    );

    expect(screen.getByText("Alice")).toBeDefined();
    expect(screen.getByText("Bob")).toBeDefined();
  });

  it("renders empty-guests message when guest list is empty", () => {
    render(
      <LodgingHostGuestPickerView
        guests={[]}
        selectedUids={new Set()}
        onToggleGuest={vi.fn()}
        onSave={vi.fn()}
        isSubmitting={false}
      />,
    );

    expect(screen.getByText(COPY.noGuestsText)).toBeDefined();
  });
});

describe("LodgingHostGuestPickerView — selected state", () => {
  it("renders selected guests as checked", () => {
    const { container } = render(
      <LodgingHostGuestPickerView
        guests={[
          makeGuest({ uid: "uid-1", displayName: "Alice" }),
          makeGuest({ uid: "uid-2", displayName: "Bob" }),
        ]}
        selectedUids={new Set(["uid-1"])}
        onToggleGuest={vi.fn()}
        onSave={vi.fn()}
        isSubmitting={false}
      />,
    );

    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect((checkboxes[0] as HTMLInputElement).checked).toBe(true);
    expect((checkboxes[1] as HTMLInputElement).checked).toBe(false);
  });
});

describe("LodgingHostGuestPickerView — onToggleGuest", () => {
  it("calls onToggleGuest with the guest uid when a guest checkbox is toggled", () => {
    const onToggleGuest = vi.fn();
    render(
      <LodgingHostGuestPickerView
        guests={[makeGuest({ uid: "uid-42", displayName: "Carol" })]}
        selectedUids={new Set()}
        onToggleGuest={onToggleGuest}
        onSave={vi.fn()}
        isSubmitting={false}
      />,
    );

    fireEvent.click(screen.getByLabelText("Carol"));
    expect(onToggleGuest).toHaveBeenCalledWith("uid-42");
  });
});

describe("LodgingHostGuestPickerView — save button", () => {
  it("renders the save button", () => {
    render(
      <LodgingHostGuestPickerView
        guests={[makeGuest()]}
        selectedUids={new Set()}
        onToggleGuest={vi.fn()}
        onSave={vi.fn()}
        isSubmitting={false}
      />,
    );

    expect(screen.getByRole("button", { name: COPY.saveButton })).toBeDefined();
  });

  it("calls onSave when the save button is clicked", () => {
    const onSave = vi.fn();
    render(
      <LodgingHostGuestPickerView
        guests={[makeGuest()]}
        selectedUids={new Set()}
        onToggleGuest={vi.fn()}
        onSave={onSave}
        isSubmitting={false}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: COPY.saveButton }));
    expect(onSave).toHaveBeenCalledOnce();
  });

  it("disables save button while submitting", () => {
    render(
      <LodgingHostGuestPickerView
        guests={[makeGuest()]}
        selectedUids={new Set()}
        onToggleGuest={vi.fn()}
        onSave={vi.fn()}
        isSubmitting={true}
      />,
    );

    const btn = screen.getByRole("button", { name: COPY.saveButton });
    expect((btn as HTMLButtonElement).disabled).toBe(true);
  });
});
