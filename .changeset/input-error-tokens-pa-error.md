---
'@pa-ui/core': patch
---

Fix PaInput error tokens referencing the deprecated `--pa-danger` alias instead
of the canonical `--pa-error` semantic token. A consumer calling
`providePaTheme({ colors: { error: '#custom' } })` now recolors the input error
border, text, and icon consistently with every other error surface.
