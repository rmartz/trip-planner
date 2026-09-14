// Type declarations for the plain-ESM dependabot-audit module so the TypeScript
// spec (src/ci/dependabot-audit.spec.ts) can import it under strict type
// checking. Keep in sync with dependabot-audit.mjs.

export interface CheckLike {
  conclusion?: string;
  state?: string;
}

export interface PrLike {
  number: number;
  title: string;
  state: string;
  body?: string;
  author?: { login?: string };
  statusCheckRollup?: CheckLike[];
}

export type Outcome = "clean" | "needed-fix" | "stuck" | "pending" | "churn";

export interface AuditRow {
  number: number;
  title: string;
  group: string;
  outcome: Outcome;
  fixes: number[];
  mechanics: boolean;
}

export interface GroupBucket {
  clean: number;
  "needed-fix": number;
  stuck: number;
  pending: number;
  churn: number;
  mechanics: number;
}

export interface AuditReport {
  rows: AuditRow[];
  groups: Map<string, GroupBucket>;
}

export interface ParsedArgs {
  repo?: string;
  out?: string;
}

export function groupOf(title: string): string;

export function buildReport(
  dependabotPrs: PrLike[],
  otherPrs: PrLike[],
): AuditReport;

export function renderMarkdown(report: AuditReport, repo: string): string;

export function parseArgs(argv: string[]): ParsedArgs;
