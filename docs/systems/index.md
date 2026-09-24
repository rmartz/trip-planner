# Systems

Cross-cutting subsystems that span several files. Return here from the
[documentation index](../index.md).

- [Deployment Config Pipeline](deployment-config.md) — how public config in
  `deployment/{env}.yml` is structured and validated against the schema.
- [Debug Auth (Staging/Preview Impersonation)](debug-auth.md) — the staging-only
  custom-token sign-in mode for synthetic profiles, and its defense-in-depth
  safety layers.
- [Storybook CI](storybook-ci.md) — how the gating Storybook test/build checks
  and the advisory per-PR screenshot gallery are delegated to the shared
  `rmartz/storybook-ci` reusable workflows, and the PAT the gallery needs.
- [memberUids Fan-Out Invariant](member-uids-fan-out.md) — how the denormalized
  `memberUids` array is kept in sync across every trip-scoped document on
  membership changes, and why it is a security requirement.
