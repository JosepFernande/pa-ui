import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: [
    '../src/app/**/*.@(mdx|stories.@(js|jsx|ts|tsx))',
    '../../../libs/*/src/lib/**/*.stories.ts',
  ],
  addons: ['@storybook/addon-essentials'],
  framework: {
    name: '@storybook/angular',
    options: {},
  },
  // The Foundation stylesheet (`libs/core/src/lib/foundation/theme.css`) is
  // registered via the `styles` option on the `storybook`/`build-storybook`
  // targets in `apps/showcase/project.json` — the same `styles` array
  // mechanism `@storybook/angular`'s own build-storybook executor exposes
  // (its schema documents `styles`/`stylePreprocessorOptions` explicitly,
  // mirroring `@angular-devkit/build-angular:browser`'s global styles
  // pipeline). That real Angular CSS pipeline processes it like any other
  // global stylesheet, so no custom `webpackFinal` loader rule is needed
  // here (a previous version of this file added one, but it was dead code:
  // the side-effect import it was meant to support was elided by the
  // TypeScript compiler before webpack ever saw it — see `preview.ts`).
};

export default config;
