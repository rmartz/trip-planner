#!/usr/bin/env bash
# Block commits/merges that leave behind merge-conflict markers.
#
# Usage:
#   check-conflict-markers.sh --staged       # scan staged content (pre-commit)
#   check-conflict-markers.sh --base <ref>   # scan files changed vs <ref> (CI)
#
# Full-triple rule: a file is flagged only when it contains an "angle" marker —
# a line starting with seven `<` or seven `>` (`<<<<<<< HEAD`, `>>>>>>> branch`).
# These never occur in normal source or Markdown. The separator (`=======`) and
# diff3-base (`|||||||`) lines are reported too, but only in a file that already
# has an angle marker — so a Markdown setext underline or a `=======` divider is
# never a false positive.
#
# Bypass: `git commit --no-verify` (git-native) or ALLOW_CONFLICT_MARKERS=1.

set -euo pipefail

if [ "${ALLOW_CONFLICT_MARKERS:-}" = "1" ]; then
  exit 0
fi

ANGLE_RE='^(<<<<<<<|>>>>>>>)([[:space:]]|$)'
MID_RE='^(=======|\|\|\|\|\|\|\|)([[:space:]]|$)'

cached=""
if [ "${1:-}" = "--staged" ]; then
  cached="--cached"
  file_list=$(git diff --cached --name-only --diff-filter=ACMR)
elif [ "${1:-}" = "--base" ] && [ -n "${2:-}" ]; then
  file_list=$(git diff --name-only --diff-filter=ACMR "$2...HEAD")
else
  echo "Usage: $0 --staged | --base <ref>" >&2
  exit 2
fi

# No changed files → nothing to check.
[ -n "$file_list" ] || exit 0

# Build a pathspec array (bash 3 compatible — no mapfile).
files=()
while IFS= read -r f; do
  [ -n "$f" ] && files+=("$f")
done <<<"$file_list"

# -I skips binary files. git grep exits 1 on no match, which would trip `set -e`.
angle_hits=$(git grep $cached -I -n -E "$ANGLE_RE" -- "${files[@]}" || true)

# No angle markers → the separator/base lines alone do not count.
[ -n "$angle_hits" ] || exit 0

echo "ERROR: merge-conflict markers found:"
echo ""

printf '%s\n' "$angle_hits" | cut -d: -f1 | sort -u | while IFS= read -r file; do
  [ -n "$file" ] || continue
  git grep $cached -n -E "$ANGLE_RE|$MID_RE" -- "$file" | sed 's/^/  /'
done

echo ""
echo "Resolve the conflict and remove the markers before committing."
echo "To bypass intentionally: ALLOW_CONFLICT_MARKERS=1 git commit ..."
exit 1
