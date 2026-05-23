import type { Expense } from "@/lib/types/expense";

/**
 * Computes per-user net balance across a list of expenses.
 *
 * For each expense, the payer is credited the full amount and each participant
 * is debited their equal share (even split). Returns a Map from member UID to
 * net balance in the same currency unit as `Expense.amount` (positive = owed to
 * this member by others; negative = this member owes others).
 */
export function computeNetBalances(expenses: Expense[]): Map<string, number> {
  const balances = new Map<string, number>();

  function add(uid: string, delta: number) {
    balances.set(uid, (balances.get(uid) ?? 0) + delta);
  }

  for (const expense of expenses) {
    const { amount, payerUid, participantUids } = expense;

    // Credit the payer for the full amount they paid.
    add(payerUid, amount);

    // Debit each participant their equal share.
    if (participantUids.length > 0) {
      const share = amount / participantUids.length;
      for (const uid of participantUids) {
        add(uid, -share);
      }
    }
  }

  return balances;
}
