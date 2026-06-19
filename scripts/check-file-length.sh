#!/usr/bin/env bash
# Check TypeScript file line counts against project limits.
#
# Usage:
#   check-file-length.sh --staged          # pre-commit: check staged files only
#   check-file-length.sh --base <ref>      # CI: check files changed vs <ref>
#
# Thresholds (from CLAUDE.md — 2× the recommended max):
#   Source files: recommended max ~200 lines → fails at 400+
#   Test files:   recommended max ~300 lines → fails at 600+

SOURCE_LIMIT=400
TEST_LIMIT=600

if [ "$1" = "--staged" ]; then
  file_list=$(git diff --cached --name-only)
elif [ "$1" = "--base" ] && [ -n "$2" ]; then
  file_list=$(git diff --name-only "$2...HEAD")
else
  echo "Usage: $0 --staged | --base <ref>" >&2
  exit 2
fi

failed=0

while IFS= read -r file; do
  [ -f "$file" ] || continue

  case "$file" in
    *.ts|*.tsx) ;;
    *) continue ;;
  esac

  case "$file" in
    *.spec.ts|*.spec.tsx|*.test.ts|*.test.tsx|*-tests/*.ts|*-tests/*.tsx)
      limit=$TEST_LIMIT
      kind="test"
      ;;
    *)
      limit=$SOURCE_LIMIT
      kind="source"
      ;;
  esac

  lines=$(wc -l < "$file")

  if [ "$lines" -ge "$limit" ]; then
    if [ "${GITHUB_ACTIONS}" = "true" ]; then
      echo "::error file=$file,title=File too long::$file — $lines lines ($kind limit: $limit)"
    else
      echo "ERROR: $file — $lines lines ($kind limit: $limit)"
    fi
    failed=1
  fi
done <<< "$file_list"

if [ "$failed" -ne 0 ]; then
  echo ""
  echo "One or more files exceed the maximum allowed line count."
  echo "  Source files: recommended max ~200 lines, fails at ${SOURCE_LIMIT}+"
  echo "  Test files:   recommended max ~300 lines, fails at ${TEST_LIMIT}+"
  echo "Split large files by logical concern before committing."
  exit 1
fi
