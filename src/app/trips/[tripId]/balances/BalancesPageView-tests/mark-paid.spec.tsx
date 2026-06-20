import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { BalancesPageView } from "../BalancesPageView";
import { BALANCES_PAGE_COPY } from "../BalancesPageView.copy";
import { makeAccountBalance, makeTransfer } from "./fixtures";

afterEach(cleanup);

describe("BalancesPageView — mark transfer paid", () => {
  it("renders a Mark paid button for each transfer", () => {
    const { container } = render(
      <BalancesPageView
        balances={[makeAccountBalance()]}
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
        balances={[makeAccountBalance()]}
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
        balances={[makeAccountBalance()]}
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
