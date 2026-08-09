# Architecture & Foundation

This is the deep reference for `pa-ui`'s architecture: the project vision, the
monorepo layout, the token system, and the design constraints behind every
component. For the day-to-day operational contract (the six hard rules, decision
gates, execution checklist) used when implementing or reviewing a change, see
the `pa-ui-architecture` skill (`skills/pa-ui-architecture/SKILL.md`) — this
document does not duplicate that checklist, only the reasoning and the deeper
structural detail behind it.

## Project Vision

Build an Angular component library focused on:

- minimalism
- modern architecture
- excellent DX
- high customizability
- performance
- accessibility
- consistent APIs
- token-based theming

The library aims to differentiate itself through modern APIs, Signals-first
design, clean DX, reduced complexity, flexible theming, visual consistency, and
a light bundle.

## Tech Stack

**Core:** Angular 19+, standalone components, Signals, CSS variables, TypeScript
strict mode.

**Tools:** Angular CDK and Storybook for the UI foundation, Nx for the
workspace, ng-packagr for packaging.

## Architecture Philosophy

The six hard rules (tokens first, standalone only, Signals first, CSS variables
first, CDK over custom, consistent APIs) are the non-negotiable contract for
every component — see the `pa-ui-architecture` skill for the full rule text, the
decision gates, and the verification checklist. They are not repeated here to
avoid drift between two copies of the same rule.

## Monorepo Architecture

Current state:

```
apps/
 └── showcase/

libs/
 ├── core/       (includes foundation/ and theme/ — see below)
 ├── button/
 ├── input/
 └── pa-ui/      (umbrella package @pa-ui/angular, re-exports button/core/input)
```

Roadmap — planned libs, not yet scaffolded:

```
libs/
 ├── tokens/     (today: libs/core/src/lib/foundation/)
 ├── utils/
 ├── styles/
 ├── icons/
 │
 ├── badge/
 ├── avatar/
 ├── spinner/
 │
 ├── overlay/
 ├── dialog/
 ├── tooltip/
 ├── dropdown/
 ├── toast/
 │
 ├── forms/
 ├── accessibility/
 └── testing/
```

<!-- TODO(verify): this roadmap list is a forward-looking product plan, not
something the current code can confirm or deny — treat it as directional,
not committed scope. -->

## Responsibility of Each Package

### `core`

Real responsibilities today:

- Theme Engine (`core/theme/`)
- Foundation tokens (`core/foundation/`)
- Global services, injection tokens, global configuration
- Shared abstractions

`core` must NOT contain visual components.

### `core/foundation`

Foundation tokens (color scales, spacing, radius, typography) and the generation
of the base CSS variables. Lives inside `core/`, not as its own lib — a
dedicated `tokens/` lib is roadmap, not current state.

### `core/theme` (Theme Engine)

```
libs/
 └── core/
     └── theme/
         ├── theme-engine.ts     # mergeTheme() — pure config/defaults merge
         ├── theme-provider.ts   # providePaTheme() — DI registration, SSR, fail-safe bootstrap
         ├── theme.tokens.ts     # DEFAULT_THEME, PA_THEME_TOKEN, types
         ├── theme.service.ts    # PaThemeService — runtime mutation API
         ├── color-derivation.ts # deriveTokens() — HSL derivation policy
         ├── color-math.ts       # pure color-space/luminance primitives
         └── semantic-tokens.ts  # toSemanticCssVariables() adapter
```

This is the real current file layout (`libs/core/src/lib/theme/`), split further
than the original file-structure plan into a pure derivation layer
(`color-derivation.ts`, `color-math.ts`, `semantic-tokens.ts`) plus the
Angular-facing `theme-provider.ts`/`theme.service.ts`. See
[Theming Deep-Dive](./theming-deep-dive.md) for the full runtime behavior.

Responsibilities: register themes, merge user configuration, generate derived
tokens, expose tokens as CSS variables. Ships one official theme today
(`DEFAULT_THEME`); named, switchable themes (`dark`, `corporate`) are roadmap —
see "Theming Evolution" below.

### `styles`, `utils`, `overlay` (roadmap)

Planned as their own libs, not yet scaffolded:

- `styles` — CSS reset, typography, animations, minimal utility helpers
- `utils` — helpers, composables, DOM and keyboard utilities
- `overlay` — overlay abstractions, positioning, portal rendering, built on
  Angular CDK Overlay

## Component Structure

Real structure of `libs/button/` (verified against the repo):

```
libs/button/
 ├── src/
 │   ├── lib/
 │   │   ├── button.component.ts
 │   │   ├── button.component.html
 │   │   ├── button.component.css
 │   │   ├── button.component.spec.ts
 │   │   ├── button.types.ts
 │   │   ├── button.types.spec.ts
 │   │   ├── button.tokens.ts
 │   │   ├── button.tokens.spec.ts
 │   │   ├── button.stories.ts
 │   │   └── theme-runtime.integration.spec.ts
 │   │
 │   ├── index.ts
 │   └── public-api.ts
 │
 ├── README.md
 └── project.json
```

There is no `button.constants.ts` or `button.utils.ts` today — no separate
convention for constants or utilities exists yet; that content, when it applies,
lives in `*.tokens.ts` or directly in the component. (The
`pa-ui-coding-standards` skill documents `.constants.ts`/`.utils.ts` as part of
the target file layout for future components with that need — it is not
contradicted by their absence in `button`/`input` today.)

## Naming Convention

### Prefix and selector shape

Every component uses the `pa-` prefix. In practice, the two shipped components
attach as **attribute selectors on the semantically closest native element**,
not as custom elements:

```html
<button pa-button>Save</button> <input pa-input />
```

This is a correction to the original architecture plan, which assumed custom
elements (`<pa-button />`, `<pa-input />`). The real selectors are
`button[pa-button]` (`libs/button/src/lib/button.component.ts:17`) and
`input[pa-input]` (`libs/input/src/lib/input.component.ts:44`) — the host IS the
native element, so keyboard behavior, forms integration, and native semantics
are inherited for free instead of reimplemented behind a wrapper.

<!-- TODO(verify): whether future components with no native element
equivalent (dialog, dropdown, tooltip, toast) will keep this attribute-
selector-on-native-element pattern where a native element fits, or introduce
true custom elements (`<pa-dialog>`) where none does, is an open
architecture decision — not something the current two components answer. -->

## Standard Variants

- **size**: `sm | md | lg`
- **variant**: `solid | outline | ghost`

Both are closed unions in the real types (`PaButtonSize`, `PaButtonVariant`,
`PaInputSize` in `libs/button/src/lib/button.types.ts` and
`libs/input/src/lib/input.types.ts`).

`color` is **not** a closed variant — it is typed `string` and resolved by the
Theme Engine at runtime (hard rule 6, consistent APIs). The names below are the
_default theme's_ color roster, not an enum a component enforces:

```
dark-blue, light-blue, dark-green, light-green,
primary, secondary,
success, error, warning, alert, info, neutral,
danger   (deprecated, alias of error)
```

The literal names (`dark-blue`, `light-blue`, `dark-green`, `light-green`) map
1:1 to Figma/JSON and coexist with the semantic aliases `primary`/ `secondary`
(same color pair each, with an explicit inverted hover: `light-*` as base,
`dark-*` as hover). `danger` remains as a deprecated alias of `error` (identical
hex) for backward compatibility — do not use it in new code. See
[Theming Deep-Dive](./theming-deep-dive.md) for the full derivation algorithm
and hex values.

## Tokens Architecture

Three layers — Foundation → Semantic → Component. See
[CSS Strategy](./css-strategy.md) for the authoritative reference (layer
definitions, the two delivery pipelines, and the full default color roster) and
[Theming Deep-Dive](./theming-deep-dive.md) for the Theme Engine's runtime
derivation. Components consume **only** semantic and component tokens — never
Foundation tokens directly.

## Architectural Constraints

**Forbidden:**

- Hardcoded styles (`background: blue;` instead of a token)
- Shared mutable state
- Invasive global CSS
- Oversized components (hard cap: 300–400 lines per component, per the
  `pa-ui-architecture` skill's decision gates)
- Visual logic mixed with business logic
- Unnecessary dependencies (avoid `lodash` and other heavy libraries)

## Component Philosophy

Components should be composable, accessible, minimal, predictable, and
consistent.

## Performance Goals

Tree-shakable, lazy-load friendly, Signals-first, minimal change detection, no
unnecessary dependencies. Every publishable package declares
`sideEffects: false`.

## Accessibility

Every component must include keyboard navigation, ARIA support, focus
management, and screen-reader support, built on Angular CDK a11y primitives
(`FocusMonitor`, `FocusTrap`, `LiveAnnouncer`). See
[Testing Strategy](./testing-strategy.md) for the accessibility testing
checklist.

## Documentation Strategy

Every component must have Storybook examples covering variants, playground
controls, states, and accessibility notes. See [Storybook](./storybook.md) for
the real (centralized) Storybook setup.

## DX Philosophy

Clean APIs are the top priority:

```html
<button pa-button variant="solid" color="primary" size="md">Save</button>
```

It should feel intuitive, consistent, elegant, and modern.

## Ultimate Goal

Build an Angular library that is modern, maintainable, enterprise-ready, highly
reusable, visually consistent, and focused on an excellent developer experience.

## Theming Evolution

### Principles

The library ships one official default theme, but the architecture is designed
from the start to allow extension without modifying components. Goals: a
ready-to-use official theme, extensible theming, CSS-variable-based performance,
no mass CSS class generation, no closed color enums.

### Default Theme

```typescript
providePaTheme();
```

If the consumer configures nothing, this resolves the shipped `DEFAULT_THEME`
roster automatically. Named, switchable future themes (`dark-theme`,
`corporate-theme`) are roadmap — see "Multi-theme (future)" in
[Theming Deep-Dive](./theming-deep-dive.md) for the precise current boundary (no
"theme name" concept exists in the code today).

### Dynamic Colors

Forbidden — components must never hardcode a closed color union:

```typescript
// Wrong
export type ButtonColor = 'primary' | 'success' | 'warning' | 'danger';
```

Correct — components must not know about specific colors:

```typescript
color = input('primary'); // type: string
```

Valid colors are defined by the Theme Engine, not by the component.

### Extensible Configuration

```typescript
providePaTheme({
  colors: {
    primary: '#2563eb',
    treasury: '#7c3aed',
    accounting: '#059669',
  },
});
```

Components must work automatically with any registered color — see
[Theming Deep-Dive](./theming-deep-dive.md) for exactly how hover, active, and
contrast variants are derived, and for the explicit-variant-override escape
hatch.

### Global Component Configuration (future)

```typescript
providePaComponents({
  button: {
    defaultVariant: 'solid',
    defaultSize: 'md',
  },
});
```

<!-- TODO(verify): `providePaComponents()` does not exist in the codebase
today — this is a forward-looking design sketch from the original wiki page,
not an implemented or scheduled API. -->
