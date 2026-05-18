import type {
  ExpenseEntryLinkedEntityOption,
  ExpenseEntryMemberOption,
} from "../ExpenseEntryFormView";

function makeMember(
  overrides: Partial<ExpenseEntryMemberOption> = {},
): ExpenseEntryMemberOption {
  return {
    memberId: "member-alice",
    name: "Alice",
    ...overrides,
  };
}

function makeLinkedEntity(
  overrides: Partial<ExpenseEntryLinkedEntityOption> = {},
): ExpenseEntryLinkedEntityOption {
  return {
    entityId: "stop-1",
    label: "Paris — Day 2",
    ...overrides,
  };
}

export const DEFAULT_MEMBERS: ExpenseEntryMemberOption[] = [
  makeMember({ memberId: "member-alice", name: "Alice" }),
  makeMember({ memberId: "member-bob", name: "Bob" }),
  makeMember({ memberId: "member-carol", name: "Carol" }),
];

export const DEFAULT_LINKED: ExpenseEntryLinkedEntityOption[] = [
  makeLinkedEntity({ entityId: "stop-paris", label: "Paris stop" }),
  makeLinkedEntity({ entityId: "lodging-1", label: "Lyon hotel" }),
];
