# @halo-ui/input

Accessible, token-driven Angular 19 input component with forms integration.

## Architecture

- **Tokens first** — Every value comes from `var(--ha-input-*)` CSS custom
  properties. Zero hardcoded colors, spacing, or radii.
  `@halo-ui/core/theme.css` ships defaults for all 36 input tokens, so no tokens
  need to be authored by the consumer.
- **Standalone only** — No NgModule. Component is `standalone: true`.
- **Signals first** — All inputs are signals; derived state via `computed()`.
- **CDK over custom** — Uses `FocusMonitor` from `@angular/cdk/a11y` for
  focus-origin tracking (`ha-input--focused` ring, applied on any focus origin —
  mouse, touch, keyboard, or program).
- **ControlValueAccessor** — Forms integration via `NG_VALUE_ACCESSOR`.
  Compatible with both reactive form controls (`[formControl]`,
  `formControlName`) and template-driven `[(ngModel)]`.
- **Native input host** — Selector is `input[ha-input]`. The host IS the native
  `<input>` element, so native semantics, keyboard, focus, and form behaviour
  are inherited for free.

## Setup

Import the foundation theme once (provides the token defaults) and call
`provideHaTheme()` for the runtime color layer:

```ts
import { provideHaTheme } from '@halo-ui/core';
// styles.scss
// @import '@halo-ui/core/theme.css';

bootstrapApplication(App, {
  providers: [provideHaTheme()],
});
```

## Usage

### Basic

```html
<input ha-input />
```

### With a label

Use a native `<label>` with `for` + `id`, or an accessible name via `aria-label`
/ `aria-labelledby`:

```html
<label for="name">Name</label>
<input ha-input id="name" />

<input ha-input aria-label="Search" placeholder="Search..." />
```

### Reactive forms

```ts
import { FormControl } from '@angular/forms';

@Component({ ... })
class Example {
  readonly name = new FormControl<string>('');
}
```

```html
<input ha-input [formControl]="name" aria-label="Name" />
```

### Template-driven forms

```html
<input ha-input [(ngModel)]="name" aria-label="Name" name="name" />
```

### Size, placeholder, disabled, readonly

```html
<input ha-input size="sm" />
<input ha-input size="lg" placeholder="you@example.com" />
<input ha-input [disabled]="true" value="Locked" />
<input ha-input [readonly]="true" value="Read only" />
```

### Error state and hint

When the bound control is `invalid && touched`, the input renders
`.ha-input--error` and sets `aria-invalid="true"`. Wire a hint with
`aria-describedby`:

```html
<label for="email">Email</label>
<input
  ha-input
  id="email"
  [formControl]="email"
  [ariaDescribedBy]="'email-hint'"
/>
<small id="email-hint">We never share your email.</small>
```

## API

The component is text-only — any `type` attribute on the host is overridden to
`"text"`. Password, email, and number inputs are separate components.

| Input             | Type                   | Default | Description                                           |
| ----------------- | ---------------------- | ------- | ----------------------------------------------------- |
| `size`            | `'sm' \| 'md' \| 'lg'` | `'md'`  | Size preset                                           |
| `disabled`        | `boolean`              | `false` | Disabled state (combined with the form control state) |
| `readonly`        | `boolean`              | `false` | Read-only state                                       |
| `placeholder`     | `string`               | `''`    | Placeholder text (attribute removed when empty)       |
| `ariaLabel`       | `string`               | `''`    | Accessible label (`aria-label`)                       |
| `ariaDescribedBy` | `string`               | `''`    | Hint/description ids (`aria-describedby`)             |

## Running unit tests

Run `nx test input` to execute the unit tests.
