# @pa-ui/core

## 19.2.2

### Patch Changes

- 7a72d32: Fix PaInput error tokens referencing the deprecated `--pa-danger`
  alias instead of the canonical `--pa-error` semantic token. A consumer calling
  `providePaTheme({ colors: { error: '#custom' } })` now recolors the input
  error border, text, and icon consistently with every other error surface.

## 19.2.1

## 19.2.0

### Minor Changes

- de29d2e: Add `--pa-input-*` component-token defaults to `theme.css`, consumed
  by the new `PaInput` component (per-size radius tokens, focus border). Input
  dimensions are assistant-authored provisional values pending design
  validation.

## 19.1.0

### Patch Changes

- fa81f68: Publish the default theme palette, Foundation tokens, and Button
  color and dimension updates.
- baf595b: Fix the release pipeline so npm publishes come from the ng-packagr
  `dist/` output instead of each library's source `package.json`. Previously
  published versions of `@pa-ui/button`, `@pa-ui/core`, `@pa-ui/input`, and
  `@pa-ui/angular` were missing `main`/`module`/`exports`/`typings`, making them
  unresolvable by any consumer (`TS2307: Cannot find module`). This releases the
  first consumable build of all four packages.

## 19.1.0-alpha.3

### Patch Changes

- baf595b: Fix the release pipeline so npm publishes come from the ng-packagr
  `dist/` output instead of each library's source `package.json`. Previously
  published versions of `@pa-ui/button`, `@pa-ui/core`, `@pa-ui/input`, and
  `@pa-ui/angular` were missing `main`/`module`/`exports`/`typings`, making them
  unresolvable by any consumer (`TS2307: Cannot find module`). This releases the
  first consumable build of all four packages.

## 19.1.0-alpha.2

### Patch Changes

- fa81f68: Publish the default theme palette, Foundation tokens, and Button
  color and dimension updates.

## 19.1.0-alpha.1

### Minor Changes

- 20a9d22: feat(packaging): restructure with public core + umbrella re-exports
  (MUI/Ant Design pattern)

  - @pa-ui/core stays public with @pa-ui/button removed from peerDependencies
  - @pa-ui/button and @pa-ui/input now declare @pa-ui/core in dependencies
  - Created @pa-ui/angular umbrella package re-exporting core, button, and input
  - ThemeService is shared via npm deduplication (single instance guaranteed)

## 19.0.0-alpha.0

### Minor Changes

- 0ed71ab: Initial alpha release of pa-ui component library

### Patch Changes

- Updated dependencies [0ed71ab]
  - @pa-ui/button@19.0.0-alpha.0
