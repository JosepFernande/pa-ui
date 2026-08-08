# @pa-ui/input

## 19.2.1

### Patch Changes

- @pa-ui/core@19.2.1

## 19.2.0

### Minor Changes

- de29d2e: Implement the real `pa-input` component (issue #106, alternative 1):
  standalone, signals-first, token-driven Angular 19 **text-only** input with
  `ControlValueAccessor` forms integration
  (`[formControl]`/`formControlName`/`[(ngModel)]`), CDK `FocusMonitor` focus
  ring (any origin), error state (`invalid && touched` → `.pa-input--error` +
  `aria-invalid`), and accessible-name support (`aria-label`,
  `aria-describedby`). Password, email, and number inputs are separate
  components. `--pa-input-*` defaults ship via `@pa-ui/core/theme.css`, so no
  consumer tokens are required.

### Patch Changes

- Updated dependencies [de29d2e]
  - @pa-ui/core@19.2.0

## 19.1.0

### Patch Changes

- baf595b: Fix the release pipeline so npm publishes come from the ng-packagr
  `dist/` output instead of each library's source `package.json`. Previously
  published versions of `@pa-ui/button`, `@pa-ui/core`, `@pa-ui/input`, and
  `@pa-ui/angular` were missing `main`/`module`/`exports`/`typings`, making them
  unresolvable by any consumer (`TS2307: Cannot find module`). This releases the
  first consumable build of all four packages.
- Updated dependencies [fa81f68]
- Updated dependencies [baf595b]
  - @pa-ui/core@19.1.0

## 19.1.0-alpha.3

### Patch Changes

- baf595b: Fix the release pipeline so npm publishes come from the ng-packagr
  `dist/` output instead of each library's source `package.json`. Previously
  published versions of `@pa-ui/button`, `@pa-ui/core`, `@pa-ui/input`, and
  `@pa-ui/angular` were missing `main`/`module`/`exports`/`typings`, making them
  unresolvable by any consumer (`TS2307: Cannot find module`). This releases the
  first consumable build of all four packages.
- Updated dependencies [baf595b]
  - @pa-ui/core@19.1.0-alpha.3

## 19.1.0-alpha.2

### Patch Changes

- Updated dependencies [fa81f68]
  - @pa-ui/core@19.1.0-alpha.2

## 19.1.0-alpha.1

### Minor Changes

- 20a9d22: feat(packaging): restructure with public core + umbrella re-exports
  (MUI/Ant Design pattern)

  - @pa-ui/core stays public with @pa-ui/button removed from peerDependencies
  - @pa-ui/button and @pa-ui/input now declare @pa-ui/core in dependencies
  - Created @pa-ui/angular umbrella package re-exporting core, button, and input
  - ThemeService is shared via npm deduplication (single instance guaranteed)

### Patch Changes

- Updated dependencies [20a9d22]
  - @pa-ui/core@19.1.0-alpha.1

## 19.0.0-alpha.0

### Minor Changes

- 0ed71ab: Initial alpha release of pa-ui component library
