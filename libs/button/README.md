# @halolib-ui/button

Standalone Angular 19 button component — variants, sizes, color, disabled, and
loading states. Token-driven styling via CSS custom properties with CDK a11y
primitives.

## Architecture

- **Tokens first** — Every value comes from `var(--ha-button-*)` CSS custom
  properties. Zero hardcoded colors, spacing, or radii.
- **Standalone only** — No NgModule. Component is `standalone: true`.
- **Signals first** — All inputs are signals; computed state via `computed()`.
- **CDK over custom** — Uses `FocusMonitor` from `@angular/cdk/a11y` for
  focus-origin tracking.
- **Native button host** — Selector is `button[ha-button]`. Free semantics,
  keyboard, focus, and form integration.

## Usage

`@halolib-ui/button` renders correctly once `provideHaTheme()` from
`@halolib-ui/core` is registered — no additional CSS import is required:

```ts
// app.config.ts
providers: [provideHaTheme()];
```

`provideHaTheme()` writes every CSS custom property Button consumes — colors,
padding, font-size, min-height, gap, and radius — via the runtime Theme Engine.

```html
<button ha-button>Solid Primary</button>
<button ha-button variant="outline" color="danger">Outline Danger</button>
<button ha-button variant="ghost" size="sm" loading>Small Ghost Loading</button>
```

## API

| Input      | Type                              | Default     | Description                                     |
| ---------- | --------------------------------- | ----------- | ----------------------------------------------- |
| `variant`  | `'solid' \| 'outline' \| 'ghost'` | `'solid'`   | Visual variant                                  |
| `size`     | `'sm' \| 'md' \| 'lg'`            | `'md'`      | Size preset                                     |
| `color`    | `string`                          | `'primary'` | Theme color (maps to `var(--ha-{color})`)       |
| `disabled` | `boolean`                         | `false`     | Disabled state                                  |
| `loading`  | `boolean`                         | `false`     | Loading state (shows spinner, suppresses click) |
| `type`     | `'button' \| 'submit' \| 'reset'` | `'button'`  | Native button type                              |

## Running unit tests

Run `nx test button` to execute the unit tests.
