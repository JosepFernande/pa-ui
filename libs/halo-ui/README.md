# @halolib-ui/angular

Accessible, token-driven Angular 19 UI component library — single published
package with secondary entry points.

## Entry points

| Import                           | Contents                                        |
| -------------------------------- | ----------------------------------------------- |
| `@halolib-ui/angular`            | Root barrel — re-exports all entry points below |
| `@halolib-ui/angular/core`       | Theme engine, theme tokens, foundation scales   |
| `@halolib-ui/angular/button`     | `HaButton` component and its tokens             |
| `@halolib-ui/angular/input-text` | `HaInputText` component and its tokens          |
| `@halolib-ui/angular/select`     | `HaSelect` component and its tokens             |

## Usage

```ts
// app.config.ts
import { provideHaTheme } from '@halolib-ui/angular/core';

providers: [provideHaTheme()];
```

```ts
import { HaButton } from '@halolib-ui/angular/button';
import { HaInputText } from '@halolib-ui/angular/input-text';
import { HaSelect } from '@halolib-ui/angular/select';
```

The root barrel (`@halolib-ui/angular`, no subpath) re-exports every symbol from
all four entry points for consumers who prefer a single import.

## Running unit tests

Run `nx test halo-ui` to execute the unit tests.
