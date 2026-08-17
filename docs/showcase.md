# Showcase

`pa-ui` uses `apps/showcase` — a real Angular application — as the local
playground for every published component. There is no separate preview tool: the
showcase app imports each library from its public entry point (`@pa-ui/button`,
`@pa-ui/input`, `@pa-ui/select`, ...) exactly as a consumer would.

## Running the showcase locally

```bash
# Start the dev server
npx nx serve showcase

# Build it
npx nx build showcase
```

## Theme registration

The showcase registers the pa-ui theme engine at bootstrap (`providePaTheme()`
in `apps/showcase/src/app/app.config.ts`) and loads the Foundation stylesheet
via the `build`/`serve` target's `styles` array
(`libs/core/src/lib/foundation/theme.css`), so every route renders with
theme-derived CSS custom properties (e.g. `--pa-primary`) already present on
`document.documentElement`.

## Adding a showcase route for a new component

1. Create a standalone page component under
   `apps/showcase/src/app/pages/<component>-page/`, importing the library
   component from its public entry point (`@pa-ui/<lib>`).
2. Demonstrate the component's main variants, sizes, colors, and states (no need
   to cover every combination) — this is a working playground, not exhaustive
   documentation.
3. Register the page in `apps/showcase/src/app/app.routes.ts`.
4. Add a link to the new route in the nav
   (`apps/showcase/src/app/app.component.html`).

## CI

The showcase app builds and lints as part of the regular `ci.yml` workflow's
`npx nx run-many -t lint` / `-t build` steps, alongside every other project —
there is no dedicated workflow for it.
