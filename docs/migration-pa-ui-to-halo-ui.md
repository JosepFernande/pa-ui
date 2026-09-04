# Migration: pa-ui → halo-ui (issue #139)

## Purpose

This is the complete old → new mapping for every renamed public surface: npm
package names, CSS selector prefix, CSS custom-property prefix, and exported
TypeScript symbols. It also documents the one deleted-not-renamed scaffold
(`PaUiComponent`) and the deprecation runbook for the legacy `@pa-ui/*`
packages.

The GitHub repository itself is **not** renamed
(`github.com/JosepFernande/ pa-ui` stays as-is) — this migration is scoped to
the published npm packages and the library's internal naming contract, not the
repo.

## npm Package Names

| Old (`@pa-ui/*`) | New (`@halolib-ui/*`)    | Notes                                    |
| ---------------- | ------------------------ | ---------------------------------------- |
| `@pa-ui/core`    | `@halolib-ui/core`       | Theme Engine + Foundation CSS            |
| `@pa-ui/button`  | `@halolib-ui/button`     |                                          |
| `@pa-ui/input`   | `@halolib-ui/input-text` |                                          |
| `@pa-ui/select`  | `@halolib-ui/select`     |                                          |
| `@pa-ui/angular` | `@halolib-ui/angular`    | Umbrella package, re-exports the other 4 |

`@halolib-ui/*` continues the existing `19.x` version line (the semver break is
carried entirely by the package-name change, not a reset to `1.0.0`) — see the
`lib-ui-release` skill (`skills/lib-ui-release/SKILL.md`) for the exact first
published version.

```diff
- npm install @pa-ui/angular @angular/cdk
+ npm install @halolib-ui/angular @angular/cdk
```

## Selector Prefix

Every component selector, directive-attribute selector, and BEM class moves from
`pa-` to `ha-`.

| Old                  | New                     |
| -------------------- | ----------------------- |
| `<button pa-button>` | `<button ha-button>`    |
| `<input pa-input>`   | `<input ha-input-text>` |
| `<pa-select>`        | `<ha-select>`           |
| `.pa-button__icon`   | `.ha-button__icon`      |
| `.pa-button--solid`  | `.ha-button--solid`     |

## CSS Custom-Property Prefix

Every design token moves from `--pa-*` to `--ha-*` as the canonical form.

| Old                       | New                       |
| ------------------------- | ------------------------- |
| `--pa-color-primary`      | `--ha-color-primary`      |
| `--pa-primary`            | `--ha-primary`            |
| `--pa-button-bg`          | `--ha-button-bg`          |
| `--pa-input-error-border` | `--ha-input-error-border` |

**No transition alias**: `--pa-*` custom properties are never defined by
`@halolib-ui/*` — there was no temporary alias window. Rename every `--pa-*`
reference in your own CSS to its `--ha-*` equivalent before adopting
`@halolib-ui/*`.

```diff
  .my-button {
-   background: var(--pa-primary);
+   background: var(--ha-primary);
  }
```

## Exported TypeScript Symbols

| Old (`Pa*`)                        | New (`Ha*`)                        |
| ---------------------------------- | ---------------------------------- |
| `providePaTheme`                   | `provideHaTheme`                   |
| `PaThemeService`                   | `HaThemeService`                   |
| `PaColorValue`                     | `HaColorValue`                     |
| `PaThemeConfig`                    | `HaThemeConfig`                    |
| `PaColorVariants`                  | `HaColorVariants`                  |
| `PaThemeOptions`                   | `HaThemeOptions`                   |
| `PA_THEME_TOKEN`                   | `HA_THEME_TOKEN`                   |
| `PA_THEME_STATE_KEY`               | `HA_THEME_STATE_KEY`               |
| `PaButtonVariant` / `PaButtonSize` | `HaButtonVariant` / `HaButtonSize` |
| `PaInputSize`                      | `HaInputTextSize`                  |
| `PaSelectOption` / `PaSelectSize`  | `HaSelectOption` / `HaSelectSize`  |

```diff
- import { providePaTheme } from '@pa-ui/core';
+ import { provideHaTheme } from '@halolib-ui/core';

  providers: [
-   providePaTheme(),
+   provideHaTheme(),
  ];
```

## `PaUiComponent` — Removed, No Replacement

`libs/core`'s dead scaffold component (`PaUiComponent`, never used by any real
consumer) was **deleted**, not renamed to `HaUiComponent`. It is no longer
exported from `@halolib-ui/core`'s public API. There is no replacement — if your
code imported `PaUiComponent`, remove the import; it served no functional
purpose in the library.

## Deprecation Runbook (`@pa-ui/*` packages)

Run immediately after all 5 `@halolib-ui/*` packages report published (no
grace-period gap):

```bash
for p in core button input select; do
  new_p="$p"
  if [ "$p" = "input" ]; then new_p="input-text"; fi
  npm deprecate "@pa-ui/$p@*" \
    "@pa-ui/$p is deprecated and no longer maintained. Use @halolib-ui/$new_p. Migration: https://github.com/JosepFernande/pa-ui/blob/main/docs/migration-pa-ui-to-halo-ui.md"
done
npm deprecate "@pa-ui/angular@*" \
  "@pa-ui/angular is deprecated and no longer maintained. Use @halolib-ui/angular. Migration: https://github.com/JosepFernande/pa-ui/blob/main/docs/migration-pa-ui-to-halo-ui.md"
```

Verify:

```bash
npm view @pa-ui/core deprecated
npm view @halolib-ui/angular dependencies
```

This is a manual, one-time runbook step — not a CI step — per the design
decision to avoid a permanent workflow step for a strictly one-time action. See
the `lib-ui-release` skill for the full pre-publish checklist this fits into.

## Full Checklist for Consumers

1. `npm uninstall @pa-ui/angular` (or the individual `@pa-ui/*` packages you
   depend on) and `npm install @halolib-ui/angular` (or the equivalents).
2. Update every `@pa-ui/*` import specifier to `@halolib-ui/*`.
3. Rename every `Pa*` symbol you import to its `Ha*` equivalent (see table
   above).
4. Rename every `pa-` component selector usage in your templates to `ha-`.
5. Rename every `--pa-*` custom-property reference in your own CSS to `--ha-*` —
   there is no alias window; `--pa-*` is never defined.
6. If you imported `PaUiComponent`, remove the import — it has no replacement.
