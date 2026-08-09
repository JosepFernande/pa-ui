# Theming Deep-Dive

## Purpose

The complete technical reference for the Theme Engine: every public API, every
option, every derivation algorithm, every integration pattern. Read this when
you need to understand how a specific color token is computed, or when adding a
new color or theme. See [CSS Strategy](./css-strategy.md) for how this fits into
the broader 3-layer token system, and
[Architecture & Foundation](./architecture-and-foundation.md) for the
higher-level package layout.

## Public API

### `providePaTheme(config?, options?)`

Registers the theme at app bootstrap (`EnvironmentProviders`). Eagerly
instantiates `PaThemeService` (via `provideEnvironmentInitializer`) so the first
CSS-variable write happens at bootstrap, without any consumer having to inject
the service manually.

```typescript
import { providePaTheme } from '@pa-ui/core';

// Minimal (uses the default theme)
providePaTheme();

// Override some colors (the rest keep their default)
providePaTheme({
  colors: { primary: '#0ea5e9' },
});

// Explicit override of specific variants
providePaTheme({
  colors: {
    primary: { base: '#16709e', hover: '#0a4f6b' },
  },
});

// Replace the entire palette (no fallback to defaults)
providePaTheme(
  {
    colors: {
      'dark-blue': '#0a4f6b',
      'light-blue': '#16709e',
      'dark-green': '#507802',
      'light-green': '#8fbf21',
      primary: { base: '#16709e', hover: '#0a4f6b' },
      secondary: { base: '#8fbf21', hover: '#507802' },
      success: '#8fbf21',
      error: '#d71608',
      warning: '#ed9613',
      alert: '#f8e115',
      info: '#16a3c3',
      neutral: '#4c4c4c',
    },
  },
  { extendDefaults: false },
);
```

Never throws — if anything fails while computing the snapshot, it falls back to
`DEFAULT_THEME` and emits a single `console.warn`. App bootstrap is never
blocked by this.

### Types

```typescript
interface PaColorVariants {
  base: string;
  hover?: string;
  active?: string;
  contrast?: string;
}

type PaColorValue = string | PaColorVariants;

interface PaThemeConfig {
  colors: Record<string, PaColorValue>; // open dictionary — any color name
}

interface PaThemeOptions {
  extendDefaults?: boolean; // default: true
}

interface ResolvedTheme {
  colors: Record<string, PaColorValue>;
}

type ThemeCssVariables = Record<string, string>;
```

### Default Theme (`DEFAULT_THEME`)

```typescript
{
  colors: {
    'dark-blue':   '#0a4f6b',
    'light-blue':  '#16709e',
    'dark-green':  '#507802',
    'light-green': '#8fbf21',
    primary:   { base: '#16709e', hover: '#0a4f6b' }, // alias: light-blue base, dark-blue hover
    secondary: { base: '#8fbf21', hover: '#507802' }, // alias: light-green base, dark-green hover
    success: '#8fbf21',
    error:   '#d71608',
    warning: '#ed9613',
    alert:   '#f8e115',
    info:    '#16a3c3',
    neutral: '#4c4c4c', // Figma neutral-900 — also used as the text color across the type scale
    danger:  '#d71608', // deprecated: alias of error, same hex — do not use in new code
  },
}
```

`danger` is marked `@deprecated` in code
(`libs/core/src/lib/theme/theme.tokens.ts`) and is deliberately excluded from
the "base color keys" the engine requires when `extendDefaults: false` (see
below) — kept only for backward compatibility with consumers already using
`color="danger"`.

Used automatically when `providePaTheme()` is not called, or as the merge base
when `extendDefaults` is `true` (the default).

### `extendDefaults`: merge vs. full replacement

- `true` (default, including when `options` is omitted entirely):
  `config.colors` is merged over `DEFAULT_THEME.colors` — unspecified colors
  keep their default value, specified ones win.
- `false`: **only** `config.colors` is used, with no fallback to the defaults.
  If any of the required base colors is missing — `primary`, `secondary`,
  `success`, `error`, `warning`, `alert`, `info`, `neutral` — a `console.warn`
  names the missing keys. It never throws and never backfills silently.

  This base-key list (`BASE_COLOR_KEYS` in `theme-engine.ts`) is exactly these 8
  semantic keys — it deliberately does **not** include the four literal brand
  hues (`dark-blue`, `light-blue`, `dark-green`, `light-green`) or the
  deprecated `danger` alias, since those aren't required for a self-consistent
  palette.

