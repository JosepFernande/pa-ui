# Release and Publishing

## Purpose

Defines the technical flow that takes a change from `main` to a published npm
version: how `@pa-ui/*` packages are versioned, signed, and distributed. This is
the "why" companion to the `pa-ui-release` skill
(`skills/pa-ui-release/SKILL.md`), which owns the day-to-day operational
checklist and the historical record of three release bugs already found and
fixed — this document does not repeat that checklist, only the reasoning behind
the pipeline's shape. See also [CI/CD Pipeline](./ci-cd-pipeline.md) (the
`release.yml` workflow that runs this flow) and
[Contribution & PR Guidelines](./contribution-pr-code-review-guidelines.md)
(commits, changesets, branch process).

## Current Release Mode: Stable (Not Prerelease)

**Correction to the source material:** at the time of this migration,
`.changeset/pre.json` does not exist in the repo, and the four publishable
packages (`@pa-ui/core`, `@pa-ui/button`, `@pa-ui/input`, `@pa-ui/angular`) are
on real stable versions (verified: `@pa-ui/core` is `19.2.1` as of this writing)
with no `alpha`/`beta`/`next` dist-tag involved — installing any of them with a
bare `npm install @pa-ui/<pkg>` resolves the real `latest` stable version. The
repo previously ran in Changesets' prerelease (`pre`) mode, which is the
historical context the `pa-ui-release` skill still documents in detail
(including three release bugs found while in that mode) — but
`changeset pre exit` has since run, and `pre.json` is gone.

`release.yml` retains conditional branches for `.changeset/pre.json` (the
`alpha` dist-tag step, marking the GitHub Release as `prerelease`). Those
branches are dormant, not deleted, in case the project re-enters prerelease mode
for a specific future initiative — they do not currently execute.

<!-- TODO(verify): whether the project intends to ever re-enter
prerelease mode is a product decision, not something the code or workflow
history can confirm. -->

## npm Account & Scope Setup

Before any publish can happen, three things must be ready on the npm side.

### 1. npm organization

The `@pa-ui` npm scope needs an organization. Options:

- **Personal scope** — `npm login`, then
  `npm access set scope @pa-ui restricted`. Anyone with publish rights on the
  org can publish.
- **Team scope** — create an npm organization named `pa-ui`. Add members, assign
  the "Developer" role to anyone who can publish.

**Recommendation:** start with a personal scope, migrate to a team scope once a
second maintainer joins.

### 2. Two-Factor Authentication (2FA)

Required by npm to publish. Use an authenticator app, not SMS (npm is
deprecating SMS 2FA). CI does **not** need 2FA because it uses a different
mechanism (see Trusted Publishing below).

### 3. The `@pa-ui` scope

Already declared in each lib's `package.json` via `name: "@pa-ui/<lib>"`. The
very first version of each package must be published manually
(`npm login && npm publish --access public`, run once per package inside its
directory); every subsequent publish goes through CI.

## Trusted Publishing (OIDC) — the Modern Approach

The recommended mechanism for publishing from CI. Replaces long-lived npm tokens
with short-lived OIDC tokens, removing the biggest security risk in npm
publishing.

**How it works:** GitHub Actions generates a short-lived OIDC token per workflow
run; npm verifies it against a configured "trusted publisher" rule (matching
repo, workflow, and environment); if it matches, npm allows the publish; the
token expires in minutes, so there's no long-lived secret that can leak.

**Setup (one-time, by the maintainer):** in npm's package settings → Trusted
publishers → Add trusted publisher, with repository owner/name set to this repo,
workflow filename `release.yml`, and an optional GitHub Environment name for an
extra gate. Repeat per `@pa-ui/*` package, or configure org-wide if the scope
belongs to an org.

