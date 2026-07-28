import { InjectionToken, makeStateKey } from '@angular/core';

/**
 * Explicit hover/active/contrast overrides for a single bootstrap color
 * entry (Requirement: Bootstrap Color Union Type). `base` is always required
 * and is the HSL anchor for any variant not explicitly supplied — omitted
 * variants keep deriving from `base` exactly as a plain-string entry would.
 */
export interface PaColorVariants {
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
export type PaColorValue = string | PaColorVariants;

/**
 * Consumer-provided theme configuration passed to `providePaTheme()`.
 * `colors` is an open dictionary — any string key is accepted, not just the
 * 5 default base colors (Requirement: Open Color Dictionary).
 */
export interface PaThemeConfig {
  colors: Record<string, PaColorValue>;
}

/**
 * Behavior options for `providePaTheme()`.
 * `extendDefaults` defaults to `true` when omitted or when `options` itself
 * is omitted (Requirement: Color Merge Behavior).
 */
export interface PaThemeOptions {
  extendDefaults?: boolean;
}

/**
 * The computed, immutable theme snapshot produced by the theme engine and
 * exposed via `PA_THEME_TOKEN`.
 */
export interface ResolvedTheme {
  colors: Record<string, PaColorValue>;
}

/**
 * Flat CSS custom-property name→value map produced by `deriveTokens()`
 * (Requirement: CSS Variable Map Output Shape). Pure data — no DOM writes.
 */
export type ThemeCssVariables = Record<string, string>;

/**
 * Default palette registered when no consumer config is provided, and the
 * fallback used on fail-safe bootstrap (Requirement: Fail-Safe Bootstrap).
 * Frozen (including `colors`) so importing it directly from the public API
 * can never corrupt the shared singleton — `mergeTheme()` uses this exact
 * reference as its default merge base for every call in the process.
 */
export const DEFAULT_THEME: ResolvedTheme = Object.freeze({
  colors: Object.freeze({
    primary: '#2563eb',
    success: '#16a34a',
    danger: '#dc2626',
    warning: '#f59e0b',
    neutral: '#6b7280',
  }),
});

/**
 * DI token carrying the resolved theme snapshot, provided by
 * `providePaTheme()` and read synchronously by `PaThemeService`.
 */
export const PA_THEME_TOKEN = new InjectionToken<ResolvedTheme>('pa-theme');

/**
 * `TransferState` key used to round-trip the resolved snapshot from
 * server-side bootstrap to browser rehydration (Requirement: SSR-Safe
 * Computation).
 */
export const PA_THEME_STATE_KEY = makeStateKey<ResolvedTheme>('pa-theme');
