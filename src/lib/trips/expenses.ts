import { ExpenseSplitMethod } from "@/lib/types/expense";
import type { Expense } from "@/lib/types/expense";

interface WeightedParticipant {
  uid: string;
  weight: number;
}

function addToBalance(
  balances: Map<string, number>,
  uid: string,
  deltaCents: number,
) {
  balances.set(uid, (balances.get(uid) ?? 0) + deltaCents);
}

function toCents(amount: number): number {
  return Math.round(amount * 100);
}

function allocateProportionally(
  totalCents: number,
  participants: WeightedParticipant[],
): Map<string, number> {
  const result = new Map<string, number>();
  if (totalCents <= 0 || participants.length === 0) return result;

  const totalWeight = participants.reduce((sum, p) => sum + p.weight, 0);
  if (totalWeight <= 0) return result;

  const allocations = participants.map((participant, index) => {
    const raw = (totalCents * participant.weight) / totalWeight;
    const base = Math.floor(raw);
    return { base, index, remainder: raw - base, uid: participant.uid };
  });

  let allocated = allocations.reduce((sum, item) => sum + item.base, 0);
  allocations.sort((a, b) => {
    if (b.remainder !== a.remainder) return b.remainder - a.remainder;
    return a.index - b.index;
  });

  for (const item of allocations) {
    let amount = item.base;
    if (allocated < totalCents) {
      amount += 1;
      allocated += 1;
    }
    if (amount > 0) result.set(item.uid, amount);
  }

  return result;
}

function allocateCustomAmounts(expense: Expense): Map<string, number> {
  const result = new Map<string, number>();
  const amountMap = expense.participantAmounts;
  if (amountMap === undefined) return result;

  const preferredOrder =
    expense.participantUids.length > 0
      ? expense.participantUids
      : Object.keys(amountMap);

  for (const uid of preferredOrder) {
    const amount = amountMap[uid];
    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
      continue;
    }
    const cents = toCents(amount);
    if (cents > 0) result.set(uid, cents);
  }

  return result;
}

function allocateEvenSplit(
  expense: Expense,
  participantUids: string[],
): Map<string, number> {
  return allocateProportionally(
    toCents(expense.amount),
    participantUids.map((uid) => ({ uid, weight: 1 })),
  );
}

function allocateRiders(expense: Expense): Map<string, number> {
  const shareMap = expense.participantShares;
  if (shareMap === undefined) return new Map();

  const preferredOrder =
    expense.participantUids.length > 0
      ? expense.participantUids
      : Object.keys(shareMap);

  const weightedParticipants: WeightedParticipant[] = [];
  for (const uid of preferredOrder) {
    const share = shareMap[uid];
    if (typeof share !== "number" || !Number.isFinite(share) || share <= 0) {
      continue;
    }
    weightedParticipants.push({ uid, weight: share });
  }

  return allocateProportionally(toCents(expense.amount), weightedParticipants);
}

function allocateRsvp(expense: Expense): Map<string, number> {
  const confirmed = new Set(expense.confirmedParticipantUids ?? []);
  const confirmedParticipants = expense.participantUids.filter((uid) =>
    confirmed.has(uid),
  );
  return allocateEvenSplit(expense, confirmedParticipants);
}

function computeExpenseDebits(expense: Expense): Map<string, number> {
  if (expense.splitMethod === ExpenseSplitMethod.Custom) {
    return allocateCustomAmounts(expense);
  }
  if (expense.splitMethod === ExpenseSplitMethod.Riders) {
    return allocateRiders(expense);
  }
  if (expense.splitMethod === ExpenseSplitMethod.Rsvp) {
    return allocateRsvp(expense);
  }
  return allocateEvenSplit(expense, expense.participantUids);
}

/**
 * Computes net balances in cents from expenses.
 * Positive = member is owed money, negative = member owes money.
 */
export function computeNetBalances(expenses: Expense[]): Map<string, number> {
  const balances = new Map<string, number>();

  for (const expense of expenses) {
    const debits = computeExpenseDebits(expense);
    const totalDebitCents = [...debits.values()].reduce(
      (sum, cents) => sum + cents,
      0,
    );
    if (totalDebitCents <= 0) continue;

    addToBalance(balances, expense.payerUid, totalDebitCents);
    for (const [uid, debitCents] of debits) {
      addToBalance(balances, uid, -debitCents);
    }
  }

  return balances;
}
