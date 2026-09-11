# Components

Catalog of `halo-ui` components. `@halolib-ui/angular` is the single published
npm package (Nx project `halo-ui`); each row below is one of its ng-packagr
secondary entry points, not a separate package. Each row links to the entry
point's folder under `libs/halo-ui/`, where the source code, its own
`README.md`, and usage examples live.

| Component | Import                           | Status        | Code                                                      |
| --------- | -------------------------------- | ------------- | --------------------------------------------------------- |
| Button    | `@halolib-ui/angular/button`     | **Available** | [`libs/halo-ui/button/`](../libs/halo-ui/button/)         |
| Input     | `@halolib-ui/angular/input-text` | **Available** | [`libs/halo-ui/input-text/`](../libs/halo-ui/input-text/) |
| Select    | `@halolib-ui/angular/select`     | **Available** | [`libs/halo-ui/select/`](../libs/halo-ui/select/)         |

Support entry point (not a visual component itself, but consumed by every
component above):

| Import                     | Role                                                                                         | Code                                          |
| -------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `@halolib-ui/angular/core` | Theme Engine (`provideHaTheme`) and the Foundation layer (color, spacing, typography, icons) | [`libs/halo-ui/core/`](../libs/halo-ui/core/) |

The root import (`@halolib-ui/angular`, no subpath) re-exports all of the above
from `libs/halo-ui/src/index.ts`.

For the token system (Foundation → Semantic → Component) and theming rules, see
[Architecture & Foundation](./architecture-and-foundation.md) and
[Theming Deep-Dive](./theming-deep-dive.md).
