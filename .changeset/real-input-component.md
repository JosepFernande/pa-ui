---
'@pa-ui/input': minor
---

Implement the real `pa-input` component (issue #106, alternative 1): standalone,
signals-first, token-driven Angular 19 **text-only** input with
`ControlValueAccessor` forms integration
(`[formControl]`/`formControlName`/`[(ngModel)]`), CDK `FocusMonitor` focus ring
(any origin), error state (`invalid && touched` → `.pa-input--error` +
`aria-invalid`), and accessible-name support (`aria-label`, `aria-describedby`).
Password, email, and number inputs are separate components. `--pa-input-*`
defaults ship via `@pa-ui/core/theme.css`, so no consumer tokens are required.
