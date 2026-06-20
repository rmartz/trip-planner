import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { BalancesPageView } from "../BalancesPageView";
import { BALANCES_PAGE_COPY } from "../BalancesPageView.copy";
import { makeAccountBalance, makeTransfer } from "./fixtures";

afterEach(cleanup);

describe("BalancesPageView — transfers section", () => {
  it("renders one row per transfer", () => {
    const { container } = render(
      <BalancesPageView
        balances={[makeAccountBalance()]}
        transfers={[
          makeTransfer({ transferId: "t-1" }),
          makeTransfer({ transferId: "t-2" }),
        ]}
        isLoading={false}
        isError={false}
      />,
    );
    const list = container.querySelector("[data-testid=transfer-list]");
    expect(list?.children.length).toBe(2);
  });

  it("renders both member names per transfer", () => {
    render(
      <BalancesPageView
        balances={[makeAccountBalance()]}
        transfers={[
          makeTransfer({
            transferId: "t-1",
            fromMemberName: "Bob",
            toMemberName: "Alice",
          }),
        ]}
        isLoading={false}
        isError={false}
      />,
    );
    expect(screen.getByTestId("transfer-row").textContent).toContain("Bob");
    expect(screen.getByTestId("transfer-row").textContent).toContain("Alice");
  });

  it("renders the transfer amount", () => {
    render(
      <BalancesPageView
        balances={[makeAccountBalance()]}
        transfers={[makeTransfer({ amountCents: 1500, currency: "USD" })]}
        isLoading={false}
        isError={false}
      />,
    );
    expect(screen.getByText("$15.00")).toBeDefined();
  });

  it("renders empty message when balances are present but no transfers needed", () => {
    render(
      <BalancesPageView
        balances={[makeAccountBalance({ amountCents: 0 })]}
        transfers={[]}
        isLoading={false}
        isError={false}
      />,
    );
    expect(screen.getByText(BALANCES_PAGE_COPY.transfersEmpty)).toBeDefined();
  });
});

describe("BalancesPageView — transfer row shows proxy member names when present", () => {
  it("shows proxied member names in the from-member label of a transfer row", () => {
    render(
      <BalancesPageView
        balances={[makeAccountBalance()]}
        transfers={[
          makeTransfer({
            fromMemberName: "Marco",
            proxiedMemberNames: ["Ben", "Sam"],
          }),
        ]}
        isLoading={false}
        isError={false}
      />,
    );
    const transferRow = screen.getByTestId("transfer-row");
    expect(transferRow.textContent).toContain(
      BALANCES_PAGE_COPY.transferFromWithProxies("Marco", ["Ben", "Sam"]),
    );
  });

  it("does not render a parenthetical from-label when proxiedMemberNames is absent", () => {
    render(
      <BalancesPageView
        balances={[makeAccountBalance()]}
        transfers={[
          makeTransfer({
            fromMemberName: "Zara",
            toMemberName: "Alice",
          }),
        ]}
        isLoading={false}
        isError={false}
      />,
    );
    expect(screen.queryByText(/Zara \(/)).toBeNull();
  });
});