## How the Theme Engine Works

### Bootstrap-time resolution

1. `providePaTheme()` registers a factory under the `PA_THEME_TOKEN` injection
   token.
2. **Server (SSR):** computes the resolved snapshot synchronously (`mergeTheme`)
   and persists it into `TransferState` under `PA_THEME_STATE_KEY`.
3. **Browser:** if `TransferState` already has the snapshot (came from the
   server), reuses it as-is — no recomputation. Otherwise computes it the same
   way as the server.
4. The snapshot is frozen (`Object.freeze`, deep for object-shaped entries)
   before being exposed — nobody can mutate it afterward.
5. `PaThemeService` is instantiated eagerly at bootstrap; its constructor runs
   the first CSS-variable write to the DOM (skipped on the server).

### Token derivation algorithm (`deriveTokens`)

For each color in `theme.colors`, in insertion order:

1. **Normalize the name** (`normalizeColorName`): lowercase, spaces/ underscores
   → dash, any other character outside `[a-z0-9-]` stripped, repeated dashes
   collapsed. Warns if the name changed. Warns on collision if two distinct keys
   normalize to the same name — the later one wins.
2. **Extract `base`**: if the entry is an object (`PaColorVariants`), `base` is
   its `base` field; if it's a plain string, `base` is the whole string.
3. **Parse `base` to HSL** (`hexToHsl`). If the hex is invalid, warns and skips
   the **entire** color.
4. **Resolve each variant** (`hover`, `active`, `contrast`) via
   `resolveVariant`:
   - If the entry is an object **and** that variant is explicit **and** is a
     valid hex → used verbatim, no HSL computation.
   - Otherwise → derived from `base`:
     - `hover` = base HSL with lightness `+8`
     - `active` = base HSL with lightness `-8`
     - `contrast` = `#ffffff` or `#000000`, whichever yields the higher WCAG 2.1
       contrast ratio against `base` (real gamma-corrected relative luminance,
       not a naive brightness heuristic)
   - An invalid explicit hex on a **single** variant is discarded with a
     `console.warn` (distinct from the `base`-invalid warning) and that variant
     falls back to derivation — `base` and the other variants are unaffected.
5. Emits `--pa-color-{name}`, `--pa-color-{name}-hover`,
   `--pa-color-{name}-active`, `--pa-color-{name}-contrast`.

This per-variant override exists for brand palettes where the fixed derivation
rule (always lighter for hover, always darker for active) can't express the
desired result — e.g. a hover that must be darker than the base. It is a
**bootstrap-only** capability: set in the initial `providePaTheme()` call, not
in the runtime mutation API (see below).

### From `--pa-color-*` to `--pa-*`: the semantic layer

`deriveTokens()` emits variables with the `--pa-color-*` prefix. Before writing
to the DOM, `toSemanticCssVariables()` renames them 1:1 to the semantic layer
components actually consume:

```
--pa-color-primary          → --pa-primary
--pa-color-primary-hover    → --pa-primary-hover
--pa-color-primary-active   → --pa-primary-active
--pa-color-primary-contrast → --pa-primary-contrast
```

What ultimately lands on `document.documentElement.style` (and what components
read via `var(--pa-primary)`, etc.) is **always** the semantic layer, never
`--pa-color-*` — that prefix is an internal implementation detail of
`deriveTokens`, not something a component should reference.

## Runtime API: `PaThemeService`

```typescript
import { inject } from '@angular/core';
import { PaThemeService } from '@pa-ui/core';

@Component({
  /* ... */
})
export class ThemeSwitcherComponent {
  private themeService = inject(PaThemeService);

  changeColor(name: string, hex: string) {
    this.themeService.overrideColor(name, hex);
    // Re-derives and rewrites all CSS variables; components react on their
    // own because they read var(--pa-*).
  }

  resetTheme() {
    this.themeService.reset();
  }
}
```

### Surface

- `theme: Signal<ResolvedTheme>` — read-only signal of the current snapshot.
  This is the only reactivity channel — **there is no event or Observable**; use
  `computed()` or read the signal directly in the template to react to theme
  changes.
