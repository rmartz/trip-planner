"use client";

import { BALANCES_PAGE_COPY } from "./BalancesPageView.copy";

const COPY = BALANCES_PAGE_COPY;

interface BaseBalanceRow {
  amountCents: number;
  currency: string;
  memberId: string;
  memberName: string;
}

type AccountBalanceRow = BaseBalanceRow & {
  nonAccount?: false;
  proxyName?: undefined;
};

type NonAccountBalanceRow = BaseBalanceRow & {
  nonAccount: true;
  proxyName: string;
};

export type BalanceRow = AccountBalanceRow | NonAccountBalanceRow;

export interface TransferRow {
  amountCents: number;
  currency: string;
  fromMemberId: string;
  fromMemberName: string;
  toMemberId: string;
  toMemberName: string;
  transferId: string;
}

export interface BalancesPageViewProps {
  balances: BalanceRow[];
  isError: boolean;
  isLoading: boolean;
  onSettleTransfer?: (transferId: string) => void;
  transfers: TransferRow[];
}

function formatAmount(amountCents: number, currency: string): string {
  const amount = Math.abs(amountCents) / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

interface BalanceRowItemProps {
  balance: BalanceRow;
}

function BalanceRowItem({ balance }: BalanceRowItemProps) {
  const sign =
    balance.amountCents > 0
      ? "credited"
      : balance.amountCents < 0
        ? "owed"
        : "settled";
  const label =
    sign === "credited"
      ? COPY.netCreditedLabel
      : sign === "owed"
        ? COPY.netOwedLabel
        : COPY.netSettledLabel;
  const colorClass =
    sign === "credited"
      ? "text-emerald-600 dark:text-emerald-400"
      : sign === "owed"
        ? "text-amber-600 dark:text-amber-400"
        : "text-zinc-500 dark:text-zinc-400";

  return (
    <li
      data-testid="balance-row"
      className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
    >
      <span className="text-sm font-medium">{balance.memberName}</span>
      <span className={`text-sm ${colorClass}`}>
        <span className="mr-1 text-xs text-zinc-500 dark:text-zinc-400">
          {label}
        </span>
        <span className="font-mono tabular-nums">
          {formatAmount(balance.amountCents, balance.currency)}
        </span>
      </span>
    </li>
  );
}

interface TransferRowItemProps {
  onSettle?: (transferId: string) => void;
  transfer: TransferRow;
}

function TransferRowItem({ onSettle, transfer }: TransferRowItemProps) {
  return (
    <li
      data-testid="transfer-row"
      className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm">
          {transfer.fromMemberName} {COPY.transferConnector}{" "}
          {transfer.toMemberName}
        </span>
        <span className="font-mono text-sm tabular-nums">
          {formatAmount(transfer.amountCents, transfer.currency)}
        </span>
      </div>
      <button
        className="w-full rounded border border-zinc-300 py-1 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900"
        data-testid="mark-paid-button"
        onClick={() => onSettle?.(transfer.transferId)}
        type="button"
      >
        {COPY.markPaidLabel}
      </button>
    </li>
  );
}

export function BalancesPageView({
  balances,
  isError,
  isLoading,
  onSettleTransfer,
  transfers,
}: BalancesPageViewProps) {
  const showBalances = !isLoading && !isError && balances.length > 0;
  const showBalancesEmpty = !isLoading && !isError && balances.length === 0;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex flex-col gap-0.5 border-b px-4 py-3">
        <h1 className="text-lg font-semibold">{COPY.heading}</h1>
        <p className="font-mono text-xs text-muted-foreground">
          {COPY.headingSubtext}
        </p>
      </header>

      <main className="flex flex-1 flex-col gap-6 p-4">
        {isLoading && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {COPY.loadingText}
          </p>
        )}
        {!isLoading && isError && (
          <p className="text-sm text-red-500 dark:text-red-400">
            {COPY.errorText}
          </p>
        )}
        {showBalancesEmpty && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {COPY.emptyText}
          </p>
        )}
        {showBalances && (
          <section aria-labelledby="balances-heading">
            <h2
              id="balances-heading"
              className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300"
            >
              {COPY.balancesHeading}
            </h2>
            <ul data-testid="balance-list" className="flex flex-col gap-2">
              {balances.map((b) => (
                <BalanceRowItem key={b.memberId} balance={b} />
              ))}
            </ul>
          </section>
        )}
        {showBalances && (
          <section aria-labelledby="transfers-heading">
            <h2
              id="transfers-heading"
              className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300"
            >
              {COPY.transfersHeading}
            </h2>
            {transfers.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {COPY.transfersEmpty}
              </p>
            ) : (
              <ul data-testid="transfer-list" className="flex flex-col gap-2">
                {transfers.map((t) => (
                  <TransferRowItem
                    key={t.transferId}
                    onSettle={onSettleTransfer}
                    transfer={t}
                  />
                ))}
              </ul>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
