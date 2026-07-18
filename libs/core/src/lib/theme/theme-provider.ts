import {
  EnvironmentProviders,
  PLATFORM_ID,
  TransferState,
  inject,
  makeEnvironmentProviders,
} from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { mergeTheme } from './theme-engine';
import { DEFAULT_THEME, PA_THEME_STATE_KEY, PA_THEME_TOKEN } from './theme.tokens';
import type { PaThemeConfig, PaThemeOptions, ResolvedTheme } from './theme.tokens';

/**
 * Registers the pa-ui theme engine at application bootstrap
 * (Requirement: Bootstrap Registration).
 *
 * - Called with no arguments, registers the full `DEFAULT_THEME` palette.
 * - On the server (`isPlatformServer`), computes the snapshot synchronously
 *   via `mergeTheme` and persists it into `TransferState` under
 *   `PA_THEME_STATE_KEY` (Requirement: SSR-Safe Computation).
 * - On the browser, reads the `TransferState` snapshot if present (no
 *   recompute); if absent, recomputes synchronously via `mergeTheme`.
 * - Any error during computation is caught in THIS layer (not
 *   `theme-engine.ts`), falls back to a fresh copy of `DEFAULT_THEME`, and
 *   emits a single `console.warn`. `providePaTheme` MUST NEVER throw in a
 *   way that blocks `bootstrapApplication` (Requirement: Fail-Safe
 *   Bootstrap).
 *
 * Only imports `@angular/core` and `@angular/common` — no `@angular/cdk` or
 * `@angular/forms` — and has no top-level side effects, keeping
 * `sideEffects: false` / tree-shaking intact (Requirement: Packaging
 * Constraints).
 */
export function providePaTheme(
  config?: PaThemeConfig,
  options?: PaThemeOptions,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: PA_THEME_TOKEN,
      useFactory: (): ResolvedTheme => {
        const platformId = inject(PLATFORM_ID);
        const transferState = inject(TransferState);

        try {
          if (isPlatformServer(platformId)) {
            const snapshot = mergeTheme(config, options);
            transferState.set(PA_THEME_STATE_KEY, snapshot);
            return snapshot;
          }

          if (transferState.hasKey(PA_THEME_STATE_KEY)) {
            return transferState.get(PA_THEME_STATE_KEY, DEFAULT_THEME);
          }

          return mergeTheme(config, options);
        } catch (error) {
          console.warn(
            '[pa-ui] providePaTheme: failed to compute the theme snapshot, falling back to DEFAULT_THEME.',
            error,
          );
          return { colors: { ...DEFAULT_THEME.colors } };
        }
      },
    },
  ]);
}
