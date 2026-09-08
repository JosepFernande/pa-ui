# CSS Strategy

halo-ui styles every component through a strict 3-layer token system:
**Foundation → Semantic → Component**. This document is the reference for how
the layers are defined, how they are distributed to a consumer app, and which
product decisions are still open.

See `skills/lib-ui-architecture/SKILL.md` for the architectural hard rules this
document implements.

## The Three Layers

```
Foundation              Semantic                  Component
──────────              ────────                  ─────────
--primary-600      ──►  --ha-primary         ──►  --ha-button-bg
--primary-700      ──►  --ha-primary-hover   ──►  --ha-button-hover-bg
--spacing-md       ──►  --ha-spacing-md      ──►  --ha-button-padding-md
--font-size-body   ──►  --ha-font-size-body  ──►  --ha-button-font-md
```

1. **Foundation** — raw values. Unprefixed CSS custom properties:
   `--primary-500`, `--spacing-md`, `--radius-md`, `--font-size-body`,
   `--icon-size-md`. Never consumed directly by components.
2. **Semantic** — `--ha-*` names with product meaning: `--ha-primary`,
   `--ha-spacing-md`, `--ha-font-size-h1`. Colors are resolved at runtime by the
   Theme Engine (see below); every other semantic scale (spacing, gap, radius,
   typography, icon size) is a static 1:1 alias of its Foundation counterpart.
3. **Component** — `--ha-button-*`, `--ha-input-*`, etc. Component CSS
   references only semantic and component tokens, never Foundation tokens
   directly (hard rule, `SKILL.md:34`).

Scale naming for spacing, gap, radius, font-size, and icon-size is always
`xs | sm | md | lg | xl` — never numeric-indexed (`-1`, `-2`, `-4`). This is a
non-negotiable convention shared with the existing component-token vocabulary
(`button.tokens.ts`, `input-text.tokens.ts`).

The color scale steps (`25` through `900`) are the one intentional exception:
they are the Figma lightness axis of a raw color scale, not a size scale, and
they never leave the Foundation layer as a numeric name — semantic color tokens
(`--ha-primary`, `--ha-success`, ...) carry no numeric suffix.

## Two Disjoint Pipelines

halo-ui deliberately splits token delivery into two independent mechanisms
depending on whether the value needs to change at runtime.

### 1. Color — runtime, via the Theme Engine

Color **bases** (`primary`, `success`, `error`, `warning`, `alert`, `info`,
`neutral`, and any app-registered custom color) go through the Theme Engine:

```
provideHaTheme(config?) → mergeTheme() → DEFAULT_THEME + config
                              │
                        deriveTokens() → toSemanticCssVariables()
                              │
                    HaThemeService writes inline styles on
                    document.documentElement at bootstrap:
                    --ha-{name}, --ha-{name}-hover,
                    --ha-{name}-active, --ha-{name}-contrast
```

`provideHaTheme()` with no arguments resolves the shipped `DEFAULT_THEME`
roster. Passing `colors` merges on top of it (`extendDefaults: true` by default)
or replaces it entirely (`extendDefaults: false`).

Because these are written as **inline styles** on `documentElement`, they
outrank any `:root` stylesheet rule automatically — no `!important`, no
load-order coupling between the Theme Engine and the static CSS file below.

Raw color scales (the 25→900 steps) are never passed to `deriveTokens()` and
never appear as a `HaThemeConfig.colors` entry — they have no interactive states
(hover/active/contrast make no sense for a fixed swatch), so runtime derivation
would be meaningless for them. They live only in the static layer described
next.

The Foundation layer ships a single `primary` raw brand scale (breaking change —
replaces the former `dark-blue`/`light-blue`/`dark-green`/ `light-green`
two-brand-family palette, no alias kept):

| Step | Value     | Step | Value     |
| ---- | --------- | ---- | --------- |
| 25   | `#f8faff` | 500  | `#5956eb` |
| 50   | `#eef2ff` | 600  | `#4f46e5` |
| 100  | `#d4ddff` | 700  | `#4338ca` |
| 200  | `#a9bbff` | 800  | `#3730a3` |
| 300  | `#818cf8` | 900  | `#312e81` |
| 400  | `#6366f1` |      |           |

`primary-600`/`primary-700` are the anchors the semantic `primary` theme color
(base/hover) is derived from — see the roster table below.

### 2. Everything else — static, via `theme.css`

Raw color scales, spacing, gap, radius, typography, icon sizes, and every
component-token _default_ value are static: fixed at build time and shipped as a
hand-authored `:root` stylesheet, `@halolib-ui/core/theme.css`. They are never
runtime-mutable.

The TypeScript constants in `libs/core/src/lib/foundation/`
(`foundation.tokens.ts`, `foundation.types.ts`, `component-defaults.tokens.ts`,
`button-dimensions.tokens.ts`) are the source of truth. `theme.css` is a mirror
of what those constants would emit; drift between the two is caught by a parity
test (`foundation-css.spec.ts`), not by a build step — there is no codegen step
between the TS constants and the shipped CSS file.

### Default Theme color roster

`DEFAULT_THEME` (the base every `provideHaTheme()` call merges against,
`libs/core/src/lib/theme/theme.tokens.ts`):

