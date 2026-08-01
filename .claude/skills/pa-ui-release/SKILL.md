---
name: pa-ui-release
description:
  'Trigger: hacer un release, publicar a npm, por qué no se publicó, trabajar
  con .changeset/, revisar el workflow release.yml. Checklist operativo para
  el pipeline de release de pa-ui en modo prerelease (alpha).'
license: MIT
metadata:
  author: JosepFernande
  version: '1.0'
  project: pa-ui
---

## Activation Contract

Load this skill before touching anything related to releasing or publishing
`pa-ui` packages: creating/reviewing a changeset, diagnosing why a package
didn't reach npm, or modifying `.github/workflows/release.yml`. The release
pipeline has non-obvious behavior in prerelease mode that has already caused
confusion twice — read this before assuming the workflow is broken or that a
manual `npm publish` is the fix.

## The real flow (two merges, not one)

Merging a PR with a changeset does **not** publish anything by itself:

1. PR with a `.changeset/*.md` file merges to `main` → `release.yml` runs →
   `changeset version` bumps versions/changelogs → opens an automated
   **"chore(release): version packages"** PR.
2. That version-packages PR must be reviewed and merged manually — it does
   not merge itself.
3. Merging it triggers `release.yml` again. Only now does it run
   `changeset publish`, create a git tag, and publish a GitHub Release.

If a changeset PR was merged and nothing got published, the first thing to
check is whether the version-packages PR exists and got merged:

```bash
gh pr list --state all --search "version packages" --json number,state,mergedAt
```

## The repo is in permanent prerelease (alpha) mode

`.changeset/pre.json` has `"mode": "pre"`. This is a deliberate, ongoing
choice — the project isn't ready for a stable semver commitment yet. Do not
suggest `changeset pre exit` as a routine fix; that's a product decision, not
a maintenance task.

**Consequence you must know**: in prerelease mode, `changeset version`
intentionally never deletes the `.md` files in `.changeset/` (verified in
`@changesets/apply-release-plan`'s source — the delete-on-consume logic is
gated on `preState === undefined || preState.mode === "exit"`). Seeing old
`.md` files still sitting in `.changeset/` after a release is expected, not
a bug.

Whether a changeset is genuinely pending (not yet versioned) is tracked in
`.changeset/pre.json`'s `changesets` array, which always mirrors the set of
`.md` files present as of the last `changeset version` run. To check by hand:

```bash
git show origin/main:.changeset/pre.json | jq -r '.changesets[]'   # already consumed
ls .changeset/*.md | xargs -n1 basename | sed 's/\.md$//'          # currently present
```

If every `.md` id is already in `pre.json.changesets` → nothing pending,
ready to publish. If any `.md` id is missing from that list → still needs a
`version` run. `release.yml`'s `Check for changesets` step encodes exactly
this comparison — don't replace it with a naive `ls`.

## Verifying a publish actually happened

Don't trust "the workflow ran green" alone — `has_changesets == true` makes
the job skip publish/tag/release steps without failing. Confirm directly:

```bash
gh run list --workflow=release.yml --limit 3 --json databaseId,conclusion,createdAt
npm view @pa-ui/<pkg> dist-tags --json     # `alpha` should point at the new version
gh release list --limit 5                  # a GitHub Release should exist for the new tag
```

## Two bugs already found and fixed here — don't reintroduce them

1. **Naive `has_changesets` check**: a plain `ls .changeset/*.md` will always
   see the un-deleted prerelease changesets and loop forever on the
   "version" branch, never reaching publish. Fixed by comparing against
   `pre.json.changesets` (see above).
2. **`changeset publish --tag <anything>` in pre mode always throws.** Source:
   `changesets-cli.cjs.js`, `publish()` — `if (releaseTag && preState &&
   preState.mode === "pre") throw ...`. There is no flag that overrides this;
   an earlier attempt to pass `--tag alpha` here broke the release job
   outright ("Releasing under custom tag is not allowed in pre mode"). Never
   pass `--tag` to `changeset publish` while `.changeset/pre.json` exists.

   Left with no `--tag`, Changesets' own default only tags a release `alpha`
   if that package has had a real, non-prerelease release before. None of
   `@pa-ui/core`, `@pa-ui/button`, `@pa-ui/input`, `@pa-ui/angular` ever have,
   so every publish lands on `latest` instead of `alpha` — and `alpha` goes
   stale. `release.yml` compensates with a separate step, gated on the publish
   step actually publishing, that diffs git tags before/after `changeset
   publish` (each successful release creates a local `<pkg>@<version>` tag)
   and runs `npm dist-tag add <pkg>@<version> alpha` for each one — a plain
   npm command, not subject to the pre-mode restriction above. `latest` will
   still point at the same prerelease version until a real stable release
   ships; that part has no workaround short of exiting prerelease mode.

## Never publish manually

Never run `npm publish` from a local machine for this repo. The flow is
100% through `release.yml` with `NPM_TOKEN`. A local `npm whoami` isn't even
expected to be authenticated — that's not something to "fix" so you can
publish by hand.
