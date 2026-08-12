---
'@pa-ui/select': minor
'@pa-ui/core': minor
'@pa-ui/angular': minor
---

Add `<pa-select>` (issue #125, alternative 1): standalone, signals-first,
token-driven single-select with `ControlValueAccessor` forms integration, CDK
Overlay panel, WAI-ARIA select-only combobox semantics, full keyboard navigation
including typeahead, and `readonly` distinct from `disabled`. `--pa-select-*`
defaults ship via `@pa-ui/core/theme.css`, so no consumer tokens are required.
