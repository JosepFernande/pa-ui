# @halolib-ui/core

Theming foundation for halo-ui components: design tokens, `provideHaTheme()`,
and the static Foundation/Semantic/Component CSS layer.

## Setup

Consumers need **two** things, not just `provideHaTheme()`:

```ts
// app.config.ts
providers: [provideHaTheme()];
```

```css
/* styles.css (global stylesheet) */
@import '@halolib-ui/core/theme.css';
```

`provideHaTheme()` only registers `HaThemeService`, which writes the runtime
color variables (`--ha-{name}`, `-hover`, `-active`, `-contrast`) inline on
`documentElement`. All other tokens that components consume — spacing, padding,
font-size, min-height, gap, radius, etc. (`--ha-button-padding-*`,
`--ha-button-font-*`, and similar) — live only in the static
`@halolib-ui/core/theme.css` stylesheet. Without the `@import`, components
render with correct colors but no padding/height/font/gap/radius, with no error
in the console or at build time.

## Running unit tests

Run `nx test core` to execute the unit tests.
