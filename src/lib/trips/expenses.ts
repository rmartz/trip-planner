import type { Expense } from "@/lib/types/expense";

/**
 * Computes per-user net balance across a list of expenses.
 *
 * For each expense, the payer is credited the full amount and each participant
 * is debited their equal share (even split). Any indivisible remainder cents are
 * distributed deterministically to the first participants in each expense's list.
 * Returns a Map from member UID to net balance in integer cents (positive = owed
 * to this member by others; negative = this member owes others).
 */
export function computeNetBalances(expenses: Expense[]): Map<string, number> {
  const balances = new Map<string, number>();

  function add(uid: string, delta: number) {
    balances.set(uid, (balances.get(uid) ?? 0) + delta);
  }

  for (const expense of expenses) {
    const { amount, payerUid, participantUids } = expense;

    // Work in integer cents to avoid floating-point drift.
    const amountCents = Math.round(amount * 100);

    // Credit the payer for the full amount they paid.
    add(payerUid, amountCents);

    // Debit each participant their equal share.
    if (participantUids.length > 0) {
      const n = participantUids.length;
      const baseShare = Math.floor(amountCents / n);
      const remainder = amountCents - baseShare * n;

      // Distribute any remainder cents deterministically to the first
      // `remainder` participants so that total debits equal total credits.
      for (let i = 0; i < n; i++) {
        const share = i < remainder ? baseShare + 1 : baseShare;
        add(participantUids[i]!, -share);
      }
    }
  }

  return balances;
}
