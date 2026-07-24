import { applicationConfig, type Preview } from '@storybook/angular';
import { providePaTheme } from '@pa-ui/core';

/**
 * Registers the pa-ui theme engine as a global Storybook `applicationConfig`
 * so every story renders with a resolved theme (`--pa-primary` and friends
 * written to `document.documentElement`).
 *
 * This is Storybook-only wiring. `apps/showcase/src/app/app.config.ts` (the
 * real showcase runtime bootstrap) is intentionally left untouched — see
 * design decision "Theme registration" (Issue #59).
 */
const preview: Preview = {
  decorators: [
    applicationConfig({
      providers: [providePaTheme()],
    }),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
