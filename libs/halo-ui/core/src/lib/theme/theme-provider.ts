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
import { HaThemeService } from './theme.service';
import {
  DEFAULT_THEME,
  HA_THEME_OVERRIDES_TOKEN,
  HA_THEME_STATE_KEY,
  HA_THEME_TOKEN,
} from './theme.tokens';
import type { HaColorValue, HaTheme, HaThemeOptions, ResolvedTheme } from './theme.tokens';

/**
 * Returns a frozen, independent copy of `theme` so the value provided under
 * `HA_THEME_TOKEN` — read via `HaThemeService.theme()` and persisted into
 * `TransferState` — can never be mutated by a consumer, regardless of how
 * `mergeTheme()` or `TransferState.get()` produced it. Object-shaped color
 * entries (Requirement: Deep-Freeze of Object-Shaped Color Entries) are
 * frozen as an independent shallow copy — never the original reference —
 * so freezing here can never lock the caller's own config object. Plain
 * string entries need no extra work (freezing a primitive is a no-op).
 */
function freezeSnapshot(theme: ResolvedTheme): ResolvedTheme {
  const colors: Record<string, HaColorValue> = {};
  for (const [name, value] of Object.entries(theme.colors)) {
    colors[name] =
      typeof value === 'object' && value !== null ? Object.freeze({ ...value }) : value;
  }
  return Object.freeze({ colors: Object.freeze(colors) });
}

/**
 * Registers the halo-ui theme engine at application bootstrap
 * (Requirement: Bootstrap Registration).
 *
 * - Called with no arguments, registers the full `DEFAULT_THEME` palette and
 *   no Foundation/Component overrides.
 * - `theme.semantic` takes over `HaThemeConfig.colors`'s exact former role:
 *   on the server (`isPlatformServer`), computes the snapshot synchronously
 *   via `mergeTheme` and persists it into `TransferState` under
 *   `HA_THEME_STATE_KEY` (Requirement: SSR-Safe Computation). On the
 *   browser, reads the `TransferState` snapshot if present (no recompute);
 *   if absent, recomputes synchronously via `mergeTheme`.
 * - `theme.foundation`/`theme.components` are registered separately, under
 *   `HA_THEME_OVERRIDES_TOKEN` — a deterministic, same-tick pass-through of
 *   the literal input (identical on server and browser, so it needs no
 *   `TransferState` round-trip of its own). `HaThemeService.writeToDom()`
 *   converts them to CSS variables through `foundation-overrides.ts`/
 *   `component-overrides.ts`, never through `deriveTokens()` (Requirement:
 *   `deriveTokens()` Never Processes Raw Scales).
 * - Any error during semantic computation is caught in THIS layer (not
 *   `theme-engine.ts`), falls back to a fresh copy of `DEFAULT_THEME`, and
 *   emits a single `console.warn`. `provideHaTheme` MUST NEVER throw in a
 *   way that blocks `bootstrapApplication` (Requirement: Fail-Safe
 *   Bootstrap). Malformed Foundation/Component input is handled by their own
 *   fail-soft pure helpers (warn-and-skip per bad leaf), so it never reaches
 *   this try/catch in the first place.
 *
 * Only imports `@angular/core` and `@angular/common` — no `@angular/cdk` or
 * `@angular/forms` — and has no top-level side effects, keeping
 * `sideEffects: false` / tree-shaking intact (Requirement: Packaging
 * Constraints).
 *
 * Also eagerly instantiates `HaThemeService` via `provideEnvironmentInitializer()`
 * so its constructor runs the first semantic DOM write at bootstrap, before
 * any consumer explicitly injects the service (resolved decision: issue #48,
 * deliberate extension of this already-merged #46 file — without this,
 * Angular's lazy DI means nothing would ever inject `HaThemeService` and
 * Button would never resolve custom colors).
 */
export function provideHaTheme(theme?: HaTheme, options?: HaThemeOptions): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: HA_THEME_TOKEN,
      useFactory: (): ResolvedTheme => {
        const platformId = inject(PLATFORM_ID);
        const transferState = inject(TransferState);

        try {
          if (isPlatformServer(platformId)) {
            const snapshot = freezeSnapshot(mergeTheme(theme?.semantic, options));
            transferState.set(HA_THEME_STATE_KEY, snapshot);
            return snapshot;
          }

          if (transferState.hasKey(HA_THEME_STATE_KEY)) {
            return freezeSnapshot(transferState.get(HA_THEME_STATE_KEY, DEFAULT_THEME));
          }

          return freezeSnapshot(mergeTheme(theme?.semantic, options));
        } catch (error) {
          console.warn(
            '[halo-ui] provideHaTheme: failed to compute the theme snapshot, falling back to DEFAULT_THEME.',
            error,
          );
          return freezeSnapshot(DEFAULT_THEME);
        }
      },
    },
    {
      provide: HA_THEME_OVERRIDES_TOKEN,
      useValue: theme ? { foundation: theme.foundation, components: theme.components } : undefined,
    },
    provideEnvironmentInitializer(() => {
      inject(HaThemeService);
    }),
  ]);
}