- `applyTheme(overrides: Record<string, string>): void` — merges `overrides`
  over the current colors (same rules as `providePaTheme`), re-derives, and
  rewrites the DOM.
- `overrideColor(name: string, hex: string): void` — sugar for
  `applyTheme({ [name]: hex })`.
- `reset(): void` — restores the frozen bootstrap-time snapshot as-is (including
  any explicit variants it had).
- `getResolvedTheme(): ResolvedTheme` — synchronous accessor for the current
  snapshot.
- `getColor(name: string): string | undefined` — always returns the `base` hex,
  even if the entry is an object with explicit variants. There is no public
  accessor to read those variants back out.

### `applyTheme`/`overrideColor` are string-only

Both methods accept only `string`, never `PaColorVariants`. If a color had
explicit variants set at bootstrap and `overrideColor('primary', '#ff0000')` is
called afterward, the entry is **fully replaced** — the explicit variants are
lost and all four variants re-derive from the new `base`. This is intentional:
it keeps the runtime API's signature simple, with no need to reason about a
partial object-over-object merge.

## Public Low-Level Utilities

Exported from `@pa-ui/core` for anyone composing their own color logic (advanced
use, not needed for normal consumption):

- `hexToRgb`, `rgbToHsl`, `hslToRgb`, `hexToHsl`, `hslToHex`,
  `relativeLuminance` — pure color-space conversion and WCAG luminance
  primitives.
- `normalizeColorName`, `adjustLightness`, `getContrastColor`, `deriveTokens` —
  the derivation policy described above.
- `toSemanticCssVariables` — the `--pa-color-*` → `--pa-*` adapter.
- `DEFAULT_THEME` — the default palette, as an object.

## Multi-Theme (Future — Not Implemented)

The architecture leaves the door open for named themes (`dark`, `corporate`)
switchable at runtime via a class on `<html>`, but **no "theme name" concept
exists in the code today** — not in `PaThemeConfig`, not in `ResolvedTheme`, not
in `PaThemeService`. There is no `applyTheme({ name: ... })` and no
`.pa-theme-*` classes. This section will be updated with the real API once it
exists.

## SSR Considerations

The Theme Engine is SSR-safe:

- The snapshot is computed synchronously and purely (`mergeTheme`), with no
  async operations.
- On the server, the resolved snapshot (the colors object, not CSS) is persisted
  into `TransferState` under `PA_THEME_STATE_KEY`.
- On the browser, if that snapshot is already in `TransferState`, it's reused
  without recomputation — guaranteeing server and client see exactly the same
  theme.
- The actual CSS-variable write to the DOM (`PaThemeService.writeToDom`) is
  fully skipped on the server — there's no `document` there.
- Any error during computation falls back to `DEFAULT_THEME` with a
  `console.warn`, never blocking bootstrap.

No additional configuration is needed for SSR consumers.

## Rules of the Team

- Components MUST consume tokens via `var(--pa-*)`. Never hardcode colors.
- Components MUST bind the `color` input to a CSS custom property on the host,
  not as a BEM modifier.
- Custom colors MUST be registered through `providePaTheme()`.
- The Theme Engine MUST NOT block app bootstrap — it must fall back to the
  default theme and log a warning if anything fails.
- Adding a new color is a non-breaking change.
- Renaming or removing a color IS a breaking change and requires a major version
  bump.

## Reference

- `libs/core/src/lib/theme/theme.tokens.ts` — `DEFAULT_THEME`, types, DI tokens
- `libs/core/src/lib/theme/theme-engine.ts` — `mergeTheme`
- `libs/core/src/lib/theme/theme-provider.ts` — `providePaTheme`, SSR, fail-safe
  bootstrap
- `libs/core/src/lib/theme/theme.service.ts` — `PaThemeService`
- `libs/core/src/lib/theme/color-derivation.ts` — `deriveTokens`,
  `adjustLightness`, `getContrastColor`, `normalizeColorName`
- `libs/core/src/lib/theme/color-math.ts` — color-space/luminance primitives
- `libs/core/src/lib/theme/semantic-tokens.ts` — `toSemanticCssVariables`
- [CSS Strategy](./css-strategy.md) — the broader 3-layer token system this
  document's runtime piece fits into
