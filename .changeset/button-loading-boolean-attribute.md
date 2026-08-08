---
'@pa-ui/button': patch
---

Fix `loading` input rejecting the bare attribute usage documented in the README
(`<button pa-button loading>`). Added `transform: booleanAttribute` so the
presence of the attribute coerces to `true`, matching how `disabled` already
behaves as a native HTML attribute. Also documented the mandatory
`@import '@pa-ui/core/theme.css'` setup step in the button and core READMEs.
