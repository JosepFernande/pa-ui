# @pa-ui/angular

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
