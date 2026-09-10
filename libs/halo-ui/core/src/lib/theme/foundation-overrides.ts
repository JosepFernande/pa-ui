/**
 * Full CSS-variable builder for the Foundation layer. Deep-merges a
 * consumer's `HaTheme.foundation` override over `HA_DEFAULT_THEME.foundation`
 * and emits the COMPLETE flattened `--*` custom-property map every time —
 * not just the overridden subset. The Foundation layer is now built by the
 * runtime Theme Engine on every write (`HaThemeService.writeToDom()`)
 * instead of being shipped as a hand-authored static stylesheet.
 *
 * Same pure-function, zero-`@angular/*`, `TestBed`-free style as
 * `color-derivation.ts`/`semantic-tokens.ts`. Deliberately independent from
 * `deriveTokens()`/`mergeTheme()` (Requirement: `deriveTokens()` Never
 * Processes Raw Scales, enforced by
 * `foundation/no-raw-scale-in-theme-engine.spec.ts`): a Foundation value is a
 * raw scale value (a `--primary-600`-style unprefixed custom property),
 * never a semantic `HaColorValue` entry, so it must never be fed through the
 * hex/HSL color-math pipeline.
 *
 * CSS custom-property naming matches the Foundation layer's established
 * convention:
 *   - palette:     `--{family}-{step}`        e.g. `--primary-600`
 *   - spacing:     `--spacing-{sm|md|lg}`
 *   - gap:         `--gap-{sm|md|lg}`
 *   - radius:      `--radius-{sm|md|lg}`
 *   - icon size:   `--icon-size-{sm|md|lg}`
 *   - font weight: `--font-weight-{regular|semibold|bold}`
 *   - font family: `--font-family`
 *   - typography:  `--font-size-{role}` / `--font-weight-{role}` /
 *                  `--line-height-{role}`
 *   - semantic non-color passthrough: `--ha-spacing-{step}` etc., a static
 *     1:1 `var()` alias of the matching Foundation var (see below).
 */
import { HA_SIZE_STEPS } from '../foundation/foundation.types';
import { HA_DEFAULT_THEME } from './default-theme';
import type { HaFoundationThemeInput, ThemeCssVariables } from './theme.tokens';

const SIZE_SCALE_PREFIXES: ReadonlyArray<
  readonly [prefix: string, key: 'spacing' | 'gap' | 'radius' | 'iconSize']
> = [
  ['spacing', 'spacing'],
  ['gap', 'gap'],
  ['radius', 'radius'],
  ['icon-size', 'iconSize'],
];

/** Defensive: is `value` a plain, non-array, non-null object? */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Returns a NEW flat string map: every string-valued entry of `base`, then
 * every string-valued entry of `override` written on top (fail-soft: a
 * non-object `override` or a non-string leaf is skipped with a
 * `console.warn`/silently, never thrown). Neither `base` nor `override` is
 * ever mutated.
 */
function mergeStringRecord(
  base: Record<string, unknown>,
  override: unknown,
  warnLabel: string,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(base)) {
    if (typeof value === 'string') {
      result[key] = value;
    }
  }

  if (override === undefined) {
    return result;
  }
  if (!isPlainObject(override)) {
    console.warn(`[halo-ui] toFoundationCssVariables: "${warnLabel}" is not an object; skipping.`);
    return result;
  }
  for (const [key, value] of Object.entries(override)) {
    if (typeof value !== 'string') {
      continue;
    }
    result[key] = value;
  }
  return result;
}

/**
 * Converts a `HaFoundationThemeInput` (or `undefined`) into the COMPLETE flat
 * `ThemeCssVariables` map for the Foundation layer: `HA_DEFAULT_THEME.
 * foundation` flattened first, then the consumer's override (if any)
 * layered on top per-leaf. Fail-soft: a malformed group (not an object) or a
 * non-string leaf is skipped with a `console.warn`, never thrown — mirrors
 * `deriveTokens()`'s warn-and-skip contract so a single bad key can never
 * block bootstrap.
 */
