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
import { PA_COMPONENT_TOKEN_DEFAULTS } from './component-defaults.tokens';
import {
  PA_FONT_FAMILY,
  PA_FONT_WEIGHT_SCALE,
  PA_FOUNDATION_PALETTE,
  PA_GAP_SCALE,
  PA_ICON_SIZE_SCALE,
  PA_RADIUS_SCALE,
  PA_SPACING_SCALE,
  PA_TYPOGRAPHY_SCALE,
} from './foundation.tokens';
import { PA_SIZE_STEPS } from './foundation.types';
import type { PaSizeScale, PaTypographyScale } from './foundation.types';

/** `--{family}-{step}` for every declared step of every color family (unprefixed, raw). */
function paletteToCssVariables(): ThemeCssVariables {
  const result: ThemeCssVariables = {};
  for (const [family, scale] of Object.entries(PA_FOUNDATION_PALETTE)) {
    for (const [step, value] of Object.entries(scale)) {
      result[`--${family}-${step}`] = value;
    }
  }
  return result;
}

/** `--{prefix}-{xs|sm|md|lg|xl}` (unprefixed, raw) for a generic size scale. */
function sizeScaleToCssVariables(prefix: string, scale: PaSizeScale): ThemeCssVariables {
  const result: ThemeCssVariables = {};
  for (const step of PA_SIZE_STEPS) {
    result[`--${prefix}-${step}`] = scale[step];
  }
  return result;
}

/** `--font-size-{role}` / `--font-weight-{role}` / `--line-height-{role}` (unprefixed, raw). */
function typographyToCssVariables(scale: PaTypographyScale): ThemeCssVariables {
  const result: ThemeCssVariables = {};
  for (const [role, { fontSize, fontWeight, lineHeight }] of Object.entries(scale)) {
    result[`--font-size-${role}`] = fontSize;
    result[`--font-weight-${role}`] = fontWeight;
    result[`--line-height-${role}`] = lineHeight;
  }
  return result;
}

/**
 * Semantic non-color passthrough layer: `--pa-{name}` aliasing the
 * unprefixed foundation var via `var()` (never duplicating the literal),
 * exactly one alias per foundation non-color entry. Mirrors
 * `theme/semantic-tokens.ts`'s color passthrough (`--pa-color-x` -> `--pa-x`)
 * but for spacing/gap/radius/icon-size/typography/font-family.
 */
function semanticNonColorPassthrough(): ThemeCssVariables {
  const result: ThemeCssVariables = {};

  for (const step of PA_SIZE_STEPS) {
    result[`--pa-spacing-${step}`] = `var(--spacing-${step})`;
    result[`--pa-gap-${step}`] = `var(--gap-${step})`;
    result[`--pa-radius-${step}`] = `var(--radius-${step})`;
    result[`--pa-icon-size-${step}`] = `var(--icon-size-${step})`;
  }

  for (const role of Object.keys(PA_TYPOGRAPHY_SCALE)) {
    result[`--pa-font-size-${role}`] = `var(--font-size-${role})`;
    result[`--pa-font-weight-${role}`] = `var(--font-weight-${role})`;
    result[`--pa-line-height-${role}`] = `var(--line-height-${role})`;
  }

  result['--pa-font-family'] = 'var(--font-family)';

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
    ...sizeScaleToCssVariables('spacing', PA_SPACING_SCALE),
    ...sizeScaleToCssVariables('gap', PA_GAP_SCALE),
    ...sizeScaleToCssVariables('radius', PA_RADIUS_SCALE),
    ...sizeScaleToCssVariables('icon-size', PA_ICON_SIZE_SCALE),
    ...typographyToCssVariables(PA_TYPOGRAPHY_SCALE),
    '--font-family': PA_FONT_FAMILY,
    '--font-weight-regular': PA_FONT_WEIGHT_SCALE.regular,
    '--font-weight-semibold': PA_FONT_WEIGHT_SCALE.semibold,
    '--font-weight-bold': PA_FONT_WEIGHT_SCALE.bold,
    ...semanticNonColorPassthrough(),
    ...PA_COMPONENT_TOKEN_DEFAULTS,
  };
}
