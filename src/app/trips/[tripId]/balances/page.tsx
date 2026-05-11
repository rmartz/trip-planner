"use client";

import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/nav/AppShell";
import { useTrip } from "@/hooks/use-trip";
import {
  BalancesPageView,
  type BalanceRow,
  type TransferRow,
} from "./BalancesPageView";
import { BALANCES_PAGE_COPY } from "./BalancesPageView.copy";

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

const STUB_TRANSFERS: TransferRow[] = [
  {
    amountCents: 6000,
    currency: "USD",
    fromMemberId: "member-bob",
    fromMemberName: "Bob",
    toMemberId: "member-alice",
    toMemberName: "Alice",
    transferId: "stub-transfer-1",
  },
  {
    amountCents: 2500,
    currency: "USD",
    fromMemberId: "member-carol",
    fromMemberName: "Carol",
    toMemberId: "member-alice",
    toMemberName: "Alice",
    transferId: "stub-transfer-2",
  },
];

export default function BalancesPage() {
  const params = useParams<{ tripId: string }>();
  const router = useRouter();
  const tripId = params.tripId;

  const { data: trip, isLoading, isError } = useTrip(tripId);

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
        transfers={STUB_TRANSFERS}
        isLoading={isLoading}
        isError={isError}
      />
    </AppShell>
  );
}
