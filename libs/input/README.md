# @pa-ui/input

Standalone Angular 19 input component — type variants, sizes, disabled,
readonly, error, and hint/label states. Token-driven styling via CSS custom
properties with CDK a11y primitives and full `ControlValueAccessor` forms
integration.

## Architecture

- **Tokens first** — Every value comes from `var(--pa-input-*)` CSS custom
  properties. Zero hardcoded colors, spacing, or radii.
- **Standalone only** — No NgModule. Component is `standalone: true`.
- **Signals first** — All inputs are signals; computed state via `computed()`.
- **CDK over custom** — Uses Angular CDK a11y primitives for focus-origin
  tracking and focus ring management.
- **ControlValueAccessor** — Native forms integration via `NG_VALUE_ACCESSOR`.
  Compatible with both `[(ngModel)]` and reactive form controls.

## Usage

```html
<input pa-input />

<input pa-input size="lg" type="email" placeholder="Your email" />

<input pa-input [disabled]="true" value="Can't touch this" />

<input pa-input [readonly]="true" value="Read only" />
```

## API

| Input      | Type                                          | Default  | Description       |
| ---------- | --------------------------------------------- | -------- | ----------------- |
| `size`     | `'sm' \| 'md' \| 'lg'`                        | `'md'`   | Size preset       |
| `type`     | `'text' \| 'password' \| 'email' \| 'number'` | `'text'` | Native input type |
| `disabled` | `boolean`                                     | `false`  | Disabled state    |
| `readonly` | `boolean`                                     | `false`  | Readonly state    |

## Running unit tests

Run `nx test input` to execute the unit tests.
