import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { TripPhasePill } from "./TripPhasePill";
import { TripPhase } from "./TripPhasePill";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("TripPhasePill renders the phase label", () => {
  it("renders Planning label for Planning phase", () => {
    render(<TripPhasePill phase={TripPhase.Planning} />);
    expect(screen.getByText("Planning")).toBeDefined();
  });

  it("renders Coordination label for Coordination phase", () => {
    render(<TripPhasePill phase={TripPhase.Coordination} />);
    expect(screen.getByText("Coordination")).toBeDefined();
  });

  it("renders Settling up label for SettlingUp phase", () => {
    render(<TripPhasePill phase={TripPhase.SettlingUp} />);
    expect(screen.getByText("Settling up")).toBeDefined();
  });

  it("renders Settled label for Settled phase", () => {
    render(<TripPhasePill phase={TripPhase.Settled} />);
    expect(screen.getByText("Settled")).toBeDefined();
  });
});
