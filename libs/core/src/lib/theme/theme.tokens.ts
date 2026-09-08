import { InjectionToken, makeStateKey } from '@angular/core';

/**
 * Explicit hover/active/contrast overrides for a single bootstrap color
 * entry (Requirement: Bootstrap Color Union Type). `base` is always required
 * and is the HSL anchor for any variant not explicitly supplied — omitted
 * variants keep deriving from `base` exactly as a plain-string entry would.
 */
export interface HaColorVariants {
  base: string;
  hover?: string;
  active?: string;
  contrast?: string;
}

/**
 * A bootstrap color entry: either a plain hex string (today's shape) or an
 * object with an explicit `base` and optional explicit hover/active/contrast
 * overrides (Requirement: Bootstrap Color Union Type).
 */
export type HaColorValue = string | HaColorVariants;

/**
 * Consumer-provided theme configuration passed to `provideHaTheme()`.
 * `colors` is an open dictionary — any string key is accepted, not just the
 * 5 default base colors (Requirement: Open Color Dictionary).
 */
export interface HaThemeConfig {
  colors: Record<string, HaColorValue>;
}

/**
 * Behavior options for `provideHaTheme()`.
 * `extendDefaults` defaults to `true` when omitted or when `options` itself
 * is omitted (Requirement: Color Merge Behavior).
 */
export interface HaThemeOptions {
  extendDefaults?: boolean;
}

/**
 * The computed, immutable theme snapshot produced by the theme engine and
 * exposed via `HA_THEME_TOKEN`.
 */
export interface ResolvedTheme {
  colors: Record<string, HaColorValue>;
}

/**
 * Flat CSS custom-property name→value map produced by `deriveTokens()`
 * (Requirement: CSS Variable Map Output Shape). Pure data — no DOM writes.
 */
export type ThemeCssVariables = Record<string, string>;

/**
 * Default palette registered when no consumer config is provided, and the
 * fallback used on fail-safe bootstrap (Requirement: Fail-Safe Bootstrap).
 * Frozen (including `colors` and every object-shaped entry) so importing it
 * directly from the public API can never corrupt the shared singleton —
 * `mergeTheme()` uses this exact reference as its default merge base for
 * every call in the process.
 *
 * Roster source of truth: `decision/halo-ui-default-theme-color-naming`,
 * updated by the single-brand-scale breaking change (raw `dark-blue`/
 * `light-blue`/`dark-green`/`light-green` families and the `secondary` token
 * removed entirely — no alias kept).
 * - `primary` is an explicit `{ base, hover }` pair sourced from the new
 *   Foundation `primary` scale (`primary-600` base, `primary-700` hover),
 *   keeping the same explicit-hover convention the old brand aliases used —
 *   a plain string entry's auto-derived hover is never used for this key.
 * - `success`/`warning`/`alert`/`info` already match the source palette 1:1.
 * - `neutral` is `neutral-900` (#4c4c4c), matching the typographic text
 *   color, not `neutral-500`.
 */
export const DEFAULT_THEME: ResolvedTheme = Object.freeze({
  colors: Object.freeze({
    primary: Object.freeze({ base: '#4f46e5', hover: '#4338ca' }),
    success: '#8fbf21',
    error: '#d71608',
    /**
     * @deprecated Use `error` instead. Kept as a twin alias — identical hex
     * to `error` — for one minor version so `color="danger"` usage from the
     * previous default roster keeps resolving without a runtime error. This
     * is a product assumption pending sign-off (see design D3), not a firm
     * decision; MUST be revisited before the next minor release.
     */
    danger: '#d71608',
    warning: '#ed9613',
    alert: '#f8e115',
    info: '#16a3c3',
    neutral: '#4c4c4c',
  }),
});

/**
 * DI token carrying the resolved theme snapshot, provided by
 * `provideHaTheme()` and read synchronously by `HaThemeService`.
 */
export const HA_THEME_TOKEN = new InjectionToken<ResolvedTheme>('ha-theme');

/**
 * `TransferState` key used to round-trip the resolved snapshot from
 * server-side bootstrap to browser rehydration (Requirement: SSR-Safe
 * Computation).
 */
export const HA_THEME_STATE_KEY = makeStateKey<ResolvedTheme>('ha-theme');
