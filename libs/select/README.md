# @pa-ui/select

Accessible, token-driven Angular 19 single-select combobox with forms
integration (issue #125).

## Architecture

- **Tokens first** — Every value comes from `var(--pa-select-*)` CSS custom
  properties. Zero hardcoded colors, spacing, or radii. `@pa-ui/core/theme.css`
  ships defaults for all 53 `PA_SELECT_TOKENS` entries, so no tokens need to be
  authored by the consumer.
- **Standalone only** — No NgModule. Component is `standalone: true`.
- **Signals first** — All inputs are signals; derived state via `computed()`.
- **CDK over custom** — Uses `CdkConnectedOverlay` for panel positioning and
  `ActiveDescendantKeyManager` (`@angular/cdk/a11y`) for keyboard navigation,
  active-item tracking, and debounced typeahead. No custom overlay or
  keyboard-handling code.
- **ControlValueAccessor** — Forms integration via `NG_VALUE_ACCESSOR`.
  Compatible with both reactive form controls (`[formControl]`,
  `formControlName`) and template-driven `[(ngModel)]`.
- **Custom element host** — Selector is `pa-select` (unlike `button[pa-button]`
  / `input[pa-input]`, the trigger is a `<button role="combobox">` rendered
  inside the component's own template, not the host element itself).

## Setup

Import the foundation theme once (provides the token defaults) and call
`providePaTheme()` for the runtime color layer:

```ts
import { providePaTheme } from '@pa-ui/core';
// styles.scss
// @import '@pa-ui/core/theme.css';

bootstrapApplication(App, {
  providers: [providePaTheme()],
});
```

## Usage

### Basic

```html
<pa-select
  [options]="fruits"
  placeholder="Select a fruit…"
  ariaLabel="Fruit"
></pa-select>
```

```ts
readonly fruits: PaSelectOption[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry', disabled: true },
];
```

### Reactive forms

```ts
import { FormControl } from '@angular/forms';

@Component({ ... })
class Example {
  readonly fruit = new FormControl<string | null>(null);
}
```

```html
<pa-select [formControl]="fruit" [options]="fruits" ariaLabel="Fruit" />
```

### Template-driven forms

```html
<pa-select
  [(ngModel)]="fruit"
  [options]="fruits"
  name="fruit"
  ariaLabel="Fruit"
/>
```

### Size, placeholder, disabled, readonly

```html
<pa-select [options]="fruits" size="sm" />
<pa-select [options]="fruits" size="lg" placeholder="Choose one" />
<pa-select [options]="fruits" [disabled]="true" />
<pa-select [options]="fruits" [readonly]="true" />
```

`disabled` removes the trigger from the tab order entirely. `readonly` keeps the
trigger focusable/tabbable, but the panel never opens.

### Error state and hint

When the bound control is `invalid && touched`, the trigger renders
`.pa-select--error` and sets `aria-invalid="true"`. Wire a hint with
`aria-describedby`:

```html
<label for="fruit">Fruit</label>
<pa-select
  id="fruit"
  [formControl]="fruit"
  [options]="fruits"
  [ariaDescribedBy]="'fruit-hint'"
/>
<small id="fruit-hint">Required.</small>
```

### `writeValue` with a value not present in `options`

If the bound control's value does not match any `options` entry (e.g. it was set
before the options list loaded), the trigger shows `placeholder` and the
control's value is left untouched — it is not reset to `null`. A later `options`
update that includes a matching value resolves automatically, with no extra
code.

## Keyboard

Follows the WAI-ARIA APG "select-only combobox" pattern via
`ActiveDescendantKeyManager`:

| Key                                         | Precondition                | Result                                                                      |
| ------------------------------------------- | --------------------------- | --------------------------------------------------------------------------- |
| `ArrowDown` / `ArrowUp` / `Enter` / `Space` | closed                      | opens the panel; activates the selected option, or the first enabled option |
| `ArrowDown`                                 | open, active = last option  | wraps the active option to the first enabled option                         |
| `ArrowUp`                                   | open, active = first option | wraps the active option to the last enabled option                          |
| `Home` / `End`                              | open                        | activates the first / last enabled option                                   |
| printable character                         | open                        | jumps to the next option label starting with that character (debounced)     |
| `Enter` / `Space`                           | open, option active         | commits the active option, closes the panel, focus stays on the trigger     |
| `Tab`                                       | open                        | commits the active option, closes the panel, focus moves on                 |
| `Escape` / `Alt+ArrowUp`                    | open                        | closes the panel without committing (Escape) / commits (Alt+ArrowUp)        |

Disabled options are skipped by all navigation. An empty `options` array still
opens (an empty `role="listbox"` panel, no error).

## Accessibility

- Trigger: `role="combobox"`, `aria-haspopup="listbox"`, `aria-expanded`,
  `aria-controls` (panel id), and `aria-activedescendant` while open.
- Panel: `role="listbox"`.
- Options: `role="option"`, `aria-selected`, `aria-disabled` when disabled.
- `disabled` removes the trigger from the tab order; `readonly` keeps it
  focusable but prevents the panel from opening.
- Verified `jest-axe` clean across closed, open (panel rendered), disabled, and
  invalid+touched states.

## API

| Input             | Type                   | Default | Description                                           |
| ----------------- | ---------------------- | ------- | ----------------------------------------------------- |
| `options`         | `PaSelectOption[]`     | `[]`    | Selectable options (`{ label, value, disabled? }`)    |
| `size`            | `'sm' \| 'md' \| 'lg'` | `'md'`  | Size preset                                           |
| `disabled`        | `boolean`              | `false` | Disabled state (combined with the form control state) |
| `readonly`        | `boolean`              | `false` | Read-only state — focusable, panel never opens        |
| `placeholder`     | `string`               | `''`    | Text shown while no option is selected                |
| `ariaLabel`       | `string`               | `''`    | Accessible label (`aria-label`)                       |
| `ariaDescribedBy` | `string`               | `''`    | Hint/description ids (`aria-describedby`)             |

| Output        | Payload   | When                                                 |
| ------------- | --------- | ---------------------------------------------------- |
| `valueChange` | `unknown` | An option is committed (Enter/Space/Tab/Alt+ArrowUp) |
| `opened`      | `void`    | The panel transitions to open                        |
| `closed`      | `void`    | The panel transitions to closed                      |

## Running unit tests

Run `nx test select` to execute the unit tests.
