import { InjectionToken, makeStateKey } from '@angular/core';
import type { HaButtonTokens, HaInputTextTokens, HaSelectTokens } from './component-token-shapes';

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
 * Recursive partial: makes every nested object partial too, not just the
 * top-level keys — the same ergonomics as PrimeNG's `definePreset`, so a
 * consumer of `HaTheme` only ever specifies the leaves they want to change.
 */
export type HaDeepPartial<T> = T extends object ? { [K in keyof T]?: HaDeepPartial<T[K]> } : T;

/**
 * Consumer-provided Foundation-layer overrides for `HaTheme.foundation`.
 *
 * Every field mirrors a raw scale exposed by `foundation/foundation.tokens.ts`
 * (`HA_FOUNDATION_PALETTE`, `HA_SPACING_SCALE`, `HA_GAP_SCALE`,
 * `HA_RADIUS_SCALE`, `HA_ICON_SIZE_SCALE`, `HA_FONT_WEIGHT_SCALE`,
 * `HA_FONT_FAMILY`, `HA_TYPOGRAPHY_SCALE`), but the step-key literal unions
 * below (`25-900`, `xs-xl`, `regular|semibold|bold`) are deliberately
 * duplicated here at the type level instead of imported from
 * `foundation/foundation.types.ts`. `no-raw-scale-in-theme-engine.spec.ts`
 * hard-asserts, via a source-text check, that this file never contains an
 * import matching `from ['"].*foundation` — type-only imports included.
 * Duplicating a handful of literal-type unions is a far smaller cost than
 * weakening that spec. No runtime value ever crosses this boundary either
 * way: Foundation overrides are written to the DOM by a completely separate
 * pure helper (`foundation-overrides.ts`) that never calls `deriveTokens()`.
 */
export interface HaFoundationThemeInput {
  /**
   * Existing palette families (`primary`, `neutral`, ...) may have any of
   * their steps overridden, and entirely new families may be added — the
   * open string index mirrors `HaFoundationPalette`'s own index signature.
   */
  palette?: Record<
    string,
    Partial<Record<25 | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900, string>>
  >;
  spacing?: Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', string>>;
  gap?: Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', string>>;
  radius?: Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', string>>;
  iconSize?: Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', string>>;
  fontWeight?: Partial<Record<'regular' | 'semibold' | 'bold', string>>;
  fontFamily?: string;
  typography?: Record<
    string,
    Partial<{ fontSize: string; fontWeight: string; lineHeight: string }>
  >;
}

/**
 * Consumer-provided Component-layer overrides for `HaTheme.components`. Each
 * field is a deep-partial mirror of the matching component's NAME-shape
 * registry (`HaButtonTokens`/`HaInputTextTokens`/`HaSelectTokens`, declared
 * in `component-token-shapes.ts` — same lib, so importing them here is not a
 * `type:ui` -> `type:core` -> `type:ui` cycle).
 */
export interface HaComponentsThemeInput {
  button?: HaDeepPartial<HaButtonTokens>;
  inputText?: HaDeepPartial<HaInputTextTokens>;
  select?: HaDeepPartial<HaSelectTokens>;
}

/**
 * Consumer-provided theme configuration passed to `provideHaTheme()`. Every
 * layer is deep-partial and independently optional — a consumer only
 * specifies the keys they want to change, mirroring the existing three-layer
 * token pipeline (foundation -> semantic -> component).
 *
 * Replaces the former `HaThemeConfig` (`{ colors: {...} }`) — a deliberate
 * breaking change with no compat alias, consistent with this repo's
 * existing convention for breaking token-shape changes (see
 * `foundation.tokens.ts`'s header comment on the brand-palette breaking
 * change). `semantic` takes over `colors`'s exact role (fed into
 * `mergeTheme()`/`deriveTokens()` unchanged); `foundation` and `components`
 * are new, additive layers written to the DOM through separate pure helpers
 * that never touch the color-derivation pipeline.
 */
export interface HaTheme {
  foundation?: HaFoundationThemeInput;
  semantic?: Record<string, HaColorValue>;
  components?: HaComponentsThemeInput;
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

/**
 * The Foundation and Component override layers of a `HaTheme` input, carried
 * separately from `HA_THEME_TOKEN`/`HA_THEME_STATE_KEY`. Unlike the semantic
 * `colors` layer, these are NOT routed through `mergeTheme`/`deriveTokens`
 * (Requirement: `deriveTokens()` Never Processes Raw Scales) and do not need
 * `TransferState` round-tripping — they are a deterministic, same-tick
 * pass-through of the literal object a consumer passed to `provideHaTheme()`,
 * identical on server and browser, applied to the DOM by
 * `HaThemeService.writeToDom()` via `foundation-overrides.ts`/
 * `component-overrides.ts`.
 */
export interface HaThemeOverridesSnapshot {
  foundation?: HaFoundationThemeInput;
  components?: HaComponentsThemeInput;
}

/**
 * DI token carrying the Foundation/Component override layers registered by
 * `provideHaTheme()`. Always provided (possibly with `undefined` fields)
 * whenever `provideHaTheme()` is used.
 */
export const HA_THEME_OVERRIDES_TOKEN = new InjectionToken<HaThemeOverridesSnapshot | undefined>(
  'ha-theme-overrides',
);
