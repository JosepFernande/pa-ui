# @pa-ui/angular

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
- Updated dependencies [fa81f68]
- Updated dependencies [baf595b]
  - @pa-ui/button@19.1.0
  - @pa-ui/core@19.1.0
  - @pa-ui/input@19.1.0

## 19.1.0-alpha.3

### Patch Changes

- baf595b: Fix the release pipeline so npm publishes come from the ng-packagr
  `dist/` output instead of each library's source `package.json`. Previously
  published versions of `@pa-ui/button`, `@pa-ui/core`, `@pa-ui/input`, and
  `@pa-ui/angular` were missing `main`/`module`/`exports`/`typings`, making them
  unresolvable by any consumer (`TS2307: Cannot find module`). This releases the
  first consumable build of all four packages.
- Updated dependencies [baf595b]
  - @pa-ui/button@19.1.0-alpha.3
  - @pa-ui/core@19.1.0-alpha.3
  - @pa-ui/input@19.1.0-alpha.3

## 19.1.0-alpha.2

### Patch Changes

- fa81f68: Publish the default theme palette, Foundation tokens, and Button
  color and dimension updates.
- Updated dependencies [fa81f68]
  - @pa-ui/button@19.1.0-alpha.2
  - @pa-ui/core@19.1.0-alpha.2
  - @pa-ui/input@19.1.0-alpha.2

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
  - @pa-ui/button@19.1.0-alpha.1
  - @pa-ui/input@19.1.0-alpha.1
