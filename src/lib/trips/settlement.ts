export interface SettlementTransfer {
  amount: number;
  fromUid: string;
  toUid: string;
}

const EPSILON = 0.001;

/**
 * Computes the minimum set of person-to-person transfers needed to zero all
 * net balances using a greedy algorithm.
 *
 * The input map contains each member's net balance in any consistent currency
 * unit (positive = owed money, negative = owes money). The returned transfers
 * use the same unit for `amount`.
 */
export function minimizeTransfers(
  balances: Map<string, number>,
): SettlementTransfer[] {
  const creditors: { uid: string; balance: number }[] = [];
  const debtors: { uid: string; balance: number }[] = [];

  for (const [uid, balance] of balances) {
    if (balance > EPSILON) {
      creditors.push({ uid, balance });
    } else if (balance < -EPSILON) {
      debtors.push({ uid, balance });
    }
  }

  // Sort creditors descending (largest credit first)
  creditors.sort((a, b) => b.balance - a.balance);
  // Sort debtors ascending (largest absolute debt first, i.e. most negative first)
  debtors.sort((a, b) => a.balance - b.balance);

  const transfers: SettlementTransfer[] = [];
  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci];
    const debtor = debtors[di];

    if (creditor === undefined || debtor === undefined) break;

    const amount = Math.min(creditor.balance, -debtor.balance);
    transfers.push({ amount, fromUid: debtor.uid, toUid: creditor.uid });

    creditor.balance -= amount;
    debtor.balance += amount;

    if (creditor.balance < EPSILON) ci++;
    if (-debtor.balance < EPSILON) di++;
  }

  return transfers;
}
