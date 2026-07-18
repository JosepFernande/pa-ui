import { DEFAULT_THEME } from './theme.tokens';
import type { PaThemeConfig, PaThemeOptions, ResolvedTheme } from './theme.tokens';

/**
 * The 5 base color keys every default palette must provide. Used to detect
 * gaps when `extendDefaults` is `false` (Requirement: Color Merge Behavior).
 */
const BASE_COLOR_KEYS = ['primary', 'success', 'danger', 'warning', 'neutral'] as const;

/**
 * Pure, framework-free merge of consumer theme config over a default
 * palette. Zero `@angular/*` imports so it stays unit-testable without
 * `TestBed` and reusable outside DI (Requirement: Color Merge Behavior,
 * Open Color Dictionary).
 *
 * - No `config` → returns a fresh copy of `defaults` (never the shared
 *   reference, so callers can never mutate the DEFAULT_THEME singleton).
 * - `extendDefaults` true (default, including when `options` is omitted) →
 *   `config.colors` merged over `defaults.colors`, consumer values winning
 *   on key collision.
 * - `extendDefaults` false → returns ONLY `config.colors`, with no fallback
 *   to `defaults` for absent keys. If any of the 5 base color keys is
 *   missing from `config.colors`, emits a single `console.warn` naming the
 *   missing keys and returns the partial map — never throws, never
 *   backfills.
 */
export function mergeTheme(
  config: PaThemeConfig | undefined,
  options: PaThemeOptions | undefined,
  defaults: ResolvedTheme = DEFAULT_THEME,
): ResolvedTheme {
  if (!config) {
    return { colors: { ...defaults.colors } };
  }

  const extendDefaults = options?.extendDefaults ?? true;

  if (!extendDefaults) {
    const missingKeys = BASE_COLOR_KEYS.filter((key) => !(key in config.colors));
    if (missingKeys.length > 0) {
      console.warn(
        `[pa-ui] providePaTheme: extendDefaults is false and config.colors is missing base color(s): ${missingKeys.join(', ')}. These keys will NOT be backfilled with defaults.`,
      );
    }
    return { colors: { ...config.colors } };
  }

  return {
    colors: {
      ...defaults.colors,
      ...config.colors,
    },
  };
}
