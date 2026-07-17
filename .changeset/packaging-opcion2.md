---
'@pa-ui/core': minor
'@pa-ui/button': minor
'@pa-ui/input': minor
'@pa-ui/angular': minor
---

feat(packaging): restructure with public core + umbrella re-exports (MUI/Ant Design pattern)

- @pa-ui/core stays public with @pa-ui/button removed from peerDependencies
- @pa-ui/button and @pa-ui/input now declare @pa-ui/core in dependencies
- Created @pa-ui/angular umbrella package re-exporting core, button, and input
- ThemeService is shared via npm deduplication (single instance guaranteed)
