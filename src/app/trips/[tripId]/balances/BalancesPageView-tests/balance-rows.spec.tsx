import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { BalancesPageView } from "../BalancesPageView";
import { BALANCES_PAGE_COPY } from "../BalancesPageView.copy";
import { makeAccountBalance, makeNonAccountBalance } from "./fixtures";

afterEach(cleanup);

describe("BalancesPageView — balance list", () => {
  it("renders one row per balance", () => {
    const { container } = render(
      <BalancesPageView
        balances={[
          makeAccountBalance({ memberId: "m-1", memberName: "Alice" }),
          makeAccountBalance({ memberId: "m-2", memberName: "Bob" }),
          makeNonAccountBalance("Carol Proxy", {
            memberId: "m-3",
            memberName: "Carol",
          }),
        ]}
        transfers={[]}
        isLoading={false}
        isError={false}
      />,
    );
    const list = container.querySelector("[data-testid=balance-list]");
    expect(list?.children.length).toBe(3);
  });

  it("renders each member's name", () => {
    render(
      <BalancesPageView
        balances={[
          makeAccountBalance({ memberId: "m-1", memberName: "Alice" }),
          makeAccountBalance({ memberId: "m-2", memberName: "Bob" }),
        ]}
        transfers={[]}
        isLoading={false}
        isError={false}
      />,
    );
    expect(screen.getByText("Alice")).toBeDefined();
    expect(screen.getByText("Bob")).toBeDefined();
  });

  it("renders the 'is owed' label for positive balances", () => {
    render(
      <BalancesPageView
        balances={[makeAccountBalance({ amountCents: 5000 })]}
        transfers={[]}
        isLoading={false}
        isError={false}
      />,
    );
    expect(screen.getByText(BALANCES_PAGE_COPY.netCreditedLabel)).toBeDefined();
  });

  it("renders the 'owes' label for negative balances", () => {
    render(
      <BalancesPageView
        balances={[makeAccountBalance({ amountCents: -3000 })]}
        transfers={[]}
        isLoading={false}
        isError={false}
      />,
    );
    expect(screen.getByText(BALANCES_PAGE_COPY.netOwedLabel)).toBeDefined();
  });

  it("renders the 'is settled' label for zero balances", () => {
    render(
      <BalancesPageView
        balances={[makeAccountBalance({ amountCents: 0 })]}
        transfers={[]}
        isLoading={false}
        isError={false}
      />,
    );
    expect(screen.getByText(BALANCES_PAGE_COPY.netSettledLabel)).toBeDefined();
  });

  it("formats the absolute amount", () => {
    render(
      <BalancesPageView
        balances={[makeAccountBalance({ amountCents: -4250, currency: "USD" })]}
        transfers={[]}
        isLoading={false}
        isError={false}
      />,
    );
    expect(screen.getByText("$42.50")).toBeDefined();
  });
});

describe("BalancesPageView — non-account member balance row shows * suffix and proxy attribution", () => {
  it("renders the member name with * suffix for a non-account balance row", () => {
    render(
      <BalancesPageView
        balances={[
          makeNonAccountBalance("Marco", {
            memberId: "m-sam",
            memberName: "Sam",
          }),
        ]}
        transfers={[]}
        isLoading={false}
        isError={false}
      />,
    );
    expect(screen.getByText("Sam*")).toBeDefined();
  });

  it("renders proxy attribution for a non-account balance row", () => {
    render(
      <BalancesPageView
        balances={[
          makeNonAccountBalance("Marco", {
            memberId: "m-sam",
            memberName: "Sam",
          }),
        ]}
        transfers={[]}
        isLoading={false}
        isError={false}
      />,
    );
    expect(
      screen.getByText(BALANCES_PAGE_COPY.proxyLabel("Marco")),
    ).toBeDefined();
  });

  it("does not render proxy attribution for a regular member balance row", () => {
    render(
      <BalancesPageView
        balances={[
          makeAccountBalance({ memberId: "m-alice", memberName: "Alice" }),
        ]}
        transfers={[]}
        isLoading={false}
        isError={false}
      />,
    );
    expect(
      screen.queryByText(BALANCES_PAGE_COPY.proxyLabel("Alice")),
    ).toBeNull();
  });
});
