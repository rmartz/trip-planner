import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Expense } from "@/lib/types/expense";
import { ExpenseCategory, ExpenseSplitMethod } from "@/lib/types/expense";
import { TripRole } from "@/lib/types/trip";

vi.mock("@/lib/firebase/admin", () => ({ getAdminFirestore: vi.fn() }));
vi.mock("@/lib/firebase/schema/expense", () => ({
  expenseToFirebase: vi.fn(),
  firebaseToExpense: vi.fn(),
}));

import { getAdminFirestore } from "@/lib/firebase/admin";
import {
  expenseToFirebase,
  firebaseToExpense,
} from "@/lib/firebase/schema/expense";
import {
  addExpense,
  getExpenseMemberRole,
  getExpensesForTrip,
} from "./expenses";

function makeExpense(overrides: Partial<Expense> = {}): Expense {
  return {
    amount: 42.5,
    category: ExpenseCategory.Food,
    currency: "USD",
    expenseId: "exp-1",
    name: "Dinner",
    participantUids: ["uid-alice", "uid-bob"],
    payerUid: "uid-alice",
    splitMethod: ExpenseSplitMethod.Even,
    tripId: "trip-1",
    ...overrides,
  };
}

interface MockQuerySnapshot {
  empty: boolean;
  docs: MockDocSnapshot[];
}

interface MockDocSnapshot {
  id: string;
  exists: boolean;
  data: () => Record<string, unknown> | undefined;
}

describe("getExpenseMemberRole", () => {
  const memberDocGet = vi.fn();
  const membersDoc = vi.fn();
  const membersCollection = vi.fn();
  const tripDoc = vi.fn();
  const tripsCollection = vi.fn();
  const mockDb = { collection: tripsCollection };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAdminFirestore).mockReturnValue(
      mockDb as unknown as ReturnType<typeof getAdminFirestore>,
    );
    tripsCollection.mockReturnValue({ doc: tripDoc });
    tripDoc.mockReturnValue({ collection: membersCollection });
    membersCollection.mockReturnValue({ doc: membersDoc });
    membersDoc.mockReturnValue({ get: memberDocGet });
  });

  it("returns the stored role when the membership document has a role", async () => {
    memberDocGet.mockResolvedValue({
      exists: true,
      data: () => ({ role: TripRole.Planner }),
    });

    const role = await getExpenseMemberRole("uid-1", "trip-1");

    expect(role).toBe(TripRole.Planner);
  });

  it("defaults missing role to guest for legacy membership documents", async () => {
    memberDocGet.mockResolvedValue({
      exists: true,
      data: () => ({}),
    });

    const role = await getExpenseMemberRole("uid-1", "trip-1");

    expect(role).toBe(TripRole.Guest);
  });

  it("returns null when no membership document exists", async () => {
    memberDocGet.mockResolvedValue({
      exists: false,
      data: () => undefined,
    });

    const role = await getExpenseMemberRole("uid-1", "trip-1");

    expect(role).toBeNull();
  });
});

describe("getExpensesForTrip", () => {
  const orderBy = vi.fn();
  const get = vi.fn();
  const expensesCollection = vi.fn();
  const tripDoc = vi.fn();
  const tripsCollection = vi.fn();

  const mockDb = { collection: tripsCollection };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAdminFirestore).mockReturnValue(
      mockDb as unknown as ReturnType<typeof getAdminFirestore>,
    );
    tripsCollection.mockReturnValue({ doc: tripDoc });
    tripDoc.mockReturnValue({ collection: expensesCollection });
    expensesCollection.mockReturnValue({ orderBy });
    orderBy.mockReturnValue({ get });
  });

  it("queries the expenses subcollection ordered by createdAt", async () => {
    get.mockResolvedValue({
      empty: true,
      docs: [],
    } satisfies MockQuerySnapshot);

    await getExpensesForTrip("trip-abc");

    expect(tripsCollection).toHaveBeenCalledWith("trips");
    expect(tripDoc).toHaveBeenCalledWith("trip-abc");
    expect(expensesCollection).toHaveBeenCalledWith("expenses");
    expect(orderBy).toHaveBeenCalledWith("createdAt", "desc");
  });

  it("maps each document through firebaseToExpense", async () => {
    const docs: MockDocSnapshot[] = [
      { id: "exp-1", exists: true, data: () => ({ name: "Lunch" }) },
      { id: "exp-2", exists: true, data: () => ({ name: "Taxi" }) },
    ];
    get.mockResolvedValue({ empty: false, docs } satisfies MockQuerySnapshot);
    vi.mocked(firebaseToExpense).mockReturnValue(
      makeExpense({ expenseId: "exp-1" }),
    );

    const expenses = await getExpensesForTrip("trip-abc");

    expect(firebaseToExpense).toHaveBeenCalledTimes(2);
    expect(firebaseToExpense).toHaveBeenCalledWith("exp-1", "trip-abc", {
      name: "Lunch",
    });
    expect(expenses).toHaveLength(2);
  });

  it("returns empty array when there are no expenses", async () => {
    get.mockResolvedValue({
      empty: true,
      docs: [],
    } satisfies MockQuerySnapshot);

    const expenses = await getExpensesForTrip("trip-abc");

    expect(expenses).toEqual([]);
  });
});

