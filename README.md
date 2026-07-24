# pa-ui

> Accessible, token-driven Angular 19 component library with a 3-layer CSS
> variable architecture.

[![npm version](https://img.shields.io/npm/v/pa-ui)](https://www.npmjs.com/package/pa-ui)
[![license](https://img.shields.io/github/license/JosepFernande/pa-ui)](./LICENSE)
[![build](https://img.shields.io/github/actions/workflow/status/JosepFernande/pa-ui/ci.yml?label=build)](https://github.com/JosepFernande/pa-ui/actions)

---

## Quick Start — Under 5 Minutes

### 1. Install

```bash
npm install pa-ui @pa-ui/button @angular/cdk
```

### 2. Configure the Theme Engine

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { providePaTheme } from '@pa-ui/themes';

export const appConfig: ApplicationConfig = {
  providers: [
    providePaTheme(), // default theme — works out of the box
  ],
};
```

### 3. Use a Component

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

That's it. No NgModules, no global styles to import, no configuration required.

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
import { providePaTheme } from '@pa-ui/themes';

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

> See [Accessibility Documentation](./docs/accessibility.md) for the full a11y
> checklist and testing approach.

---

## Phase 1 Components

| Package         | Component  | Status           | Description                                                      |
| --------------- | ---------- | ---------------- | ---------------------------------------------------------------- |
| `@pa-ui/button` | `PaButton` | **Available**    | Button with variants, sizes, color, disabled, and loading states |
| `@pa-ui/input`  | `PaInput`  | **Tokens ready** | Text input with label, hint, error, and validation states        |

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

### PaInput Tokens

The input component tokens are defined and ready for implementation:

```typescript
import { PA_INPUT_TOKENS } from '@pa-ui/input';

// Available tokens: --pa-input-bg, --pa-input-color, --pa-input-border,
// --pa-input-radius, --pa-input-focus-ring, --pa-input-error-border, ...
```

---

## Project Structure

```
pa-ui/
├── libs/
│   ├── button/          # @pa-ui/button — PaButton component
│   ├── input/           # @pa-ui/input — Input tokens and types
│   ├── pa-ui/           # pa-ui — Umbrella package (re-exports)
│   ├── themes/          # @pa-ui/themes — Theme Engine (providePaTheme)
│   ├── tokens/          # @pa-ui/tokens — Foundation & semantic tokens
│   ├── core/            # @pa-ui/core — Shared utilities and CDK wrappers
│   ├── styles/          # @pa-ui/styles — Base styles and resets
│   └── utils/           # @pa-ui/utils — Pure helper functions
├── apps/
│   └── showcase/        # Demo app with live examples
└── skills/              # AI agent skills for architecture enforcement
```

---

## Documentation

| Resource                                                                              | Description                                               |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| [Architecture & Foundation](https://github.com/JosepFernande/pa-ui/wiki/Architecture) | The 6 hard rules, token system, and decision gates        |
| [CSS Strategy](./docs/css-strategy.md)                                                | Token reference, override patterns, and theming guide     |
| [Accessibility](./docs/accessibility.md)                                              | A11y checklist, ARIA patterns, and testing approach       |
| [Storybook](./docs/storybook.md)                                                      | Running Storybook locally and adding a new story          |
| [Showcase App](./apps/showcase/)                                                      | Live component playground                                 |
| [Contributing](./CONTRIBUTING.md)                                                     | How to contribute, PR guidelines, and code review process |

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

### Storybook

```bash
# Start the dev server (http://localhost:4400)
npx nx run showcase:storybook

# Build the static site (output: dist/storybook/showcase/)
npx nx run showcase:build-storybook
```

See [docs/storybook.md](./docs/storybook.md) for how to add a new story.

---

## License

MIT &copy; [JosepFernande](https://github.com/JosepFernande)
