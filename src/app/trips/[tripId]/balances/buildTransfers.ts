import { minimizeTransfers } from "@/lib/trips/settlement";
import type { BalanceRow, TransferRow } from "./BalancesPageView";

export function buildTransfers(
  balances: BalanceRow[],
  settledIds: Set<string>,
): TransferRow[] {
  const currency = balances[0]?.currency ?? "USD";
  const memberNameByUid = new Map(
    balances.map((b) => [b.memberId, b.memberName]),
  );
  const balanceCents = new Map(
    balances.map((b) => [b.memberId, b.amountCents]),
  );
  return minimizeTransfers(balanceCents)
    .map((t) => ({
      amountCents: t.amount,
      currency,
      fromMemberId: t.fromUid,
      fromMemberName: memberNameByUid.get(t.fromUid) ?? t.fromUid,
      toMemberId: t.toUid,
      toMemberName: memberNameByUid.get(t.toUid) ?? t.toUid,
      transferId: `${t.fromUid}-${t.toUid}-${String(t.amount)}`,
    }))
    .filter((t) => !settledIds.has(t.transferId));
}
