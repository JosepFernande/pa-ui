# @halolib-ui/core

Theming foundation for halo-ui components: design tokens, `provideHaTheme()`,
and the runtime Theme Engine that builds the Foundation/Semantic/Component CSS
layer.

## Setup

Consumers only need `provideHaTheme()`:

```ts
// app.config.ts
providers: [provideHaTheme()];
```

`provideHaTheme()` registers `HaThemeService`, which writes EVERY CSS custom
property components consume — colors (`--ha-{name}`, `-hover`, `-active`,
`-contrast`), and every Foundation/Component default (spacing, padding,
font-size, min-height, gap, radius, etc., e.g. `--ha-button-padding-*`,
`--ha-button-font-*`) — inline on `documentElement`, on both the server and the
browser. No additional CSS import is required.

## Running unit tests

Run `nx test core` to execute the unit tests.
