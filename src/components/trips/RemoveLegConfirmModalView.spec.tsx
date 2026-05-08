import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { RemoveLegConfirmModalView } from "./RemoveLegConfirmModalView";
import { REMOVE_LEG_CONFIRM_MODAL_COPY } from "./RemoveLegConfirmModalView.copy";

afterEach(cleanup);

describe("RemoveLegConfirmModalView — title", () => {
  it("renders the modal title", () => {
    render(
      <RemoveLegConfirmModalView
        legName="London to Paris"
        affectedGuestUids={[]}
        isRemoving={false}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText(REMOVE_LEG_CONFIRM_MODAL_COPY.title)).toBeDefined();
  });
});

describe("RemoveLegConfirmModalView — body text", () => {
  it("renders no-guests body when affectedGuestUids is empty", () => {
    render(
      <RemoveLegConfirmModalView
        legName="London to Paris"
        affectedGuestUids={[]}
        isRemoving={false}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(
      screen.getByText(REMOVE_LEG_CONFIRM_MODAL_COPY.bodyNoGuests),
    ).toBeDefined();
  });

  it("renders guest-count body when guests exist", () => {
    render(
      <RemoveLegConfirmModalView
        legName="London to Paris"
        affectedGuestUids={["uid-alice", "uid-bob"]}
        isRemoving={false}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(
      screen.getByText(REMOVE_LEG_CONFIRM_MODAL_COPY.bodyWithGuests(2)),
    ).toBeDefined();
  });

  it("renders affected guests section label when guests exist", () => {
    render(
      <RemoveLegConfirmModalView
        legName="London to Paris"
        affectedGuestUids={["uid-alice"]}
        isRemoving={false}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(
      screen.getByText(REMOVE_LEG_CONFIRM_MODAL_COPY.affectedGuestsLabel),
    ).toBeDefined();
  });

  it("renders each affected guest uid", () => {
    render(
      <RemoveLegConfirmModalView
        legName="London to Paris"
        affectedGuestUids={["uid-alice", "uid-bob"]}
        isRemoving={false}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText("uid-alice")).toBeDefined();
    expect(screen.getByText("uid-bob")).toBeDefined();
  });

  it("does not render affected guests section when no guests", () => {
    render(
      <RemoveLegConfirmModalView
        legName="London to Paris"
        affectedGuestUids={[]}
        isRemoving={false}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(
      screen.queryByText(REMOVE_LEG_CONFIRM_MODAL_COPY.affectedGuestsLabel),
    ).toBeNull();
  });
});

describe("RemoveLegConfirmModalView — actions", () => {
  it("calls onConfirm when confirm button is clicked", () => {
    const onConfirm = vi.fn();
    render(
      <RemoveLegConfirmModalView
        legName="London to Paris"
        affectedGuestUids={[]}
        isRemoving={false}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    );
    screen
      .getByRole("button", {
        name: REMOVE_LEG_CONFIRM_MODAL_COPY.confirmButton,
      })
      .click();
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when cancel button is clicked", () => {
    const onCancel = vi.fn();
    render(
      <RemoveLegConfirmModalView
        legName="London to Paris"
        affectedGuestUids={[]}
        isRemoving={false}
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    );
    screen
      .getByRole("button", { name: REMOVE_LEG_CONFIRM_MODAL_COPY.cancelButton })
      .click();
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("disables confirm button while isRemoving is true", () => {
    render(
      <RemoveLegConfirmModalView
        legName="London to Paris"
        affectedGuestUids={[]}
        isRemoving={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    const btn = screen.getByRole<HTMLButtonElement>("button", {
      name: REMOVE_LEG_CONFIRM_MODAL_COPY.confirmButton,
    });
    expect(btn.disabled).toBe(true);
  });
});
