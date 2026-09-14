import { describe, expect, it } from "vitest";
// The audit logic is plain ESM (.mjs) so CI can run it with only Node built-ins
// and the `gh` CLI (no pnpm install). This spec imports that same pure module
// directly so the classification is verified under TypeScript tooling.
import { buildReport, groupOf } from "../../scripts/lib/dependabot-audit.mjs";
import type { PrLike } from "../../scripts/lib/dependabot-audit.mjs";

// Find the classified row for a Dependabot PR number.
function rowFor(dependabotPrs: PrLike[], otherPrs: PrLike[], number: number) {
  const row = buildReport(dependabotPrs, otherPrs).rows.find(
    (r) => r.number === number,
  );
  if (!row) throw new Error(`no row for #${number}`);
  return row;
}

describe("groupOf — named group titles", () => {
  it("reads the group named in an 'in the <x> group' title", () => {
    expect(groupOf("Bump the react group with 4 updates")).toBe("react");
    expect(
      groupOf("Bump typescript from 6.0.3 to 7.0.2 in the typescript group"),
    ).toBe("typescript");
  });
});

describe("groupOf — GitHub Actions bumps", () => {
  it("classifies an owner/repo bump as github-actions even with no group phrase", () => {
    expect(groupOf("Bump actions/checkout from 7.0.0 to 7.0.1")).toBe(
      "github-actions",
    );
  });
});

describe("groupOf — ungrouped single package", () => {
  it("classifies an individual npm bump as 'individual'", () => {
    expect(groupOf("Bump next from 16.2.10 to 16.2.11")).toBe("individual");
  });
});

describe("buildReport — clean merge", () => {
  it("marks a merged bump with no referencing fix as clean", () => {
    const row = rowFor(
      [
        {
          number: 10,
          title: "Bump next from 16.2.10 to 16.2.11",
          state: "MERGED",
        },
      ],
      [],
      10,
    );

    expect(row.outcome).toBe("clean");
  });
});

describe("buildReport — stuck vs pending open PRs", () => {
  it("marks an open bump with a failing check as stuck", () => {
    const row = rowFor(
      [
        {
          number: 11,
          title: "Bump typescript from 6.0.3 to 7.0.2 in the typescript group",
          state: "OPEN",
          statusCheckRollup: [{ conclusion: "FAILURE" }],
        },
      ],
      [],
      11,
    );

    expect(row.outcome).toBe("stuck");
  });

  it("marks an open bump with no failing check as pending", () => {
    const row = rowFor(
      [
        {
          number: 12,
          title: "Bump vite from 8.1.0 to 8.1.3",
          state: "OPEN",
          statusCheckRollup: [{ conclusion: "SUCCESS" }],
        },
      ],
      [],
      12,
    );

    expect(row.outcome).toBe("pending");
  });
});

describe("buildReport — supersede churn", () => {
  it("marks a closed, never-merged bump with no fix as churn", () => {
    const row = rowFor(
      [
        {
          number: 13,
          title: "Bump the dev-dependencies group with 17 updates",
          state: "CLOSED",
        },
      ],
      [],
      13,
    );

    expect(row.outcome).toBe("churn");
  });
});

describe("buildReport — needed-fix attribution", () => {
  it("marks a bump as needed-fix when a MERGED PR cites 'Dependabot #N'", () => {
    const row = rowFor(
      [
        {
          number: 14,
          title: "Bump firebase-admin from 13 to 14",
          state: "MERGED",
        },
      ],
      [{ number: 90, title: "Fix build for Dependabot #14", state: "MERGED" }],
      14,
    );

    expect(row.outcome).toBe("needed-fix");
    expect(row.fixes).toEqual([90]);
    expect(row.mechanics).toBe(false);
  });

  it("ignores a citing PR that has not merged", () => {
    const row = rowFor(
      [{ number: 15, title: "Bump firebase from 14 to 15", state: "MERGED" }],
      [{ number: 91, title: "WIP unblock Dependabot #15", state: "OPEN" }],
      15,
    );

    expect(row.outcome).toBe("clean");
  });
});

describe("buildReport — lockfile repair is flagged group-independent", () => {
  it("tags a needed-fix as mechanics when its only fix repaired lockfile corruption", () => {
    const row = rowFor(
      [
        {
          number: 16,
          title: "Bump the react group with 4 updates",
          state: "CLOSED",
        },
      ],
      [
        {
          number: 92,
          title: "Repair corrupt pnpm-lock after #16",
          state: "MERGED",
        },
      ],
      16,
    );

    expect(row.outcome).toBe("needed-fix");
    expect(row.mechanics).toBe(true);
  });
});
