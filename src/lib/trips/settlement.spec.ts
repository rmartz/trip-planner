import { describe, expect, it } from "vitest";
import { minimizeTransfers } from "./settlement";

function makeBalances(entries: [string, number][]): Map<string, number> {
  return new Map(entries);
}

describe("minimizeTransfers — empty input", () => {
  it("returns empty array for empty balances", () => {
    expect(minimizeTransfers(new Map())).toHaveLength(0);
  });

  it("returns empty array when all balances are zero", () => {
    const balances = makeBalances([
      ["uid-a", 0],
      ["uid-b", 0],
    ]);
    expect(minimizeTransfers(balances)).toHaveLength(0);
  });

  it("returns empty array when only one member has near-zero balance", () => {
    const balances = makeBalances([["uid-a", 0.0001]]);
    expect(minimizeTransfers(balances)).toHaveLength(0);
  });
});

describe("minimizeTransfers — single transfer", () => {
  it("produces one transfer when one person owes another", () => {
    const balances = makeBalances([
      ["uid-a", 100],
      ["uid-b", -100],
    ]);
    expect(minimizeTransfers(balances)).toHaveLength(1);
  });

  it("transfer goes from debtor to creditor", () => {
    const balances = makeBalances([
      ["uid-a", 100],
      ["uid-b", -100],
    ]);
    const [transfer] = minimizeTransfers(balances);
    expect(transfer?.fromUid).toBe("uid-b");
    expect(transfer?.toUid).toBe("uid-a");
  });

  it("transfer amount equals the debt", () => {
    const balances = makeBalances([
      ["uid-a", 100],
      ["uid-b", -100],
    ]);
    const [transfer] = minimizeTransfers(balances);
    expect(transfer?.amount).toBeCloseTo(100);
  });
});

describe("minimizeTransfers — partial match (creditor > debtor)", () => {
  it("produces one transfer when debtor owes less than creditor is owed", () => {
    const balances = makeBalances([
      ["uid-a", 100],
      ["uid-b", -60],
    ]);
    expect(minimizeTransfers(balances)).toHaveLength(1);
  });

  it("transfer amount equals the lesser of credit and debt", () => {
    const balances = makeBalances([
      ["uid-a", 100],
      ["uid-b", -60],
    ]);
    const [transfer] = minimizeTransfers(balances);
    expect(transfer?.amount).toBeCloseTo(60);
  });
});

describe("minimizeTransfers — minimizes transfer count", () => {
  it("1 creditor + 2 debtors produces 2 transfers", () => {
    const balances = makeBalances([
      ["uid-a", 90],
      ["uid-b", -60],
      ["uid-c", -30],
    ]);
    expect(minimizeTransfers(balances)).toHaveLength(2);
  });

  it("2 creditors + 1 debtor produces 2 transfers", () => {
    const balances = makeBalances([
      ["uid-a", 60],
      ["uid-b", 30],
      ["uid-c", -90],
    ]);
    expect(minimizeTransfers(balances)).toHaveLength(2);
  });

  it("equal-amount pairs each settle in 1 transfer", () => {
    const balances = makeBalances([
      ["uid-a", 50],
      ["uid-b", 50],
      ["uid-c", -50],
      ["uid-d", -50],
    ]);
    expect(minimizeTransfers(balances)).toHaveLength(2);
  });
});

describe("minimizeTransfers — correct from/to UIDs", () => {
  it("fromUid is the debtor and toUid is the creditor", () => {
    const balances = makeBalances([
      ["uid-creditor", 90],
      ["uid-debtor-a", -60],
      ["uid-debtor-b", -30],
    ]);
    const transfers = minimizeTransfers(balances);
    for (const t of transfers) {
      expect(t.toUid).toBe("uid-creditor");
    }
  });

  it("all transfer amounts are positive", () => {
    const balances = makeBalances([
      ["uid-a", 90],
      ["uid-b", -60],
      ["uid-c", -30],
    ]);
    for (const t of minimizeTransfers(balances)) {
      expect(t.amount).toBeGreaterThan(0);
    }
  });
});

describe("minimizeTransfers — zeroes all balances", () => {
  it("applying transfers zeroes the net balance of every member", () => {
    const balances = makeBalances([
      ["uid-a", 100],
      ["uid-b", 50],
      ["uid-c", -80],
      ["uid-d", -70],
    ]);
    const transfers = minimizeTransfers(balances);
    // fromUid pays (debt decreases → balance increases)
    // toUid receives (credit decreases → balance decreases)
    const net = new Map<string, number>(balances);
    for (const t of transfers) {
      net.set(t.fromUid, (net.get(t.fromUid) ?? 0) + t.amount);
      net.set(t.toUid, (net.get(t.toUid) ?? 0) - t.amount);
    }
    for (const [, balance] of net) {
      expect(balance).toBeCloseTo(0);
    }
  });
});

describe("minimizeTransfers — floating-point amounts", () => {
  it("handles fractional amounts from even splits", () => {
    // $10 split 3 ways: payer nets +6.666..., each other owes -3.333...
    const balances = makeBalances([
      ["uid-a", 6.666666666666667],
      ["uid-b", -3.3333333333333335],
      ["uid-c", -3.3333333333333335],
    ]);
    const transfers = minimizeTransfers(balances);
    expect(transfers).toHaveLength(2);
    for (const t of transfers) {
      expect(t.amount).toBeGreaterThan(0);
    }
  });
});
