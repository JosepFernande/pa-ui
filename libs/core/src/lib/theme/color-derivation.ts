/**
 * Pure derivation policy layer: composes `color-math.ts` primitives into
 * hover/active/contrast token variants and the public `deriveTokens(theme)`
 * entry point. Zero `@angular/*` imports and `TestBed`-free (Requirement:
 * Explicit Non-Requirements). Fail-soft on malformed hex — warns and skips
 * (never throws), mirroring `mergeTheme`'s never-throw contract.
 */
import { hexToHsl, hslToHex, hslToRgb, relativeLuminance } from './color-math';
import type { HSL } from './color-math';
import type { ResolvedTheme, ThemeCssVariables } from './theme.tokens';

/** Lightness delta applied for hover (+) and active (-) variants. */
export const LIGHTNESS_STEP = 8;

/**
 * Shifts HSL lightness by `deltaL`, preserving hue and saturation, clamped
 * to `[0,100]` (Requirement: HSL Lightness Derivation).
 */
export function adjustLightness(hsl: HSL, deltaL: number): HSL {
  return {
    h: hsl.h,
    s: hsl.s,
    l: Math.min(100, Math.max(0, hsl.l + deltaL)),
  };
}

/**
 * Selects `#ffffff` or `#000000`, whichever yields the higher WCAG 2.1
 * contrast ratio against the base color's relative luminance (Requirement:
 * WCAG Contrast Foreground Selection). Uses real gamma-corrected luminance,
 * NOT the naive 0.299/0.587/0.114 brightness-threshold heuristic.
 */
export function getContrastColor(hsl: HSL): string {
  const luminance = relativeLuminance(hslToRgb(hsl));
  const contrastWithWhite = 1.05 / (luminance + 0.05);
  const contrastWithBlack = (luminance + 0.05) / 0.05;

  return contrastWithWhite >= contrastWithBlack ? '#ffffff' : '#000000';
}

/**
 * Sanitizes a raw color key to `[a-z0-9-]`: lowercases, trims, replaces
 * spaces/underscores with dashes, strips any other disallowed character,
 * and collapses repeated dashes (Requirement: Color Name Normalization).
 * Pure — does not warn; callers (`deriveTokens`) emit `console.warn` when
 * the returned name differs from the raw input.
 */
export function normalizeColorName(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
}

/**
 * Walks `theme.colors` in insertion order and emits a flat
 * `--pa-color-{name}[-hover|-active|-contrast]` map (Requirement: CSS
 * Variable Map Output Shape). Per entry: normalize the key (warn if
 * sanitized), detect name collisions (warn, last-write-wins via object-key
 * overwrite), then derive the 4 variant values. Malformed hex values are
 * warned and skipped — `deriveTokens` never throws (resolved Open Question
 * 1). The base token is emitted verbatim, exactly as registered (resolved
 * Open Question 2) — only hover/active/contrast round-trip through HSL.
 */
export function deriveTokens(theme: ResolvedTheme): ThemeCssVariables {
  const result: ThemeCssVariables = {};
  const seen = new Set<string>();

  for (const [rawName, hex] of Object.entries(theme.colors)) {
    const name = normalizeColorName(rawName);

    if (name !== rawName) {
      console.warn(`[pa-ui] deriveTokens: color key "${rawName}" was sanitized to "${name}".`);
    }

    if (seen.has(name)) {
      console.warn(
        `[pa-ui] deriveTokens: color key "${name}" has a naming collision with a previously processed key; the later value wins.`,
      );
    }
    seen.add(name);

    let hsl: HSL;
    try {
      hsl = hexToHsl(hex);
    } catch {
      console.warn(
        `[pa-ui] deriveTokens: invalid color value "${hex}" for key "${name}"; skipping this color.`,
      );
      continue;
    }

    result[`--pa-color-${name}`] = hex;
    result[`--pa-color-${name}-hover`] = hslToHex(adjustLightness(hsl, LIGHTNESS_STEP));
    result[`--pa-color-${name}-active`] = hslToHex(adjustLightness(hsl, -LIGHTNESS_STEP));
    result[`--pa-color-${name}-contrast`] = getContrastColor(hsl);
  }

  return result;
}
