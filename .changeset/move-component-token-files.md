---
'@halolib-ui/angular': patch
---

Relocate the button/input-text/select default-values and token-shape files under
`core/src/lib/components/**` (no logic changes) and register the
`@halolib-ui/angular/icon` path mapping so the new icon entry point resolves
correctly for consumers and in local dev.
