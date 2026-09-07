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

`@halolib-ui/button` only renders correctly when both theming pieces from
`@halolib-ui/core` are set up:

```ts
// app.config.ts
providers: [provideHaTheme()];
```

```css
/* styles.css (global stylesheet) */
@import '@halolib-ui/core/theme.css';
```

`provideHaTheme()` alone only writes the runtime color variables. The `@import`
is required for padding, font-size, min-height, gap, and radius — without it the
button renders with correct colors but looks "half broken" (no
padding/height/font/gap/radius), with no error in the console.

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
