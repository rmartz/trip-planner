import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { PhasePill } from "./PhasePill";
import { TripPhase } from "@/lib/types/trip";
import { PHASE_PILL_COPY } from "./PhasePill.copy";

afterEach(cleanup);

describe("PhasePill — Planning phase", () => {
  it("renders the Planning label", () => {
    render(<PhasePill phase={TripPhase.Planning} />);
    expect(screen.getByText(PHASE_PILL_COPY[TripPhase.Planning])).toBeDefined();
  });
});

describe("PhasePill — Coordination phase", () => {
  it("renders the Coordination label", () => {
    render(<PhasePill phase={TripPhase.Coordination} />);
    expect(
      screen.getByText(PHASE_PILL_COPY[TripPhase.Coordination]),
    ).toBeDefined();
  });
});

describe("PhasePill — SettlingUp phase", () => {
  it("renders the Settling Up label", () => {
    render(<PhasePill phase={TripPhase.SettlingUp} />);
    expect(
      screen.getByText(PHASE_PILL_COPY[TripPhase.SettlingUp]),
    ).toBeDefined();
  });
});

describe("PhasePill — Settled phase", () => {
  it("renders the Settled label", () => {
    render(<PhasePill phase={TripPhase.Settled} />);
    expect(screen.getByText(PHASE_PILL_COPY[TripPhase.Settled])).toBeDefined();
  });
});
