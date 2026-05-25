import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import {
  type BalanceRow,
  BalancesPageView,
  type TransferRow,
} from "./BalancesPageView";
import { BALANCES_PAGE_COPY } from "./BalancesPageView.copy";

afterEach(cleanup);

function makeBalance(overrides: Partial<BalanceRow> = {}): BalanceRow {
  return {
    amountCents: 2500,
    currency: "USD",
    memberId: "member-alice",
    memberName: "Alice",
    ...overrides,
  } as BalanceRow;
}

function makeTransfer(overrides: Partial<TransferRow> = {}): TransferRow {
  return {
    amountCents: 1200,
    currency: "USD",
    fromMemberId: "member-bob",
    fromMemberName: "Bob",
    toMemberId: "member-alice",
    toMemberName: "Alice",
    transferId: "transfer-1",
    ...overrides,
  };
}

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
        balances={[makeBalance()]}
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

describe("BalancesPageView — balance list", () => {
  it("renders one row per balance", () => {
    const { container } = render(
      <BalancesPageView
        balances={[
          makeBalance({ memberId: "m-1", memberName: "Alice" }),
          makeBalance({ memberId: "m-2", memberName: "Bob" }),
          makeBalance({ memberId: "m-3", memberName: "Carol" }),
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
          makeBalance({ memberId: "m-1", memberName: "Alice" }),
          makeBalance({ memberId: "m-2", memberName: "Bob" }),
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
        balances={[makeBalance({ amountCents: 5000 })]}
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
        balances={[makeBalance({ amountCents: -3000 })]}
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
        balances={[makeBalance({ amountCents: 0 })]}
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
        balances={[makeBalance({ amountCents: -4250, currency: "USD" })]}
        transfers={[]}
        isLoading={false}
        isError={false}
      />,
    );
    expect(screen.getByText("$42.50")).toBeDefined();
  });
});

describe("BalancesPageView — transfers section", () => {
  it("renders one row per transfer", () => {
    const { container } = render(
      <BalancesPageView
        balances={[makeBalance()]}
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
        balances={[makeBalance()]}
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
        balances={[makeBalance()]}
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
        balances={[makeBalance({ amountCents: 0 })]}
        transfers={[]}
        isLoading={false}
        isError={false}
      />,
    );
    expect(screen.getByText(BALANCES_PAGE_COPY.transfersEmpty)).toBeDefined();
  });
});

describe("BalancesPageView — non-account member balance row shows * suffix and proxy attribution", () => {
  it("renders the member name with * suffix for a non-account balance row", () => {
    render(
      <BalancesPageView
        balances={[
          makeBalance({
            memberId: "m-sam",
            memberName: "Sam",
            nonAccount: true,
            proxyName: "Marco",
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
          makeBalance({
            memberId: "m-sam",
            memberName: "Sam",
            nonAccount: true,
            proxyName: "Marco",
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
        balances={[makeBalance({ memberId: "m-alice", memberName: "Alice" })]}
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

describe("BalancesPageView — transfer row shows proxy member names when present", () => {
  it("shows proxied member names in the from-member label of a transfer row", () => {
    render(
      <BalancesPageView
        balances={[makeBalance()]}
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
    expect(
      screen.getByText(
        BALANCES_PAGE_COPY.transferFromWithProxies("Marco", ["Ben", "Sam"]),
      ),
    ).toBeDefined();
  });

  it("does not render a parenthetical from-label when proxiedMemberNames is absent", () => {
    render(
      <BalancesPageView
        balances={[makeBalance()]}
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
    // No proxy notation — "Zara (" should not appear anywhere
    expect(screen.queryByText(/Zara \(/)).toBeNull();
  });
});

describe("BalancesPageView — mark transfer paid", () => {
  it("renders a Mark paid button for each transfer", () => {
    const { container } = render(
      <BalancesPageView
        balances={[makeBalance()]}
        transfers={[
          makeTransfer({ transferId: "t-1" }),
          makeTransfer({ transferId: "t-2" }),
        ]}
        isLoading={false}
        isError={false}
        onSettleTransfer={vi.fn()}
      />,
    );
    expect(
      container.querySelectorAll("[data-testid=mark-paid-button]").length,
    ).toBe(2);
  });

  it("calls onSettleTransfer with the transferId when Mark paid is clicked", () => {
    const onSettle = vi.fn();
    render(
      <BalancesPageView
        balances={[makeBalance()]}
        transfers={[makeTransfer({ transferId: "t-99" })]}
        isLoading={false}
        isError={false}
        onSettleTransfer={onSettle}
      />,
    );
    fireEvent.click(screen.getByTestId("mark-paid-button"));
    expect(onSettle).toHaveBeenCalledWith("t-99");
  });

  it("renders Mark paid button label from copy", () => {
    render(
      <BalancesPageView
        balances={[makeBalance()]}
        transfers={[makeTransfer()]}
        isLoading={false}
        isError={false}
        onSettleTransfer={vi.fn()}
      />,
    );
    expect(screen.getByTestId("mark-paid-button").textContent).toBe(
      BALANCES_PAGE_COPY.markPaidLabel,
    );
  });
});
