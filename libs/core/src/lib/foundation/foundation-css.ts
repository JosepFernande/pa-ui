/**
 * INTERNAL static CSS-variable generator for the Foundation layer. Mirrors
 * the shape of `theme/color-derivation.ts`'s `deriveTokens` (same
 * `ThemeCssVariables` output type) but for spacing/gap/radius/typography/
 * icon-size/color-scale + component defaults, never for the runtime
 * per-app color palette.
 *
 * Deliberately NOT exported from `public-api.ts` (D4) — there is no public
 * runtime path to these values, which is how "Foundation is static, not
 * runtime-mutable" (decision/pa-ui-default-theme-static-css) is enforced
 * structurally (no code path exists) rather than by convention. The ONLY
 * consumer of this function is `foundation-css.spec.ts`, which uses it to
 * assert `theme.css` (the actually shipped artifact) never drifts from it.
 */
import type { ThemeCssVariables } from '../theme/theme.tokens';
import { HA_COMPONENT_TOKEN_DEFAULTS } from './component-defaults.tokens';
import {
  HA_FONT_FAMILY,
  HA_FONT_WEIGHT_SCALE,
  HA_FOUNDATION_PALETTE,
  HA_GAP_SCALE,
  HA_ICON_SIZE_SCALE,
  HA_RADIUS_SCALE,
  HA_SPACING_SCALE,
  HA_TYPOGRAPHY_SCALE,
} from './foundation.tokens';
import { HA_SIZE_STEPS } from './foundation.types';
import type { HaSizeScale, HaTypographyScale } from './foundation.types';

/** `--{family}-{step}` for every declared step of every color family (unprefixed, raw). */
function paletteToCssVariables(): ThemeCssVariables {
  const result: ThemeCssVariables = {};
  for (const [family, scale] of Object.entries(HA_FOUNDATION_PALETTE)) {
    for (const [step, value] of Object.entries(scale)) {
      result[`--${family}-${step}`] = value;
    }
  }
  return result;
}

/** `--{prefix}-{xs|sm|md|lg|xl}` (unprefixed, raw) for a generic size scale. */
function sizeScaleToCssVariables(prefix: string, scale: HaSizeScale): ThemeCssVariables {
  const result: ThemeCssVariables = {};
  for (const step of HA_SIZE_STEPS) {
    result[`--${prefix}-${step}`] = scale[step];
  }
  return result;
}

/** `--font-size-{role}` / `--font-weight-{role}` / `--line-height-{role}` (unprefixed, raw). */
function typographyToCssVariables(scale: HaTypographyScale): ThemeCssVariables {
  const result: ThemeCssVariables = {};
  for (const [role, { fontSize, fontWeight, lineHeight }] of Object.entries(scale)) {
    result[`--font-size-${role}`] = fontSize;
    result[`--font-weight-${role}`] = fontWeight;
    result[`--line-height-${role}`] = lineHeight;
  }
  return result;
}

/**
 * Semantic non-color passthrough layer: `--ha-{name}` aliasing the
 * unprefixed foundation var via `var()` (never duplicating the literal),
 * exactly one alias per foundation non-color entry. Mirrors
 * `theme/semantic-tokens.ts`'s color passthrough (`--ha-color-x` -> `--ha-x`)
 * but for spacing/gap/radius/icon-size/typography/font-family.
 */
function semanticNonColorPassthrough(): ThemeCssVariables {
  const result: ThemeCssVariables = {};

  for (const step of HA_SIZE_STEPS) {
    result[`--ha-spacing-${step}`] = `var(--spacing-${step})`;
    result[`--ha-gap-${step}`] = `var(--gap-${step})`;
    result[`--ha-radius-${step}`] = `var(--radius-${step})`;
    result[`--ha-icon-size-${step}`] = `var(--icon-size-${step})`;
  }

  for (const role of Object.keys(HA_TYPOGRAPHY_SCALE)) {
    result[`--ha-font-size-${role}`] = `var(--font-size-${role})`;
    result[`--ha-font-weight-${role}`] = `var(--font-weight-${role})`;
    result[`--ha-line-height-${role}`] = `var(--line-height-${role})`;
  }

  result['--ha-font-family'] = 'var(--font-family)';

  return result;
}

/**
 * Assembles the FULL Foundation CSS variable map: raw color scales, generic
 * size scales, typography, font metadata, the semantic non-color passthrough
 * layer, and component defaults — the same content shipped statically in
 * `theme.css`. Pure — no DOM writes, no side effects.
 */
export function toFoundationCssVariables(): ThemeCssVariables {
  return {
    ...paletteToCssVariables(),
    ...sizeScaleToCssVariables('spacing', HA_SPACING_SCALE),
    ...sizeScaleToCssVariables('gap', HA_GAP_SCALE),
    ...sizeScaleToCssVariables('radius', HA_RADIUS_SCALE),
    ...sizeScaleToCssVariables('icon-size', HA_ICON_SIZE_SCALE),
    ...typographyToCssVariables(HA_TYPOGRAPHY_SCALE),
    '--font-family': HA_FONT_FAMILY,
    '--font-weight-regular': HA_FONT_WEIGHT_SCALE.regular,
    '--font-weight-semibold': HA_FONT_WEIGHT_SCALE.semibold,
    '--font-weight-bold': HA_FONT_WEIGHT_SCALE.bold,
    ...semanticNonColorPassthrough(),
    ...HA_COMPONENT_TOKEN_DEFAULTS,
  };
}
