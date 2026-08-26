---
'@pa-ui/core': patch
'@pa-ui/button': patch
'@pa-ui/input': patch
'@pa-ui/select': patch
---

Switch the `button`/`input`/`select` focus-ring tokens from `box-shadow` to
`outline` + `outline-offset` for consistent keyboard-only focus styling, and fix
select trigger sizing/interaction (stale overlay width on open, missing
open-state border on click, option mousedown stealing trigger focus, hover
overriding selected/active option styling).
