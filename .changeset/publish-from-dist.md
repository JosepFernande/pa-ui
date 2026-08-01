---
'@pa-ui/angular': patch
'@pa-ui/button': patch
'@pa-ui/core': patch
'@pa-ui/input': patch
---

Fix the release pipeline so npm publishes come from the ng-packagr `dist/`
output instead of each library's source `package.json`. Previously published
versions of `@pa-ui/button`, `@pa-ui/core`, `@pa-ui/input`, and `@pa-ui/angular`
were missing `main`/`module`/`exports`/`typings`, making them unresolvable by
any consumer (`TS2307: Cannot find module`). This releases the first consumable
build of all four packages.
