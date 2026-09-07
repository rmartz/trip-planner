// Pure, dependency-free validation for the agent directive-file convention
// enforced by the Agent directive files CI check.
//
// The convention (see AGENTS.md "Agent Directive Files"):
//   1. All directives live in AGENTS.md (the single source of truth).
//   2. Every AGENTS.md has a companion CLAUDE.md in the same directory, and
//      every CLAUDE.md has a companion AGENTS.md in the same directory.
//   3. Every CLAUDE.md is a bare wrapper whose only content is the Claude Code
//      import line `@AGENTS.md` — no directives, no other text, no symlinks.
//
// The filesystem walk lives in the CLI wrapper (scripts/check-agents-md.mjs);
// this module holds the pure decision logic so it can be unit-tested from
// src/ci/check-agents-md.spec.ts without touching disk.

// The exact content a CLAUDE.md wrapper must import.
export const IMPORT_LINE = "@AGENTS.md";

// Returns an error string when `content` is not a bare `@AGENTS.md` wrapper, or
// undefined when it is compliant. Blank lines (including a trailing newline) are
// ignored; any other meaningful line — or the absence of the import line — is a
// violation.
export function wrapperError(content) {
  const meaningfulLines = content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (meaningfulLines.length === 1 && meaningfulLines[0] === IMPORT_LINE) {
    return undefined;
  }
  return `CLAUDE.md must contain only the bare import line \`${IMPORT_LINE}\`, but found: ${JSON.stringify(meaningfulLines)}`;
}

// Given a directory descriptor, returns the convention violations for that
// directory as human-readable messages (without a path prefix). `claude` is
// present exactly when `hasClaude` is true and carries how the CLAUDE.md was
// resolved on disk: a symlink, a non-regular file, or a real file with content.
export function directoryViolations({ hasAgents, hasClaude, claude }) {
  const violations = [];
  if (hasAgents && !hasClaude) {
    violations.push("AGENTS.md has no companion CLAUDE.md");
  }
  if (hasClaude && !hasAgents) {
    violations.push("CLAUDE.md has no companion AGENTS.md");
  }
  if (hasClaude && claude) {
    if (claude.symlink) {
      violations.push(
        "CLAUDE.md is a symlink; it must be a real file containing only `@AGENTS.md`",
      );
    } else if (!claude.file) {
      violations.push(
        "CLAUDE.md is not a regular file (e.g. a directory); it must be a real file containing only `@AGENTS.md`",
      );
    } else {
      const error = wrapperError(claude.content);
      if (error) violations.push(error);
    }
  }
  return violations;
}
