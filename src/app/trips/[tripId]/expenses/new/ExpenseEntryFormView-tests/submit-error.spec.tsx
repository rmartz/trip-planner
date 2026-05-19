import { describe, it } from "vitest";

// The submitError prop was removed from ExpenseEntryFormView in the PR #249 API
// update. Error display for submission failures is now handled at the page level.
describe("ExpenseEntryFormView — submitError", () => {
  it("submitError prop no longer exists; errors are surfaced at the page level", () => {
    // No assertions needed — this file is kept as a tombstone until cleaned up.
  });
});
