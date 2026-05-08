import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { CLAIM_PAGE_COPY } from "./ClaimPageView.copy";
import { ClaimPageView } from "./ClaimPageView";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

interface ClaimContext {
  memberName: string;
  tripName: string;
  plannerName: string;
  dateRange: string;
}

function makeClaimContext(overrides: Partial<ClaimContext> = {}): ClaimContext {
  return {
    memberName: "Ben",
    tripName: "Paris Trip",
    plannerName: "Alice",
    dateRange: "Jun 1 – Jun 8, 2025",
    ...overrides,
  };
}

describe("ClaimPageView — invalid token", () => {
  it("renders invalid token heading when claimContext is undefined", () => {
    render(
      <ClaimPageView
        claimContext={undefined}
        onClaim={vi.fn()}
        onNotMe={vi.fn()}
      />,
    );
    expect(screen.getByText(CLAIM_PAGE_COPY.invalidTokenHeading)).toBeDefined();
  });

  it("renders invalid token description when claimContext is undefined", () => {
    render(
      <ClaimPageView
        claimContext={undefined}
        onClaim={vi.fn()}
        onNotMe={vi.fn()}
      />,
    );
    expect(
      screen.getByText(CLAIM_PAGE_COPY.invalidTokenDescription),
    ).toBeDefined();
  });
});

describe("ClaimPageView — valid claim context", () => {
  it("renders the added-as label", () => {
    render(
      <ClaimPageView
        claimContext={makeClaimContext()}
        onClaim={vi.fn()}
        onNotMe={vi.fn()}
      />,
    );
    expect(screen.getByText(CLAIM_PAGE_COPY.addedAsLabel)).toBeDefined();
  });

  it("renders the proxied member name prominently", () => {
    render(
      <ClaimPageView
        claimContext={makeClaimContext({ memberName: "Ben" })}
        onClaim={vi.fn()}
        onNotMe={vi.fn()}
      />,
    );
    expect(screen.getByText('"Ben"')).toBeDefined();
  });

  it("renders the trip name in context", () => {
    render(
      <ClaimPageView
        claimContext={makeClaimContext({ tripName: "Paris Trip" })}
        onClaim={vi.fn()}
        onNotMe={vi.fn()}
      />,
    );
    expect(screen.getByText("Paris Trip", { exact: false })).toBeDefined();
  });

  it("renders the Claim & sign up CTA", () => {
    render(
      <ClaimPageView
        claimContext={makeClaimContext()}
        onClaim={vi.fn()}
        onNotMe={vi.fn()}
      />,
    );
    expect(screen.getByText(CLAIM_PAGE_COPY.claimButton)).toBeDefined();
  });

  it("renders the Not me CTA", () => {
    render(
      <ClaimPageView
        claimContext={makeClaimContext()}
        onClaim={vi.fn()}
        onNotMe={vi.fn()}
      />,
    );
    expect(screen.getByText(CLAIM_PAGE_COPY.notMeButton)).toBeDefined();
  });

  it("calls onClaim when Claim & sign up is clicked", () => {
    const onClaim = vi.fn();
    render(
      <ClaimPageView
        claimContext={makeClaimContext()}
        onClaim={onClaim}
        onNotMe={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText(CLAIM_PAGE_COPY.claimButton));
    expect(onClaim).toHaveBeenCalledTimes(1);
  });

  it("calls onNotMe when Not me is clicked", () => {
    const onNotMe = vi.fn();
    render(
      <ClaimPageView
        claimContext={makeClaimContext()}
        onClaim={vi.fn()}
        onNotMe={onNotMe}
      />,
    );
    fireEvent.click(screen.getByText(CLAIM_PAGE_COPY.notMeButton));
    expect(onNotMe).toHaveBeenCalledTimes(1);
  });
});