export function toFoundationCssVariables(
  input: HaFoundationThemeInput | undefined,
): ThemeCssVariables {
  const result: ThemeCssVariables = {};
  const defaults = HA_DEFAULT_THEME.foundation;

  // --- Palette: default families ∪ override families, each family's steps merged. ---
  const paletteOverride = input?.palette;
  const paletteFamilies = new Set<string>(Object.keys(defaults.palette));
  if (paletteOverride !== undefined) {
    if (isPlainObject(paletteOverride)) {
      for (const family of Object.keys(paletteOverride)) {
        paletteFamilies.add(family);
      }
    } else {
      console.warn('[halo-ui] toFoundationCssVariables: "palette" is not an object; skipping.');
    }
  }
  for (const family of paletteFamilies) {
    const defaultSteps: Record<string, unknown> = defaults.palette[family] ?? {};
    const overrideSteps = isPlainObject(paletteOverride) ? paletteOverride[family] : undefined;
    const merged = mergeStringRecord(defaultSteps, overrideSteps, `palette.${family}`);
    for (const [step, value] of Object.entries(merged)) {
      result[`--${family}-${step}`] = value;
    }
  }

  // --- Generic size scales: spacing / gap / radius / icon-size. ---
  for (const [cssPrefix, inputKey] of SIZE_SCALE_PREFIXES) {
    const merged = mergeStringRecord(defaults[inputKey], input?.[inputKey], inputKey);
    for (const [step, value] of Object.entries(merged)) {
      result[`--${cssPrefix}-${step}`] = value;
    }
  }

  // --- Font weight scale. ---
  const fontWeight = mergeStringRecord(defaults.fontWeight, input?.fontWeight, 'fontWeight');
  for (const [name, value] of Object.entries(fontWeight)) {
    result[`--font-weight-${name}`] = value;
  }

  // --- Font family. ---
  let fontFamily: string = defaults.fontFamily;
  if (input?.fontFamily !== undefined) {
    if (typeof input.fontFamily === 'string') {
      fontFamily = input.fontFamily;
    } else {
      console.warn('[halo-ui] toFoundationCssVariables: "fontFamily" is not a string; skipping.');
    }
  }
  result['--font-family'] = fontFamily;

  // --- Typography roles: default roles ∪ override roles, each role's fontSize/fontWeight/lineHeight merged. ---
  const typographyOverride = input?.typography;
  const roles = new Set<string>(Object.keys(defaults.typography));
  if (typographyOverride !== undefined) {
    if (isPlainObject(typographyOverride)) {
      for (const role of Object.keys(typographyOverride)) {
        roles.add(role);
      }
    } else {
      console.warn('[halo-ui] toFoundationCssVariables: "typography" is not an object; skipping.');
    }
  }
  for (const role of roles) {
    const defaultRole = defaults.typography[role];
    let fontSize = defaultRole?.fontSize ?? '';
    let fontWeightRole = defaultRole?.fontWeight ?? '';
    let lineHeight = defaultRole?.lineHeight ?? '';

    const overrideRole = isPlainObject(typographyOverride) ? typographyOverride[role] : undefined;
    if (overrideRole !== undefined) {
      if (isPlainObject(overrideRole)) {
        if (typeof overrideRole['fontSize'] === 'string') {
          fontSize = overrideRole['fontSize'];
        }
        if (typeof overrideRole['fontWeight'] === 'string') {
          fontWeightRole = overrideRole['fontWeight'];
        }
        if (typeof overrideRole['lineHeight'] === 'string') {
          lineHeight = overrideRole['lineHeight'];
        }
      } else {
        console.warn(
          `[halo-ui] toFoundationCssVariables: typography role "${role}" is not an object; skipping.`,
        );
      }
    }

    result[`--font-size-${role}`] = fontSize;
    result[`--font-weight-${role}`] = fontWeightRole;
    result[`--line-height-${role}`] = lineHeight;
  }

  // --- Semantic non-color passthrough: 1:1 `--ha-*` alias of the Foundation
  // var, always emitted regardless of override value — CSS `var()` resolves
  // the CURRENT value of the aliased custom property at render time, so the
  // alias itself never needs to change when the underlying value does. ---
  for (const step of HA_SIZE_STEPS) {
    result[`--ha-spacing-${step}`] = `var(--spacing-${step})`;
    result[`--ha-gap-${step}`] = `var(--gap-${step})`;
    result[`--ha-radius-${step}`] = `var(--radius-${step})`;
    result[`--ha-icon-size-${step}`] = `var(--icon-size-${step})`;
  }
  for (const role of roles) {
    result[`--ha-font-size-${role}`] = `var(--font-size-${role})`;
    result[`--ha-font-weight-${role}`] = `var(--font-weight-${role})`;
    result[`--ha-line-height-${role}`] = `var(--line-height-${role})`;
  }
  result['--ha-font-family'] = 'var(--font-family)';

  return result;
}
