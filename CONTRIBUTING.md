# Contributing to pa-ui

Thanks for your interest in contributing! This document covers the development
workflow, PR process, changeset conventions, and release process.

## Development Setup

```bash
# Install dependencies
npm ci

# Build all libraries
npx nx run-many -t build

# Run tests
npx nx run-many -t test

# Run linting
npx nx run-many -t lint

# Run a single library's tests
npx nx test core
npx nx test button
npx nx test input
```

### Useful Nx Commands

| Command                    | Description                        |
| -------------------------- | ---------------------------------- |
| `npx nx graph`             | Visualize project dependency graph |
| `npx nx reset`             | Clear Nx cache                     |
| `npx nx build <project>`   | Build a single project             |
| `npx nx test <project>`    | Test a single project              |
| `npx nx lint <project>`    | Lint a single project              |
| `npx nx run-many -t build` | Build all projects                 |
| `npx nx run-many -t test`  | Test all projects                  |

## Branch Strategy

- **Feature branches**: `feat/<description>` or `fix/<description>`
- **Base branch**: `main`
- Keep branches focused on a single change or feature
- Rebase onto `main` before opening a PR

## PR Process

1. Create a branch from `main`
2. Make your changes following the [code conventions](./AGENTS.md)
3. Add or update tests for your changes
4. Create a changeset if your change affects a published package (see below)
5. Open a PR against `main`
6. Ensure all CI checks pass (lint, test, build, gga-review)
7. Request review from a maintainer

### Commit Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/). Every
commit message must follow this pattern:

```
<type>(<scope>): <description>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`,
`ci`

**Scopes**: `core`, `button`, `input`, `showcase`, `repo`, `ci`

Examples:

```
feat(button): add loading state with spinner
fix(core): resolve token inheritance for nested themes
chore(repo): update nx to latest version
```

## Changeset Workflow

We use [Changesets](https://github.com/changesets/changesets) to manage
versioning and changelogs.

### When a Changeset is Required

A changeset is required whenever your PR changes a **publishable package**
(`@pa-ui/core`, `@pa-ui/button`, `@pa-ui/input`). This includes:

- Adding new features or components
- Changing or removing public APIs
- Bug fixes that affect consumer behavior
- Dependency updates that change peer dependency ranges

A changeset is **not** required for:

- Internal refactors that don't change public API
- Test-only changes
- Documentation updates (unless they warrant a changelog entry)
- Changes to the showcase app

### How to Create a Changeset

```bash
npx changeset
```

The CLI will prompt you to:

1. Select which packages are affected (space to select, enter to confirm)
2. Choose a **bump type** for each:
   - `major` — breaking changes
   - `minor` — new features (backward compatible)
   - `patch` — bug fixes (backward compatible)
3. Write a summary of the change

This creates a `.md` file in `.changeset/` with a unique random name. Commit
this file with your changes.

### Bump Types

| Type      | When to use                                                                        |
| --------- | ---------------------------------------------------------------------------------- |
| **major** | Breaking API changes, removed features, changed component selectors/inputs/outputs |
| **minor** | New components, new features, new inputs/outputs (backward compatible)             |
| **patch** | Bug fixes, performance improvements, dependency bumps (no API change)              |

## Release Process

Releases are automated via GitHub Actions. When a PR with changesets is merged
to `main`:

1. The `release.yml` workflow runs
2. `changeset version` consumes all pending changesets, bumps package versions,
   and updates changelogs
3. A version commit is pushed back to `main`
4. `changeset publish --tag alpha` publishes the updated packages to npm

### Pre-release (Alpha)

During the alpha phase, all packages are published under the `alpha` dist-tag.
Consumers install with:

```bash
npm install @pa-ui/core@alpha
```

Once stable, the release workflow will switch from
`changeset publish --tag alpha` to `changeset publish` (latest dist-tag).

## Code Conventions

See [AGENTS.md](./AGENTS.md) for the full code conventions and architectural
rules. Key highlights:

- **Standalone components only** — no NgModules
- **Signals first** — use Angular Signals for local state, not RxJS
- **Tokens first** — no hardcoded colors, spacing, or radii
- **CSS variables first** — prefer native CSS custom properties over SCSS
- **CDK over custom** — use Angular CDK for overlays, focus, a11y
- **`pa-` prefix** — all component selectors use the `pa-` prefix

## Questions?

Open an issue or start a discussion — we're happy to help!
