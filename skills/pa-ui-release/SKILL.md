---
name: pa-ui-release
description:
  'Trigger: hacer un release, publicar a npm, por qué no se publicó, trabajar
  con .changeset/, revisar el workflow release.yml. Checklist operativo para el
  pipeline de release de pa-ui en modo prerelease (alpha), validar paquetes
  antes del publish (validate-packages).'
license: MIT
metadata:
  author: JosepFernande
  version: '1.2'
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
2. That version-packages PR must be reviewed and merged manually — it does not
   merge itself.
3. Merging it triggers `release.yml` again. Only now does it run
   `changeset publish`, create a git tag, and publish a GitHub Release.

If a changeset PR was merged and nothing got published, the first thing to check
is whether the version-packages PR exists and got merged:

```bash
gh pr list --state all --search "version packages" --json number,state,mergedAt
```

## The repo is in permanent prerelease (alpha) mode

`.changeset/pre.json` has `"mode": "pre"`. This is a deliberate, ongoing choice
— the project isn't ready for a stable semver commitment yet. Do not suggest
`changeset pre exit` as a routine fix; that's a product decision, not a
maintenance task.

**Consequence you must know**: in prerelease mode, `changeset version`
intentionally never deletes the `.md` files in `.changeset/` (verified in
`@changesets/apply-release-plan`'s source — the delete-on-consume logic is gated
on `preState === undefined || preState.mode === "exit"`). Seeing old `.md` files
still sitting in `.changeset/` after a release is expected, not a bug.

Whether a changeset is genuinely pending (not yet versioned) is tracked in
`.changeset/pre.json`'s `changesets` array, which always mirrors the set of
`.md` files present as of the last `changeset version` run. To check by hand:

```bash
git show origin/main:.changeset/pre.json | jq -r '.changesets[]'   # already consumed
ls .changeset/*.md | xargs -n1 basename | sed 's/\.md$//'          # currently present
```

If every `.md` id is already in `pre.json.changesets` → nothing pending, ready
to publish. If any `.md` id is missing from that list → still needs a `version`
run. `release.yml`'s `Check for changesets` step encodes exactly this comparison
— don't replace it with a naive `ls`.

## Verifying a publish actually happened

Don't trust "the workflow ran green" alone — `has_changesets == true` makes the
job skip publish/tag/release steps without failing. Confirm directly:

```bash
gh run list --workflow=release.yml --limit 3 --json databaseId,conclusion,createdAt
npm view @pa-ui/<pkg> dist-tags --json     # `alpha` should point at the new version
gh release list --limit 5                  # a GitHub Release should exist for the new tag
```

## Three bugs already found and fixed here — don't reintroduce them

1. **Naive `has_changesets` check**: a plain `ls .changeset/*.md` will always
   see the un-deleted prerelease changesets and loop forever on the "version"
   branch, never reaching publish. Fixed by comparing against
   `pre.json.changesets` (see above).
