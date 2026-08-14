# pa-ui

> Accessible, token-driven Angular 19 component library with a 3-layer CSS
> variable architecture.

[![npm version](https://img.shields.io/npm/v/pa-ui)](https://www.npmjs.com/package/@pa-ui/angular)
[![license](https://img.shields.io/github/license/JosepFernande/pa-ui)](./LICENSE)
[![build](https://img.shields.io/github/actions/workflow/status/JosepFernande/pa-ui/ci.yml?label=build)](https://github.com/JosepFernande/pa-ui/actions)

---

## Quick Start — Under 5 Minutes

### 1. Install

```bash
npm install @pa-ui/button @angular/cdk
```

### 2. Configure the Theme Engine

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { providePaTheme } from '@pa-ui/core';

export const appConfig: ApplicationConfig = {
  providers: [
    providePaTheme(), // default theme — works out of the box
  ],
};
```

### 3. Import the Foundation CSS

One explicit CSS import, in addition to `providePaTheme()`, is required consumer
setup — it ships the static Foundation/Semantic/Component defaults (spacing,
radius, typography, icon sizes, component-token defaults) that make `PaButton`
render fully styled out of the box:

```css
/* styles.css (or any global stylesheet entry point) */
@import '@pa-ui/core/theme.css';
```

Forgetting this import does not break the app — components fall back to unstyled
`--pa-*` custom properties until it is added. See
[CSS Strategy](./docs/css-strategy.md) for the full layering and distribution
rationale.

### 4. Use a Component

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { PaButton } from '@pa-ui/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PaButton],
  template: `
    <button pa-button>Solid Primary</button>
    <button pa-button variant="outline" color="danger">Outline Danger</button>
    <button pa-button variant="ghost" size="sm" [loading]="isLoading()">
      Ghost Loading
    </button>
  `,
})
export class AppComponent {
  isLoading = signal(false);
}
```

`PaInput` follows the same pattern — it's a host directive on the native
`<input>` element, so it wires directly into Angular forms:

```typescript
import { PaInput } from '@pa-ui/input';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';

@Component({
  imports: [PaInput, ReactiveFormsModule],
  template: `<input
    pa-input
    [formControl]="email"
    placeholder="you@company.com"
  />`,
})
export class LoginFormComponent {
  email = new FormControl('', { validators: Validators.required });
}
```

That's it. No NgModules, no configuration required — just the one CSS import
above.

---

## Architecture Highlights

| Principle                  | What it means                                                                    |
| -------------------------- | -------------------------------------------------------------------------------- |
| **Standalone only**        | Every component is `standalone: true`. No NgModules, ever.                       |
| **Signals first**          | Reactive state via Angular Signals. RxJS reserved for streams and async events.  |
| **3-layer token system**   | Foundation → Semantic → Component. Zero hardcoded values in component CSS.       |
| **CSS Variables**          | Theming via native CSS custom properties. No SCSS mixins, no utility frameworks. |
| **Accessibility with CDK** | `FocusMonitor`, `FocusTrap`, `Overlay` — Angular CDK handles the hard parts.     |
| **Tree-shakable**          | `sideEffects: false` on every package. Import only what you use.                 |
| **ViewEncapsulation.None** | Full CSS customization from your app. Override any token at any scope.           |

### 3-Layer Token Architecture

```
Foundation           Semantic              Component
─────────            ─────────             ─────────
--blue-500      →    --pa-primary     →    --pa-button-bg
--gray-100      →    --pa-surface     →    --pa-button-color
--radius-2      →    --pa-border      →    --pa-button-radius
--spacing-4     →    --pa-text        →    --pa-button-padding-md
```

Components consume **only** semantic and component tokens. Foundation tokens are
off-limits inside component CSS. This separation means you can rebrand the
entire library by changing semantic mappings — without touching a single
component.

---

## Theme Engine

The Theme Engine (`providePaTheme()`) is the single entry point for all visual
customization.

### Default Theme (zero config)

```typescript
import { providePaTheme } from '@pa-ui/core';

export const appConfig: ApplicationConfig = {
  providers: [providePaTheme()],
};
```

### Custom Colors

Register domain-specific colors. The engine auto-derives hover, active, and
contrast variants.

```typescript
providePaTheme({
  colors: {
    primary: { 500: '#0066cc' },
    secondary: { 500: '#6c757d' },
    treasury: { 500: '#0d6efd' },
    danger: { 500: '#dc3545' },
  },
});
```

Then use them in any component:

```html
<button pa-button color="treasury">Treasury Action</button>
<button pa-button variant="outline" color="danger">Delete</button>
```

### Exact Theme (no defaults)

Use `extendDefaults: false` when you want full control — only your colors are
registered.

```typescript
providePaTheme({
  extendDefaults: false,
  colors: {
    primary: { 500: '#1a1a2e' },
    secondary: { 500: '#16213e' },
    accent: { 500: '#e94560' },
  },
});
```

---

## Customization

### Override CSS Tokens

Every visual property is a CSS custom property. Override at any scope:

```css
/* Global — affects all buttons */
:root {
  --pa-button-radius: 8px;
  --pa-button-font-weight: 600;
}

/* Scoped — affects buttons inside .admin-panel only */
.admin-panel {
  --pa-button-bg: var(--pa-treasury);
  --pa-button-hover-bg: color-mix(in srgb, var(--pa-treasury) 85%, black);
}
```

### Add Custom Colors Without Modifying Components

The `color` input on every component is a `string` (theme-registered), never a
closed enum. Register a new color in the theme and it works everywhere:

```typescript
providePaTheme({
  colors: {
    accounting: { 500: '#28a745' },
  },
});
```

```html
<button pa-button color="accounting">Approve</button>
```

No component changes. No new variants. The Theme Engine derives hover, active,
and disabled states automatically.

> See [CSS Strategy](./docs/css-strategy.md) for the full token reference and
> override patterns.

---

## Accessibility

Every pa-ui component is built with accessibility as a first-class concern:

- **Keyboard navigation** — All interactive elements are reachable and operable
  via keyboard. CDK `FocusMonitor` tracks focus origin to show visible focus
  rings only for keyboard users.
- **ARIA attributes** — Correct `role`, `aria-disabled`, `aria-busy`, and other
  ARIA states are applied automatically.
- **Focus management** — Components use CDK `FocusTrap` for overlays and modals.
  Focus is never lost during state changes.
- **Screen reader support** — Loading states use visually-hidden text (`sr-only`
  pattern) so screen readers announce state changes.
- **`prefers-reduced-motion`** — Animations respect the user's motion
  preference.

> See the [Testing Strategy](./docs/testing-strategy.md) doc for the full a11y
> checklist and testing approach.

---

## Phase 1 Components

| Package         | Component  | Status        | Description                                                              |
| --------------- | ---------- | ------------- | ------------------------------------------------------------------------ |
| `@pa-ui/button` | `PaButton` | **Available** | Button with variants, sizes, color, disabled, and loading states         |
| `@pa-ui/input`  | `PaInput`  | **Available** | Text-only input with sizes, disabled/readonly, and CVA forms integration |

### PaButton API

```html
<button
  pa-button
  variant="solid"
  size="md"
  color="primary"
  [disabled]="false"
  [loading]="false"
  type="button"
>
  Click me
</button>
```

| Input      | Type                              | Default     | Description                         |
| ---------- | --------------------------------- | ----------- | ----------------------------------- |
| `variant`  | `'solid' \| 'outline' \| 'ghost'` | `'solid'`   | Visual variant                      |
| `size`     | `'sm' \| 'md' \| 'lg'`            | `'md'`      | Size preset                         |
| `color`    | `string`                          | `'primary'` | Theme-registered color name         |
| `disabled` | `boolean`                         | `false`     | Disabled state                      |
| `loading`  | `boolean`                         | `false`     | Shows spinner, disables interaction |
| `type`     | `'button' \| 'submit' \| 'reset'` | `'button'`  | Native button type                  |

### PaInput API

```html
<input pa-input size="md" placeholder="you@company.com" [formControl]="email" />
```

| Input             | Type                   | Default | Description                                           |
| ----------------- | ---------------------- | ------- | ----------------------------------------------------- |
| `size`            | `'sm' \| 'md' \| 'lg'` | `'md'`  | Size preset                                           |
| `disabled`        | `boolean`              | `false` | Disabled state (also driven by a bound `FormControl`) |
| `readonly`        | `boolean`              | `false` | Read-only state                                       |
| `placeholder`     | `string`               | `''`    | Placeholder text                                      |
| `ariaLabel`       | `string`               | `''`    | Accessible label (`aria-label`)                       |
| `ariaDescribedBy` | `string`               | `''`    | Ids for `aria-describedby` (e.g. hint/error text)     |

`PaInput` is text-only by design — password, email, and number inputs are
planned as separate components. It implements `ControlValueAccessor`, so a
touched, invalid `FormControl` automatically drives `.pa-input--error` and
`aria-invalid`; there is no separate `error` input to set manually.

```typescript
import { PA_INPUT_TOKENS } from '@pa-ui/input';

// Available tokens: --pa-input-bg, --pa-input-color, --pa-input-border,
// --pa-input-focus-border, --pa-input-error-border, --pa-input-disabled-bg, ...
```

---

## Project Structure

```
pa-ui/
├── libs/
│   ├── button/          # @pa-ui/button — PaButton component
│   ├── input/           # @pa-ui/input — PaInput component
│   ├── core/            # @pa-ui/core — Theme Engine (providePaTheme) + Foundation layer
│   └── pa-ui/           # pa-ui — Umbrella package (re-exports)
├── apps/
│   └── showcase/        # Demo app with live examples
└── skills/              # AI agent skills for architecture enforcement
```

> See [Components](./docs/components.md) for the full component catalog, each
> linked to its `libs/` folder.

---

## Documentation

`docs/` in this repo is the source of truth for architecture, testing, and
process docs, and the one guaranteed to be available to anyone (or any AI agent)
cloning the repo without network access. The
[project wiki](https://github.com/JosepFernande/pa-ui/wiki) is kept as a
historical mirror going forward; new documentation changes land in `docs/`
first.

| Resource                                                                         | Description                                               |
| -------------------------------------------------------------------------------- | --------------------------------------------------------- |
| [Components](./docs/components.md)                                               | Component catalog, each linked to its `libs/` folder      |
| [Architecture & Foundation](./docs/architecture-and-foundation.md)               | The 6 hard rules, token system, and decision gates        |
| [Theming Deep-Dive](./docs/theming-deep-dive.md)                                 | Full technical reference for the Theme Engine             |
| [ControlValueAccessor (CVA)](./docs/control-value-accessor-cva.md)               | How components integrate with Angular forms               |
| [Testing Strategy](./docs/testing-strategy.md)                                   | Testing levels, coverage, and accessibility checklist     |
| [Showcase](./docs/showcase.md)                                                   | Component playground app in `apps/showcase/`              |
| [CI/CD Pipeline](./docs/ci-cd-pipeline.md)                                       | GitHub Actions workflows                                  |
| [Release and Publishing](./docs/release-and-publishing.md)                       | npm publishing, Trusted Publishing                        |
| [Contribution & PR Guidelines](./docs/contribution-pr-code-review-guidelines.md) | How to contribute and what gets reviewed in a PR          |
| [CSS Strategy](./docs/css-strategy.md)                                           | Token reference and override patterns                     |
| [Showcase App](./apps/showcase/)                                                 | Live component playground                                 |
| [Contributing](./CONTRIBUTING.md)                                                | How to contribute, PR guidelines, and code review process |

---

## Development

```bash
# Install dependencies
npm install

# Build all libraries
nx run-many -t build

# Run tests
nx run-many -t test

# Lint
nx run-many -t lint
nx run lint:css

# Format check
npm run format:check
```

### Showcase

```bash
# Start the dev server
npx nx serve showcase

# Build it
npx nx build showcase
```

See [docs/showcase.md](./docs/showcase.md) for how to add a route for a new
component.

---

## License

MIT &copy; [JosepFernande](https://github.com/JosepFernande)