describe("addExpense", () => {
  const memberDocGet = vi.fn();
  const expenseDocSet = vi.fn();
  const expenseDocRef = { id: "new-exp-id", set: expenseDocSet };
  const expensesDocFn = vi.fn(() => expenseDocRef);
  const expensesFn = vi.fn();
  const tripDocRef = { collection: vi.fn() };
  const tripsCollection = vi.fn(() => ({ doc: vi.fn(() => tripDocRef) }));
  const mockDb = {
    collection: tripsCollection,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAdminFirestore).mockReturnValue(
      mockDb as unknown as ReturnType<typeof getAdminFirestore>,
    );
    tripDocRef.collection.mockImplementation((name: string) => {
      if (name === "members")
        return { doc: vi.fn(() => ({ get: memberDocGet })) };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      if (name === "expenses") return expensesFn();
      return {};
    });
    expensesFn.mockReturnValue({ doc: expensesDocFn });
    vi.mocked(expenseToFirebase).mockReturnValue({
      amount: 42.5,
      category: ExpenseCategory.Food,
      currency: "USD",
      name: "Dinner",
      participantUids: ["uid-alice"],
      payerUid: "uid-alice",
      splitMethod: ExpenseSplitMethod.Even,
    });
  });

  it("throws when the user is not a member of the trip", async () => {
    memberDocGet.mockResolvedValue({ exists: false, data: () => undefined });

    await expect(
      addExpense("uid-stranger", "trip-1", {
        amount: 42.5,
        category: ExpenseCategory.Food,
        currency: "USD",
        name: "Dinner",
        participantUids: ["uid-alice"],
        payerUid: "uid-alice",
        splitMethod: ExpenseSplitMethod.Even,
      }),
    ).rejects.toThrow("Only trip members can add expenses");
  });

  it("creates an expense and returns its id", async () => {
    memberDocGet.mockResolvedValue({
      exists: true,
      data: () => ({ role: "guest" }),
    });
    expenseDocSet.mockResolvedValue(undefined);

    const expenseId = await addExpense("uid-alice", "trip-1", {
      amount: 42.5,
      category: ExpenseCategory.Food,
      currency: "USD",
      name: "Dinner",
      participantUids: ["uid-alice"],
      payerUid: "uid-alice",
      splitMethod: ExpenseSplitMethod.Even,
    });

    expect(expenseId).toBe("new-exp-id");
    expect(expenseDocSet).toHaveBeenCalledTimes(1);
  });

  it("delegates serialization to expenseToFirebase", async () => {
    memberDocGet.mockResolvedValue({
      exists: true,
      data: () => ({ role: "guest" }),
    });
    expenseDocSet.mockResolvedValue(undefined);

    const input = {
      amount: 42.5,
      category: ExpenseCategory.Food,
      currency: "USD",
      name: "Dinner",
      participantUids: ["uid-alice"],
      payerUid: "uid-alice",
      splitMethod: ExpenseSplitMethod.Even,
    };

    await addExpense("uid-alice", "trip-1", input);

    expect(expenseToFirebase).toHaveBeenCalledWith(input);
  });

  it("includes a createdAt timestamp in the written document", async () => {
    memberDocGet.mockResolvedValue({
      exists: true,
      data: () => ({ role: "guest" }),
    });
    expenseDocSet.mockResolvedValue(undefined);

    await addExpense("uid-alice", "trip-1", {
      amount: 42.5,
      category: ExpenseCategory.Food,
      currency: "USD",
      name: "Dinner",
      participantUids: ["uid-alice"],
      payerUid: "uid-alice",
      splitMethod: ExpenseSplitMethod.Even,
    });

    expect(expenseDocSet).toHaveBeenCalledWith(
      expect.objectContaining({ createdAt: expect.any(Date) }),
    );
  });
});