| Key                     | Value                                   | Notes                                                    |
| ----------------------- | --------------------------------------- | -------------------------------------------------------- |
| `primary`               | `{ base: '#4f46e5', hover: '#4338ca' }` | Explicit hover — `primary-600` base, `primary-700` hover |
| `success`               | `#8fbf21`                               |                                                          |
| `error`                 | `#d71608`                               |                                                          |
| `warning`               | `#ed9613`                               |                                                          |
| `alert`                 | `#f8e115`                               |                                                          |
| `info`                  | `#16a3c3`                               |                                                          |
| `neutral`               | `#4c4c4c`                               |                                                          |
| `danger` _(deprecated)_ | `#d71608`                               | Alias of `error`, see "Open Product Assumptions" below   |

> **Breaking change:** the literal `dark-blue`/`light-blue`/`dark-green`/
> `light-green` brand hues and the `secondary` semantic alias have been removed
> entirely — no deprecated shim or backwards-compatible mapping is kept. The
> Foundation layer now ships a single `primary` raw scale (25-900, see the table
> above the "Everything else — static" section) instead of the former
> two-brand-family palette.

Bootstrap example:

```typescript
import { provideHaTheme } from '@halolib-ui/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHaTheme(), // resolves the DEFAULT_THEME roster above, zero config
  ],
};
```

Registering an app-specific color on top of the defaults:

```typescript
provideHaTheme({
  colors: {
    treasury: { base: '#0d6efd' }, // hover/active/contrast auto-derived
  },
});
```

## Consumer Setup

Full setup is `provideHaTheme()` **plus one explicit CSS import**:

```typescript
// app.config.ts
import { provideHaTheme } from '@halolib-ui/core';

export const appConfig: ApplicationConfig = {
  providers: [provideHaTheme()],
};
```

```css
/* styles.css (or any global entry point) */
@import '@halolib-ui/core/theme.css';
```

With both in place, a bare app renders a fully-styled `HaButton` — height,
min-width, radius, padding, gap, color, typography — with zero consumer-authored
`--ha-*` tokens.

`@halolib-ui/core/theme.css` is exposed as a package subpath export
(`libs/core/package.json` → `exports["./theme.css"]`) and shipped as an
`ng-packagr` asset. It is not injected automatically by `provideHaTheme()`:
`@halolib-ui/core` declares `sideEffects: false` and has no global stylesheet
otherwise, so injecting ~180 static custom properties via JS on every bootstrap
would defeat browser CSS caching and risk FOUC on SSR. Forgetting the import
produces an unstyled-but-not-broken component, not a crash.

## Fonts and Icons Are the Consumer's Responsibility

`theme.css` declares `--font-family: 'Montserrat', -apple-system, ...` and
`--icon-size-*` by name/size only. It does **not** ship a `@font-face`
declaration, a Montserrat font file, a Flaticon icon font, or any CDN `@import`.
Loading the actual Montserrat font and Flaticon icon assets is the consuming
application's responsibility. This keeps `@halolib-ui/core` free of a
third-party asset dependency and keeps `sideEffects: false` honest.

## Overriding Tokens

Every visual property is a CSS custom property and can be overridden at any
scope, same as any other `--ha-*` variable:

```css
:root {
  --ha-button-radius: 8px;
}

.admin-panel {
  --ha-button-bg: var(--ha-treasury);
}
```

## Open Product Assumptions

The following four points are assumptions taken by the implementation in the
absence of an explicit product decision. They are documented here so they are
visible and revisitable — **none of them should be read as a confirmed,
permanent decision**.

1. **`danger` retained as a deprecated alias of `error`.** Kept for one minor
   version so existing `color="danger"` usage keeps resolving without a runtime
   error, instead of a hard pre-1.0 break. Pending product sign-off; must be
   revisited before the next minor release. See design decision D3.
2. **One explicit CSS import is acceptable consumer setup.** The alternative
   (fully self-installing theme via `provideHaTheme()` alone, injecting the
   static sheet from JS) was rejected on caching/SSR/`sideEffects` grounds (see
   "Consumer Setup" above), but the underlying product question — is one extra
   import step acceptable friction — has not been explicitly confirmed.
3. **Montserrat and Flaticon are the consuming app's responsibility**, not
   self-hosted or bundled by `@halolib-ui/core`. No alternative delivery
   (self-hosted font file, CDN import) has been evaluated or approved.
4. **Button `sm`/`lg` height, padding, and gap values are assistant-authored
   placeholders**, not Figma-confirmed, pending designer validation. Only `md`
   dimensions and `min-width` for all three sizes are Figma-confirmed.
   Placeholder values are isolated in `HA_BUTTON_PROVISIONAL_DIMENSIONS`
   (`libs/core/src/lib/foundation/button-dimensions.tokens.ts`) and marked with
   `/* provisional: pending design validation */` in `theme.css`, so updating
   them later only touches that one constant — no API or logic change.

## Reference

- `libs/core/src/lib/theme/theme.tokens.ts` — `DEFAULT_THEME`, color merge base
- `libs/core/src/lib/theme/theme-engine.ts` — `mergeTheme`, `deriveTokens`
- `libs/core/src/lib/foundation/` — Foundation types, constants, and the shipped
  `theme.css`
- `libs/button/src/lib/button.tokens.ts` — first real component consumer
- `skills/lib-ui-architecture/SKILL.md` — the 6 hard rules and 3-layer contract
  this document implements
