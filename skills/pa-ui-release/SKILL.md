---
name: pa-ui-release
description:
  'Trigger: hacer un release, publicar a npm, por qué no se publicó, trabajar
  con .changeset/, revisar el workflow release.yml. Checklist operativo para el
  pipeline de release de pa-ui, validar paquetes antes del publish
  (validate-packages).'
license: MIT
metadata:
  author: JosepFernande
  version: '1.3'
  project: pa-ui
---

## Activation Contract

Load this skill before touching anything related to releasing or publishing
`pa-ui` packages: creating/reviewing a changeset, diagnosing why a package
didn't reach npm, or modifying `.github/workflows/release.yml`. The pipeline has
non-obvious behavior around changeset consumption and where packages actually
get published from — already caused confusion twice — read this before assuming
the workflow is broken or that a manual `npm publish` is the fix.

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

## Current release mode: stable (not prerelease)

The repo exited Changesets' prerelease mode on 2026-08-04 (`c8891bc` "salir del
modo pre de changesets", consolidated by `ee53fbd`). `.changeset/pre.json` no
longer exists. `@pa-ui/core`, `@pa-ui/button`, `@pa-ui/input`, and
`@pa-ui/angular` are on real stable versions (e.g. `@pa-ui/core@19.2.1`) and
publish under npm's default `latest` tag — there is no `alpha` tag anymore.

`release.yml` still carries two branches gated on `.changeset/pre.json` existing
(the `Check for changesets` step's array-diff, and the
`Point the alpha dist-tag` step) in case the project re-enters prerelease mode
for a future initiative. Both are self-documenting inline in the workflow — if
`.changeset/pre.json` reappears, read those comments directly instead of
re-deriving the mechanics; don't assume they're dead code to delete.

## Verifying a publish actually happened

Don't trust "the workflow ran green" alone — `has_changesets == true` makes the
job skip publish/tag/release steps without failing. Confirm directly:

```bash
gh run list --workflow=release.yml --limit 3 --json databaseId,conclusion,createdAt
npm view @pa-ui/<pkg> dist-tags --json     # `latest` should point at the new version
gh release list --limit 5                  # a GitHub Release should exist for the new tag
```

## A bug already found and fixed here — don't reintroduce it

`changeset publish` discovers packages via root `workspaces` (`["libs/*"]`), so
it once published each lib's SOURCE `package.json` — the one `ng-packagr` never
touches — instead of the real build output in `dist/{projectRoot}`. Source
publishes have no `main`/`module`/`exports`/`typings`, so every consumer import
failed with `TS2307: Cannot find module '@pa-ui/button'`. This shipped broken to
npm for two releases before being caught (see "Post-publish consumer
verification" below — that check exists because of this exact bug). Fixed (#85)
by replacing `npx changeset publish` with the per-package publish loop currently
in `release.yml`'s `Publish to npm from dist` step, which resolves
`dist/libs/<pkg>`, skips versions already on npm, and runs
`npm publish "$dist_dir"` directly. `@pa-ui/angular` (`libs/pa-ui`) needs its
entry points maintained by hand in source (`main`, `types`, `exports["."]`)
since its build is a plain `nx:run-commands` copy, not `ng-packagr` — see
`validate-packages` below, which now catches this class of regression
automatically.

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

A green `release.yml` run and a `latest` dist-tag pointing at the new version
are **necessary but not sufficient**. The dist-vs-source bug above published
green for two releases while being completely unusable — nothing in the pipeline
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
npx ng build   # or ng serve — TS2307 here means the dist-vs-source bug regressed
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
