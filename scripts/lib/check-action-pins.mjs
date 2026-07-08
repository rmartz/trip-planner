// Pure, dependency-free validation for the "SHA-pin GitHub Actions" rule
// enforced by the Action pins CI check. Given the text of a workflow or
// composite-action YAML file, it returns the offending `uses:` lines: external
// actions that are not pinned to a full 40-character commit SHA with a trailing
// `# <version>` comment.
//
// The rule (see CLAUDE.md "GitHub Actions pins"): every third-party action must
// be pinned to the immutable commit SHA its tag resolves to — e.g.
// `uses: actions/checkout@9c091bb… # v7.0.0` — never a mutable tag/branch. A
// re-pointed upstream tag then cannot inject code into our CI. The trailing
// `# <version>` comment is what lets Dependabot keep the SHA updated, so it is
// required too.
//
// Local composite actions (`./…`, `../…`) are in-repo, not mutable external
// refs, so they are skipped. `docker://` refs are out of scope for this check.

const SHA = /^[0-9a-f]{40}$/;
// Capture the `uses:` value and an optional trailing `# comment`. The value is
// everything up to whitespace; the comment (if any) follows ` # `.
const USES_LINE = /^\s*-?\s*uses:\s*(\S+)(?:\s+#\s*(.*\S))?\s*$/;

function isLocalOrDocker(ref) {
  return (
    ref.startsWith("./") || ref.startsWith("../") || ref.startsWith("docker://")
  );
}

// Given the text of one YAML file, returns the offenders as
// `{ line, uses, reason }` records (line is 1-indexed).
export function findUnpinnedActionsInText(content) {
  const offenders = [];

  content.split("\n").forEach((line, index) => {
    const match = USES_LINE.exec(line);
    if (!match) return;

    const ref = match[1];
    const comment = match[2];
    if (isLocalOrDocker(ref)) return;

    const at = ref.lastIndexOf("@");
    if (at === -1) {
      offenders.push({
        line: index + 1,
        uses: ref,
        reason:
          "external action is not pinned — add `@<40-char commit SHA> # <version>`",
      });
      return;
    }

    const sha = ref.slice(at + 1);
    if (!SHA.test(sha)) {
      offenders.push({
        line: index + 1,
        uses: ref,
        reason:
          "pinned to a tag/branch/short ref — pin to the full 40-character commit SHA the tag resolves to",
      });
      return;
    }

    if (!comment) {
      offenders.push({
        line: index + 1,
        uses: ref,
        reason:
          "SHA-pinned but missing a trailing `# <version>` comment (Dependabot needs it to track/update the pin)",
      });
    }
  });

  return offenders;
}
