# Storybook

`pa-ui` hosts a single consolidated Storybook instance on the `showcase` project
(`apps/showcase`). It discovers stories across every library under `libs/*`
automatically — a library does not need its own Storybook config to have its
stories show up.

## Running Storybook locally

```bash
# Start the dev server (http://localhost:4400)
npx nx run showcase:storybook

# Build the static site
npx nx run showcase:build-storybook

# Serve the static build (after build-storybook)
npx nx run showcase:static-storybook
```

The static build output is written to `dist/storybook/showcase/`.

## Theme registration

Every story renders with the pa-ui theme engine already registered
(`providePaTheme()`), so theme-derived CSS custom properties (e.g.
`--pa-primary`) are present on `document.documentElement` for any story. This is
configured once in `apps/showcase/.storybook/preview.ts` and does **not** affect
the real showcase application (`apps/showcase/src/app/app.config.ts` is
untouched).

## Adding a new story

1. Colocate a `*.stories.ts` file next to the component, inside the owning
   library's `src/lib/` folder — for example
   `libs/button/src/lib/button.stories.ts`.
2. Write it as a CSF3 story:

   ```typescript
   import type { Meta, StoryObj } from '@storybook/angular';
   import { MyComponent } from './my-component.component';

   const meta: Meta<MyComponent> = {
     title: 'Group/MyComponent',
     component: MyComponent,
   };

   export default meta;

   type Story = StoryObj<MyComponent>;

   export const Default: Story = {
     render: (args) => ({
       props: args,
       template: `<my-component></my-component>`,
     }),
   };
   ```

3. If the component needs a custom color registered on top of the default theme
   palette (to prove theme-token derivation, for example), add an
   `applicationConfig` decorator that calls `providePaTheme()`:

   ```typescript
   import { applicationConfig } from '@storybook/angular';
   import { providePaTheme } from '@pa-ui/core';

   const meta: Meta<MyComponent> = {
     // ...
     decorators: [
       applicationConfig({
         providers: [providePaTheme({ colors: { brand: '#ec4899' } })],
       }),
     ],
   };
   ```

4. Run `npx nx run showcase:storybook` and confirm the story appears in the
   sidebar under the `title` you set.

No `libs/*/.storybook/` configuration is required —
`apps/showcase/.storybook/main.ts` already includes
`libs/*/src/lib/**/*.stories.ts` in its `stories` glob.

## CI

`.github/workflows/storybook-build.yml` runs
`npx nx run showcase:build-storybook` on PRs that touch Storybook config, the
showcase app, or any library's stories/theme code, and uploads the static build
as a workflow artifact.
