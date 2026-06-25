"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/nav/AppShell";
import { useTrip } from "@/hooks/use-trip";
import { type BalanceRow, BalancesPageView } from "./BalancesPageView";
import { BALANCES_PAGE_COPY } from "./BalancesPageView.copy";
import { buildTransfers } from "./buildTransfers";

const STUB_BALANCES: BalanceRow[] = [
  {
    amountCents: 8500,
    currency: "USD",
    memberId: "member-alice",
    memberName: "Alice",
  },
  {
    amountCents: -6000,
    currency: "USD",
    memberId: "member-bob",
    memberName: "Bob",
  },
  {
    amountCents: -2500,
    currency: "USD",
    memberId: "member-carol",
    memberName: "Carol",
  },
];

export default function BalancesPage() {
  const params = useParams<{ tripId: string }>();
  const router = useRouter();
  const tripId = params.tripId;

  const { data: trip, isLoading, isError } = useTrip(tripId);

  const [settledIds, setSettledIds] = useState<Set<string>>(new Set());

  const transfers = buildTransfers(STUB_BALANCES, settledIds);

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
        balances={STUB_BALANCES}
        isError={isError}
        isLoading={isLoading}
        onSettleTransfer={handleSettle}
        transfers={transfers}
      />
    </AppShell>
  );
}
