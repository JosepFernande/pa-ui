import {
  EnvironmentProviders,
  PLATFORM_ID,
  TransferState,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { mergeTheme } from './theme-engine';
import { PaThemeService } from './theme.service';
import { DEFAULT_THEME, PA_THEME_STATE_KEY, PA_THEME_TOKEN } from './theme.tokens';
import type { PaColorValue, PaThemeConfig, PaThemeOptions, ResolvedTheme } from './theme.tokens';

/**
 * Returns a frozen, independent copy of `theme` so the value provided under
 * `PA_THEME_TOKEN` — read via `PaThemeService.theme()` and persisted into
 * `TransferState` — can never be mutated by a consumer, regardless of how
 * `mergeTheme()` or `TransferState.get()` produced it. Object-shaped color
 * entries (Requirement: Deep-Freeze of Object-Shaped Color Entries) are
 * frozen as an independent shallow copy — never the original reference —
 * so freezing here can never lock the caller's own config object. Plain
 * string entries need no extra work (freezing a primitive is a no-op).
 */
function freezeSnapshot(theme: ResolvedTheme): ResolvedTheme {
  const colors: Record<string, PaColorValue> = {};
  for (const [name, value] of Object.entries(theme.colors)) {
    colors[name] =
      typeof value === 'object' && value !== null ? Object.freeze({ ...value }) : value;
  }
  return Object.freeze({ colors: Object.freeze(colors) });
}

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
 *
 * Also eagerly instantiates `PaThemeService` via `provideEnvironmentInitializer()`
 * so its constructor runs the first semantic DOM write at bootstrap, before
 * any consumer explicitly injects the service (resolved decision: issue #48,
 * deliberate extension of this already-merged #46 file — without this,
 * Angular's lazy DI means nothing would ever inject `PaThemeService` and
 * Button would never resolve custom colors).
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
            const snapshot = freezeSnapshot(mergeTheme(config, options));
            transferState.set(PA_THEME_STATE_KEY, snapshot);
            return snapshot;
          }

          if (transferState.hasKey(PA_THEME_STATE_KEY)) {
            return freezeSnapshot(transferState.get(PA_THEME_STATE_KEY, DEFAULT_THEME));
          }

          return freezeSnapshot(mergeTheme(config, options));
        } catch (error) {
          console.warn(
            '[pa-ui] providePaTheme: failed to compute the theme snapshot, falling back to DEFAULT_THEME.',
            error,
          );
          return freezeSnapshot(DEFAULT_THEME);
        }
      },
    },
    provideEnvironmentInitializer(() => {
      inject(PaThemeService);
    }),
  ]);
}
