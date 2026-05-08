export const REMOVE_LEG_CONFIRM_MODAL_COPY = {
  title: "Remove leg?",
  bodyNoGuests: "This leg will be archived and can be restored later.",
  bodyWithGuests: (count: number) =>
    `${String(count)} ${count === 1 ? "guest has" : "guests have"} logistics entries for this leg. The leg will be archived and can be restored later.`,
  affectedGuestsLabel: "Affected guests",
  confirmButton: "Remove leg",
  cancelButton: "Cancel",
} as const;
