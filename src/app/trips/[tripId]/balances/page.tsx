"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/nav/AppShell";
import { useExpenses } from "@/hooks/use-expenses";
import { useTrip } from "@/hooks/use-trip";
import { useTripMembers } from "@/hooks/use-trip-members";
import { computeNetBalances } from "@/lib/trips/expenses";
import { type BalanceRow, BalancesPageView } from "./BalancesPageView";
import { BALANCES_PAGE_COPY } from "./BalancesPageView.copy";
import { buildTransfers } from "./buildTransfers";

export default function BalancesPage() {
  const params = useParams<{ tripId: string }>();
  const router = useRouter();
  const tripId = params.tripId;

  const {
    data: trip,
    isLoading: tripLoading,
    isError: tripError,
  } = useTrip(tripId);
  const {
    data: expenses,
    isLoading: expensesLoading,
    isError: expensesError,
  } = useExpenses(tripId);
  const {
    data: members,
    isLoading: membersLoading,
    isError: membersError,
  } = useTripMembers(tripId);

  const isLoading = tripLoading || expensesLoading || membersLoading;
  const isError = tripError || expensesError || membersError;

  const memberNameByUid = new Map(
    members?.map((m) => [m.uid, m.displayName ?? m.uid]) ?? [],
  );

  const netBalances = computeNetBalances(expenses ?? []);
  const balances: BalanceRow[] = Array.from(netBalances.entries())
    .map(([uid, amountCents]) => ({
      amountCents,
      currency: "USD",
      memberId: uid,
      memberName: memberNameByUid.get(uid) ?? uid,
    }))
    .sort((a, b) => b.amountCents - a.amountCents);

  const [settledIds, setSettledIds] = useState<Set<string>>(new Set());

  const transfers = buildTransfers(balances, settledIds);

  function handleSettle(transferId: string) {
    setSettledIds((prev) => new Set([...prev, transferId]));
  }

  return (
    <AppShell
      header={{
        variant: "drilled",
        title: trip?.name ?? BALANCES_PAGE_COPY.pageTitle,
        onBack: () => {
          router.push(`/trips/${tripId}`);
        },
      }}
    >
      <BalancesPageView
        balances={balances}
        isError={isError}
        isLoading={isLoading}
        onSettleTransfer={handleSettle}
        transfers={transfers}
      />
    </AppShell>
  );
}