**Current state: still on a classic token, not OIDC.** `release.yml`'s
`permissions: id-token: write` is declared, but the actual
`npm publish "$dist_dir" --access public` step does not pass `--provenance`, and
CI authenticates via `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` (verified:
`NPM_TOKEN` exists in the repo's configured secrets). Trusted Publishing is a
migration target, not the current mechanism — no npm provenance attestation is
generated today despite the `id-token: write` permission being present.

## Changesets in Practice

The [Contribution guide](./contribution-pr-code-review-guidelines.md) and the
`pa-ui-release` skill cover the day-to-day changeset workflow (when to add one,
the CLI flow, bump types). This section covers the operational mechanics behind
it.

### Where changesets live

`.changeset/*.md` files at the repo root, one per change. A single change can
affect multiple packages.

### File format

```markdown
---
'@pa-ui/button': minor
---

Add the `size` input to the button component.
```

Frontmatter: one line per affected package with its SemVer bump type. In
practice, since all four packages (`@pa-ui/core`, `@pa-ui/button`,
`@pa-ui/input`, `@pa-ui/angular`) are in the `fixed` group in
`.changeset/config.json`, they all end up bumping the same version even if the
changeset only names one.

## Per-Lib Package Configuration

Each lib's `package.json` needs specific fields for npm publishing:

```json
{
  "name": "@pa-ui/button",
  "version": "0.1.0",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/JosepFernande/pa-ui.git",
    "directory": "libs/button"
  },
  "bugs": { "url": "https://github.com/JosepFernande/pa-ui/issues" },
  "homepage": "https://github.com/JosepFernande/pa-ui#readme",
  "publishConfig": { "access": "public" },
  "peerDependencies": {
    "@angular/common": "^19.2.0",
    "@angular/core": "^19.2.0"
  }
}
```

### Generated by ng-packagr

Most of this is auto-generated by ng-packagr when running `nx build <lib>`
(producing the package under `dist/libs/<lib>/`): `main`, `module`, `typings`,
entry points, `exports` (subpath exports for tree-shaking),
`sideEffects: false`, and `peerDependencies` copied from the source
`package.json`.

### How the README gets into the published package

`ng-packagr` does not copy `README.md` into `dist/` by default. Every lib's
`ng-package.json` declares it as an explicit asset:

```json
"assets": [{ "glob": "README.md", "input": ".", "output": "." }]
```

`@pa-ui/angular` (the umbrella package) does not use ng-packagr — its build is a
custom `nx:run-commands` copy in `project.json`, which explicitly copies
`README.md` to `dist/libs/pa-ui/README.md` and declares it as a build input so
the Nx cache invalidates correctly when it changes.

**No `package.json` in this repo uses a `files` field** — the mechanism above
(an explicit `assets` entry or a manual `cp`) is how extra files reach the
published tarball, not `files`.

## Release Flow (End to End)

```
1. Dev opens PR with code change + .changeset/<name>.md
   ↓
2. CI runs (lint, stylelint, test, build, audit; gga-review is advisory) — must pass
   ↓
3. PR approved and merged to main
   ↓
4. release.yml triggers on push to main (paths: libs/**, .changeset/**, package.json, package-lock.json)
   ↓
5. release.yml checks: are there new .changeset/*.md files?
   │
   ├─ NO  → clean exit, no publish
   │
   └─ YES → continue ↓
   ↓
6. `npx changeset version` — reads pending .changeset/*.md, bumps versions, generates CHANGELOG entries
   ↓
7. Opens a "chore(release): version packages" PR (peter-evans/create-pull-request) — does not commit directly to main
   ↓
8. That PR is reviewed and merged like any other → release.yml runs again, now with no pending changesets
   ↓
9. `npm audit` (advisory, non-blocking) + `npm run validate:packages` (blocking — fails the release if any dist/<lib>/package.json lost its entry points)
   ↓
10. Manual publish from `dist/libs/<lib>` (not `changeset publish`) — no npm provenance active today
   ↓
11. GitHub Release created (tag `release-v<version>`, body generated by hand in the step)
```

Total time from merge to npm: **1–3 minutes**.

## Version Sync Strategy: Fixed (Lockstep)

`@pa-ui` is a multi-package monorepo. `.changeset/config.json` declares
`"fixed": [["@pa-ui/core", "@pa-ui/button", "@pa-ui/input", "@pa-ui/angular"]]`
— all four packages bump together. A change in any one of them triggers a bump
of all four; confirmed in the real `package.json` files, which are all on the
exact same version.

**Pro:** simple, no version mismatch between packages. **Con:** noise for
consumers who only use one package and receive new versions with no relevant
changes for them.

Alternatives not used today: **independent versions** (each package with its own
version — Changesets' default without a `fixed`/`linked` group) and **grouped
versions** (family-based grouping via snapshot releases) — neither is how this
repo is configured.

## Dist Tags & Pre-Releases

npm uses dist tags to mark channels; the default is `latest`. For the repo's
current stable state, only `latest` is used. If the project re-enters prerelease
mode in the future, `release.yml`'s dormant branches would move a prerelease
dist-tag (e.g. `alpha`) forward instead — see "Current Release Mode" above and
the `pa-ui-release` skill for exactly how that logic behaved the last time it
was active (including why `changeset publish --tag <anything>` cannot be used in
`pre` mode at all).

## Rollback & Deprecation

Once a version is published, it cannot be unpublished after 72 hours (npm
policy).

- **Deprecate (preferred):**
  `npm deprecate @pa-ui/button@1.0.0 "Critical bug, upgrade to 1.0.1"` — marks
  the version deprecated; it stays downloadable but installers see a warning.
- **Unpublish (within 72 hours, never-installed only):**
  `npm unpublish @pa-ui/button@1.0.0 --force` — destructive, reserved for
  security incidents or genuinely broken releases. npm is deprecating
  `unpublish` in favor of `deprecate`.
- **Fix forward (always safe):** ship a patch release through the normal flow
  (fix, changeset, PR, merge, release) — the safest path for non-critical
  issues.

## CHANGELOG Generation

Changesets auto-generates `CHANGELOG.md` per package during `changeset version`:

```markdown
# @pa-ui/button

## 1.1.0

### Minor Changes

- Add the `size` input to the button component.
  ([#12](https://github.com/JosepFernande/pa-ui/pull/12))

### Patch Changes

- Updated dependencies:
  - @pa-ui/core@1.0.1
```

These are committed with the version bumps and shipped in the npm tarball.

## GitHub Releases

Implemented in `release.yml`'s "Create release tag" + "Create GitHub Release"
steps:

- **Tag:** `release-v<version>` — the real published version (all packages in a
  normal changesets release share one version; if they ever diverge, the first
  published package's version is used).
- **Title:** `pa-ui <version>`.
- **Body:** list of published packages + each one's matching CHANGELOG entry + a
  link to the full CHANGELOG. Built by hand in the step (not via
  `changesets/action`, which was never adopted).
- **Prerelease flag:** `true` only if `.changeset/pre.json` exists with
  `mode: "pre"` at release time (the exceptional case); `false` in the normal
  case, which is the repo's current state.
- Uses `softprops/action-gh-release@v3`.

## Security & Provenance

**npm provenance:** the `id-token: write` permission in `release.yml` enables
npm provenance — a cryptographic proof that a package was built from a specific
commit of this repo — but the publish step does not pass `--provenance`, so no
attestation is actually generated today despite the permission being present.
Adding the flag is the remaining step to make this real.

**2FA and Trusted Publishing:** see the sections above.

**Dependency audit before each release:**
`npm audit --omit=dev --audit-level=critical`, non-blocking
(`continue-on-error: true`) — an advisory unrelated to the change being
published must not kill the release. The exit code is recorded as a failed step
(visible in the run) but never blocks the publish; the JSON report is uploaded
as an artifact so the finding stays actionable. This runs only when the Release
PR merged with no pending changesets, right before the publish step.

## Rules of the Team (Enforced by CI)

- Every PR that modifies published code SHOULD include a changeset — this is a
  review-time convention, not a CI-enforced gate (no changeset-bot exists
  today).
- Never run `npm publish` from a local machine for this repo. The flow is 100%
  through `release.yml`. A local `npm whoami` isn't expected to be authenticated
  — that's not something to "fix" so you can publish by hand.
- Never publish on a Friday afternoon (or when the maintainer is away) — a soft
  rule, use judgment.
- Hotfixes follow the normal flow: branch, fix, changeset, PR, merge, release.
  No skipping steps.

## Reference

- `pa-ui-release` skill (`skills/pa-ui-release/SKILL.md`) — the operational
  checklist, the prerelease-mode mechanics (historical), and the three release
  bugs already found and fixed
- [CI/CD Pipeline](./ci-cd-pipeline.md) — the `release.yml` workflow in full
- [Contribution & PR Guidelines](./contribution-pr-code-review-guidelines.md) —
  when to add a changeset, commit conventions
- `.github/workflows/release.yml` — the real workflow
- `.changeset/config.json` — the `fixed` group configuration
