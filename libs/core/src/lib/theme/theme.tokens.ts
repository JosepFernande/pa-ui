import { InjectionToken, makeStateKey } from '@angular/core';

/**
 * Consumer-provided theme configuration passed to `providePaTheme()`.
 * `colors` is an open dictionary — any string key is accepted, not just the
 * 5 default base colors (Requirement: Open Color Dictionary).
 */
export interface PaThemeConfig {
  colors: Record<string, string>;
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
  colors: Record<string, string>;
}

/**
 * Default palette registered when no consumer config is provided, and the
 * fallback used on fail-safe bootstrap (Requirement: Fail-Safe Bootstrap).
 */
export const DEFAULT_THEME: ResolvedTheme = {
  colors: {
    primary: '#2563eb',
    success: '#16a34a',
    danger: '#dc2626',
    warning: '#f59e0b',
    neutral: '#6b7280',
  },
};

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