2. **`changeset publish --tag <anything>` in pre mode always throws.** Source:
   `changesets-cli.cjs.js`, `publish()` —
   `if (releaseTag && preState && preState.mode === "pre") throw ...`. There is
   no flag that overrides this; an earlier attempt to pass `--tag alpha` here
   broke the release job outright ("Releasing under custom tag is not allowed in
   pre mode"). Never pass `--tag` to `changeset publish` while
   `.changeset/pre.json` exists.

   Left with no `--tag`, Changesets' own default only tags a release `alpha` if
   that package has had a real, non-prerelease release before. None of
   `@pa-ui/core`, `@pa-ui/button`, `@pa-ui/input`, `@pa-ui/angular` ever have,
   so every publish lands on `latest` instead of `alpha` — and `alpha` goes
   stale. `release.yml` compensates with a separate step, gated on the publish
   step actually publishing, that diffs git tags before/after
   `changeset publish` (each successful release creates a local
   `<pkg>@<version>` tag) and runs `npm dist-tag add <pkg>@<version> alpha` for
   each one — a plain npm command, not subject to the pre-mode restriction
   above. `latest` will still point at the same prerelease version until a real
   stable release ships; that part has no workaround short of exiting prerelease
   mode.

3. **`changeset publish` discovers packages via root `workspaces`
   (`["libs/*"]`), so it always published each lib's SOURCE `package.json` — the
   one `ng-packagr` never touches — instead of the real build output in
   `dist/{projectRoot}`.** Source publishes have no `main`/`module`/`exports`/
   `typings`, so every consumer import failed with
   `TS2307: Cannot find module '@pa-ui/button'`. This shipped broken to npm for
   at least two alpha versions before being caught (see "Post-publish consumer
   verification" below — this is exactly the class of bug that check exists to
   catch). Fixed (#85) by replacing `npx changeset publish` with a loop that,
   per `libs/*/package.json`, resolves `dist/libs/<pkg>`, skips versions already
   on npm (`npm view "$name@$version" version`), and runs
   `npm publish "$dist_dir"` directly — tagging `<name>@<version>` by hand since
   it no longer goes through `@changesets/git`'s internal tagging.
   `@pa-ui/angular` (`libs/pa-ui`) needed a companion fix: its build target is a
   plain `nx:run-commands` copy (no `ng-packagr`), so it never gets
   `main`/`exports` unless they're added directly to its source `package.json`.

## Pre-publish validation (issue #78) — `validate-packages`

`release.yml` runs **`Validate packages before publish`** inside the
`has_changesets == 'false'` branch, right before `Publish to npm from dist`. It
blocks the publish (exit != 0) instead of letting a broken package ship green.
Local command: `npm run validate:packages` (run after `nx build`, before opening
a PR with a changeset).

It enforces the two guarantees that would have caught the #85 regression:

1. **Entry points exist in what actually gets published.** For every publishable
   lib under `libs/*` (`publishConfig.access === "public"`), the dist
   `package.json` at `dist/libs/<lib>/package.json` must expose a runtime entry
   (`main` and/or `exports["."]`) and a types entry (`typings`/`types`), all
   non-null — and the dist package itself must exist (a publishable lib with no
   dist build means the publish loop silently skips it).
2. **The validated directory is the published directory.** The script parses
   `.github/workflows/release.yml`, extracts the `Publish to npm from dist`
   step, and asserts it still derives `dist_dir="dist/$lib_dir"` and runs
   `npm publish "$dist_dir"`. If that step ever points back at the source
   (`npm publish "$lib_dir"`) or reverts to `changeset publish` (the old
   workspaces-based source publish), validation fails explicitly — no silent
   PASS on a dist/ nobody publishes.

`@pa-ui/angular` (`libs/pa-ui`) is special: its build is a plain
`nx:run-commands` copy, not ng-packagr, so **entry points AND types are
maintained by hand** in `libs/pa-ui/package.json` (`main`, `types`/`typings`,
`exports["."].types`) plus `src/index.mjs` + `src/index.d.mts`, all copied by
its build target. The harness catches a missing `types` here the same way it
catches the ng-packagr packages missing `typings`.

## Post-publish consumer verification (do this for every release, not just when something looks wrong)

A green `release.yml` run and a `latest`/`alpha` dist-tag pointing at the new
version are **necessary but not sufficient**. Bug 3 above published green for
two whole alpha cycles while being completely unusable — nothing in the pipeline
ever installed the package and tried to use it. Two more real bugs (#88) were
found the same way: `@pa-ui/button`'s `loading` input rejects the bare-attribute
usage its own README documents, and no README mentions that
`@pa-ui/core/theme.css` must be imported separately or the button renders with
correct colors but no padding/height/font/gap/radius — `providePaTheme()` only
ever writes color variables at runtime; every other design token is a static CSS
file the consumer has to opt into.

The pre-publish harness above checks entry points and the publish-directory
invariant. It intentionally does NOT cover runtime/API/docs correctness — the
#88 class — so still do this by hand as part of reviewing any release (the
version-packages PR merge, or right after `release.yml` finishes publishing):

```bash
# 1. The tarball must contain the ng-packagr build, not source
npm pack @pa-ui/<pkg>@<new-version>
tar -tzf pa-ui-<pkg>-<new-version>.tgz   # expect fesm2022/*.mjs + *.d.ts, NOT src/*.ts
tar -xzOf pa-ui-<pkg>-<new-version>.tgz package/package.json \
  | jq '{main, module, exports, typings}'  # must be non-null/populated

# 2. Internal deps must point at the new version too (updateInternalDependencies)
npm view @pa-ui/<pkg>@<new-version> dependencies --json

# 3. A REAL consumer must actually build against it — not just resolve it.
#    In a scratch Angular app (or a disposable one kept around for this):
npm install @pa-ui/angular@<new-version>
npx ng build   # or ng serve — TS2307 here means bug 3 regressed
```

For anything touching the button specifically, also render it with every
documented attribute from `libs/button/README.md` verbatim (including
`providePaTheme()` with no extra setup) and confirm computed styles actually
show non-default padding/height/font — not just that it compiles. A component
that compiles but renders unstyled is exactly what bug from #88 looked like: no
error anywhere, just a button that "looks almost right."

## Never publish manually

Never run `npm publish` from a local machine for this repo. The flow is 100%
through `release.yml` with `NPM_TOKEN`. A local `npm whoami` isn't even expected
to be authenticated — that's not something to "fix" so you can publish by hand.
