# Scripts

Executable helpers in `scripts/` and the zero-dependency CI validators that guard
the repo's conventions. Return here from the
[documentation index](../index.md).

- [check-package-pins](check-package-pins.md) — enforce full
  `major.minor.patch` dependency pins in `package.json`.
- [dependabot-audit](dependabot-audit.md) — classify every Dependabot PR's
  outcome and report per-group intervention rates.
- [validate-config](validate-config.md) — validate config against
  `deployment/schema.yml`.
- [migrate-member-uids](migrate-member-uids.md) — backfill the `memberUids`
  array on trip documents.
- [backfill-transport-gap-count](backfill-transport-gap-count.md) — backfill the
  computed `transportGapCount` field on trip documents.
- [seed-test-profiles](seed-test-profiles.md) — idempotent seeder for the
  synthetic debug-auth profiles in the staging Firebase project.
- [vercel-ignore-build](vercel-ignore-build.md) — Vercel Ignored Build Step gate
  that deploys previews only for `feat:`/`fix:` PRs.
