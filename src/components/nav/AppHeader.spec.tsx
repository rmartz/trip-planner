import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { AppHeaderView } from "./AppHeaderView";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("AppHeader exists and renders title slot", () => {
  it("renders the title passed as a prop", () => {
    render(
      <AppHeaderView
        title="My Trips"
        leftSlot={undefined}
        rightSlot={undefined}
      />,
    );
    expect(screen.getByText("My Trips")).toBeDefined();
  });
});

describe("AppHeader renders left slot", () => {
  it("renders a custom left slot element", () => {
    render(
      <AppHeaderView
        title="Dashboard"
        leftSlot={<button>Open menu</button>}
        rightSlot={undefined}
      />,
    );
    expect(screen.getByRole("button", { name: "Open menu" })).toBeDefined();
  });
});

describe("AppHeader renders right slot", () => {
  it("renders a custom right slot element", () => {
    render(
      <AppHeaderView
        title="Dashboard"
        leftSlot={undefined}
        rightSlot={<button>Notifications</button>}
      />,
    );
    expect(screen.getByRole("button", { name: "Notifications" })).toBeDefined();
  });
});

describe("AppHeader renders subtitle when provided", () => {
  it("renders the subtitle text", () => {
    render(
      <AppHeaderView
        title="Trip Overview"
        subtitle="Paris 2025"
        leftSlot={undefined}
        rightSlot={undefined}
      />,
    );
    expect(screen.getByText("Paris 2025")).toBeDefined();
  });

  it("does not render subtitle when not provided", () => {
    render(
      <AppHeaderView
        title="Trip Overview"
        leftSlot={undefined}
        rightSlot={undefined}
      />,
    );
    expect(screen.queryByTestId("app-header-subtitle")).toBeNull();
  });
});

describe("AppHeader renders accessible landmark", () => {
  it("renders a header element", () => {
    render(
      <AppHeaderView title="Home" leftSlot={undefined} rightSlot={undefined} />,
    );
    expect(document.querySelector("[data-testid='app-header']")).toBeDefined();
  });
});
