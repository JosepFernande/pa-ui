# @halolib-ui/angular

## 19.0.0

Initial release of the consolidated `@halolib-ui/angular` package (SDD change
`consolidate-halo-ui-single-package`). Replaces the 5-package umbrella
(`@halolib-ui/core`, `@halolib-ui/button`, `@halolib-ui/input-text`,
`@halolib-ui/select`, `@halolib-ui/angular`) with one published package and
ng-packagr secondary entry points (`@halolib-ui/angular/core`,
`@halolib-ui/angular/button`, `@halolib-ui/angular/input-text`,
`@halolib-ui/angular/select`). The root import keeps working unchanged.

Per an explicit maintainer decision, this CHANGELOG starts fresh — the 4
legacy packages' history is not merged in. The project has no stable
consumers yet, so backward-compatibility/changelog continuity does not apply.
Version `19.0.0` was chosen to align with the Angular major version this
package targets (Angular 19.2), following the Angular Material/CDK
convention of matching Angular's major version.
