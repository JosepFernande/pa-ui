import { applicationConfig, type Preview } from '@storybook/angular';
import { providePaTheme } from '@pa-ui/core';

// Static Foundation stylesheet (`libs/core/src/lib/foundation/theme.css`, D1):
// unprefixed raw scales + semantic non-color passthrough + `--pa-button-*`
// defaults. This is NOT wired via a TS-level `import '...css'` here — a bare
// side-effect import resolved through a `tsconfig.base.json` path mapping to
// a non-TS module is silently ELIDED by the TypeScript compiler at emit time
// (confirmed by sdd-verify's CRITICAL-1 finding: the build succeeded with
// exit 0 while the bundle contained zero Foundation declarations). Instead,
// the Foundation CSS is registered as a genuine Angular global style via the
// `styles` option on the `storybook`/`build-storybook` targets in
// `apps/showcase/project.json`, the same mechanism Angular's own CLI builder
// already uses for `apps/showcase/src/styles.css` — this goes through
// webpack's real style pipeline and cannot be silently dropped by tree-shaking
// or emit elision. See `storybook-build-output.spec.ts` for the real-build
// regression test that guards this.

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
