# Components

Catalog of `pa-ui` components. Each row links to the package folder under
`libs/`, where the source code, the package `README.md`, and usage examples
live.

| Component | Package           | Status        | Code                              |
| --------- | ----------------- | ------------- | --------------------------------- |
| Button    | `@halo-ui/button` | **Available** | [`libs/button/`](../libs/button/) |
| Input     | `@halo-ui/input`  | **Available** | [`libs/input/`](../libs/input/)   |
| Select    | `@halo-ui/select` | **Available** | [`libs/select/`](../libs/select/) |

Support packages (not visual components themselves, but consumed by every
component above):

| Package                                   | Role                                                                                         | Code                                |
| ----------------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------- |
| `@halo-ui/core`                           | Theme Engine (`provideHaTheme`) and the Foundation layer (color, spacing, typography, icons) | [`libs/core/`](../libs/core/)       |
| `@halo-ui/angular` (nx project `halo-ui`) | Umbrella package — re-exports the rest                                                       | [`libs/halo-ui/`](../libs/halo-ui/) |

For the token system (Foundation → Semantic → Component) and theming rules, see
[Architecture & Foundation](./architecture-and-foundation.md) and
[Theming Deep-Dive](./theming-deep-dive.md).
