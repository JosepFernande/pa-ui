# @pa-ui/select

## 19.3.1

### Patch Changes

- 6a8f96a: Switch the `button`/`input`/`select` focus-ring tokens from
  `box-shadow` to `outline` + `outline-offset` for consistent keyboard-only
  focus styling, and fix select trigger sizing/interaction (stale overlay width
  on open, missing open-state border on click, option mousedown stealing trigger
  focus, hover overriding selected/active option styling).
- Updated dependencies [6a8f96a]
  - @pa-ui/core@19.3.1

## 19.3.0

### Minor Changes

- a2e5582: Add `<pa-select>` (issue #125, alternative 1): standalone,
  signals-first, token-driven single-select with `ControlValueAccessor` forms
  integration, CDK Overlay panel, WAI-ARIA select-only combobox semantics, full
  keyboard navigation including typeahead, and `readonly` distinct from
  `disabled`. `--pa-select-*` defaults ship via `@pa-ui/core/theme.css`, so no
  consumer tokens are required.

### Patch Changes

- Updated dependencies [a2e5582]
  - @pa-ui/core@19.3.0
