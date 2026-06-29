import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
// TODO: upgrade to userEvent when @testing-library/user-event is available
import type { TestProfile } from "@/lib/debug-auth/test-profiles";
import { DebugUserSwitcherView } from "./DebugUserSwitcherView";
import { DEBUG_USER_SWITCHER_COPY } from "./DebugUserSwitcher.copy";

const PROFILES: TestProfile[] = [
  {
    uid: "synthetic:planner",
    displayName: "Pat Planner",
    email: "pat.planner@synthetic.test",
  },
  {
    uid: "synthetic:guest",
    displayName: "Gabby Guest",
    email: "gabby.guest@synthetic.test",
  },
];

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("DebugUserSwitcherView lists the seeded profiles", () => {
  it("renders a button per profile", () => {
    render(<DebugUserSwitcherView profiles={PROFILES} onSelect={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Pat Planner" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Gabby Guest" })).toBeDefined();
  });
});

describe("DebugUserSwitcherView selects a profile", () => {
  it("calls onSelect with the profile uid", () => {
    const onSelect = vi.fn();
    render(<DebugUserSwitcherView profiles={PROFILES} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("button", { name: "Pat Planner" }));
    expect(onSelect).toHaveBeenCalledWith("synthetic:planner");
  });
});

describe("DebugUserSwitcherView reflects pending and error states", () => {
  it("disables buttons while a sign-in is pending", () => {
    render(
      <DebugUserSwitcherView
        profiles={PROFILES}
        pendingUid="synthetic:planner"
        onSelect={vi.fn()}
      />,
    );
    expect(
      screen
        .getByRole("button", { name: "Gabby Guest" })
        .hasAttribute("disabled"),
    ).toBe(true);
  });

  it("renders the error message", () => {
    render(
      <DebugUserSwitcherView
        profiles={PROFILES}
        error="boom"
        onSelect={vi.fn()}
      />,
    );
    expect(
      screen.getByText(`${DEBUG_USER_SWITCHER_COPY.errorPrefix}boom`),
    ).toBeDefined();
  });
});
