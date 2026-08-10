# @pa-ui/select

Accessible, token-driven Angular 19 single-select combobox with forms
integration (issue #125).

> Work in progress: this README will be finalized once overlay, keyboard
> navigation, and packaging wiring land (see the `pa-select` SDD change).

## Architecture

- **Tokens first** — Every value comes from `var(--pa-select-*)` CSS custom
  properties. `@pa-ui/core/theme.css` ships defaults for all `PA_SELECT_TOKENS`
  entries.
- **Standalone only** — No NgModule. Component is `standalone: true`.
- **Signals first** — All inputs are signals; derived state via `computed()`.
- **CDK over custom** — Uses Angular CDK Overlay and
  `ActiveDescendantKeyManager` for panel positioning and keyboard navigation.
- **ControlValueAccessor** — Forms integration via `NG_VALUE_ACCESSOR`.
  Compatible with both reactive form controls (`[formControl]`,
  `formControlName`) and template-driven `[(ngModel)]`.

## Running unit tests

Run `nx test select` to execute the unit tests.
