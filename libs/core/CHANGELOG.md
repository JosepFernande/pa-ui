# @pa-ui/core

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
