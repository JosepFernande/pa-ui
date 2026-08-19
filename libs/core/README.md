# @pa-ui/core

Theming foundation for pa-ui components: design tokens, `providePaTheme()`, and
the static Foundation/Semantic/Component CSS layer.

## Setup

Consumers need **two** things, not just `providePaTheme()`:

```ts
// app.config.ts
providers: [providePaTheme()];
```

```css
/* styles.css (global stylesheet) */
@import '@pa-ui/core/theme.css';
```

`providePaTheme()` only registers `PaThemeService`, which writes the runtime
color variables (`--pa-{name}`, `-hover`, `-active`, `-contrast`) inline on
`documentElement`. All other tokens that components consume — spacing, padding,
font-size, min-height, gap, radius, etc. (`--pa-button-padding-*`,
`--pa-button-font-*`, and similar) — live only in the static
`@pa-ui/core/theme.css` stylesheet. Without the `@import`, components render
with correct colors but no padding/height/font/gap/radius, with no error in the
console or at build time.

## Running unit tests

Run `nx test pa-ui` to execute the unit tests.
