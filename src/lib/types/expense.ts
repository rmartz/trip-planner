export enum ExpenseCategory {
  Activity = "activity",
  Food = "food",
  Lodging = "lodging",
  Other = "other",
  Transport = "transport",
}

export enum ExpenseLinkedEntityType {
  Activity = "activity",
  Leg = "leg",
  Stop = "stop",
}

export enum ExpenseSplitMethod {
  Custom = "custom",
  Even = "even",
  Riders = "riders",
  Rsvp = "rsvp",
}

export interface ExpenseLinkedEntity {
  type: ExpenseLinkedEntityType;
  entityId: string;
  label: string;
}

export interface Expense {
  expenseId: string;
  tripId: string;
  name: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  payerUid: string;
  participantUids: string[];
  splitMethod: ExpenseSplitMethod;
  participantAmounts?: Record<string, number>;
  participantShares?: Record<string, number>;
  confirmedParticipantUids?: string[];
  linkedEntity?: ExpenseLinkedEntity;
}
