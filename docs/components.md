# Components

Catalog of `pa-ui` components. Each row links to the package folder under
`libs/`, where the source code, the package `README.md`, and usage examples
live.

| Component | Package         | Status        | Code                              |
| --------- | --------------- | ------------- | --------------------------------- |
| Button    | `@pa-ui/button` | **Available** | [`libs/button/`](../libs/button/) |
| Input     | `@pa-ui/input`  | **Available** | [`libs/input/`](../libs/input/)   |

Support packages (not visual components themselves, but consumed by every
component above):

| Package                               | Role                                                                                         | Code                            |
| ------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------- |
| `@pa-ui/core`                         | Theme Engine (`providePaTheme`) and the Foundation layer (color, spacing, typography, icons) | [`libs/core/`](../libs/core/)   |
| `@pa-ui/angular` (nx project `pa-ui`) | Umbrella package — re-exports the rest                                                       | [`libs/pa-ui/`](../libs/pa-ui/) |

For the token system (Foundation → Semantic → Component) and theming rules, see
[Architecture & Foundation](./architecture-and-foundation.md) and
[Theming Deep-Dive](./theming-deep-dive.md).
