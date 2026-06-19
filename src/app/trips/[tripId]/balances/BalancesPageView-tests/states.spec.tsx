import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { BalancesPageView } from "../BalancesPageView";
import { BALANCES_PAGE_COPY } from "../BalancesPageView.copy";
import { makeAccountBalance } from "./fixtures";

afterEach(cleanup);

describe("BalancesPageView — loading state", () => {
  it("renders loading text when isLoading is true", () => {
    render(
      <BalancesPageView
        balances={[]}
        transfers={[]}
        isLoading={true}
        isError={false}
      />,
    );
    expect(screen.getByText(BALANCES_PAGE_COPY.loadingText)).toBeDefined();
  });

  it("does not render the balance list when loading", () => {
    const { container } = render(
      <BalancesPageView
        balances={[makeAccountBalance()]}
        transfers={[]}
        isLoading={true}
        isError={false}
      />,
    );
    expect(container.querySelector("[data-testid=balance-list]")).toBeNull();
  });
});

describe("BalancesPageView — error state", () => {
  it("renders error text when isError is true", () => {
    render(
      <BalancesPageView
        balances={[]}
        transfers={[]}
        isLoading={false}
        isError={true}
      />,
    );
    expect(screen.getByText(BALANCES_PAGE_COPY.errorText)).toBeDefined();
  });
});

describe("BalancesPageView — empty state", () => {
  it("renders empty text when no balances are present", () => {
    render(
      <BalancesPageView
        balances={[]}
        transfers={[]}
        isLoading={false}
        isError={false}
      />,
    );
    expect(screen.getByText(BALANCES_PAGE_COPY.emptyText)).toBeDefined();
  });
});

describe("BalancesPageView — heading", () => {
  it("renders the page heading and subtext", () => {
    render(
      <BalancesPageView
        balances={[]}
        transfers={[]}
        isLoading={false}
        isError={false}
      />,
    );
    expect(screen.getByText(BALANCES_PAGE_COPY.heading)).toBeDefined();
    expect(screen.getByText(BALANCES_PAGE_COPY.headingSubtext)).toBeDefined();
  });
});
