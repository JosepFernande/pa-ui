# @pa-ui/button

Standalone Angular 19 button component — variants, sizes, color, disabled, and loading states. Token-driven styling via CSS custom properties with CDK a11y primitives.

## Architecture

- **Tokens first** — Every value comes from `var(--pa-button-*)` CSS custom properties. Zero hardcoded colors, spacing, or radii.
- **Standalone only** — No NgModule. Component is `standalone: true`.
- **Signals first** — All inputs are signals; computed state via `computed()`.
- **CDK over custom** — Uses `FocusMonitor` from `@angular/cdk/a11y` for focus-origin tracking.
- **Native button host** — Selector is `button[pa-button]`. Free semantics, keyboard, focus, and form integration.

## Usage

```html
<button pa-button>Solid Primary</button>
<button pa-button variant="outline" color="danger">Outline Danger</button>
<button pa-button variant="ghost" size="sm" loading>Small Ghost Loading</button>
```

## API

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `variant` | `'solid' \| 'outline' \| 'ghost'` | `'solid'` | Visual variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size preset |
| `color` | `string` | `'primary'` | Theme color (maps to `var(--pa-{color})`) |
| `disabled` | `boolean` | `false` | Disabled state |
| `loading` | `boolean` | `false` | Loading state (shows spinner, suppresses click) |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Native button type |

## Running unit tests

Run `nx test button` to execute the unit tests.
