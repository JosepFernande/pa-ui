/**
 * Foundation layer constants: raw color scales, generic size scales
 * (spacing/gap/radius/icon-size), and the typography scale. Static,
 * unprefixed, shipped as CSS via `theme.css` (D1) — never routed through
 * the runtime Theme Engine (Requirement: `deriveTokens()` Never Processes
 * Raw Scales).
 *
 * Values sourced from `halo-ui-default-theme-design-values` (color palette,
 * icon sizes, typography font-size/weight) except where noted otherwise.
 */
import type {
  HaColorScale,
  HaFontWeightScale,
  HaFoundationPalette,
  HaPartialColorScale,
  HaSizeScale,
  HaTypographyScale,
} from './foundation.types';

/**
 * The single brand family, a complete 11-step scale (25-900). `satisfies`
 * enforces completeness here — omitting a step is a compile error — while
 * the exported constant widens to the open `HaFoundationPalette` type
 * (Requirement: adding a 5th family requires no type change).
 *
 * Replaces the former `dark-blue`/`light-blue`/`dark-green`/`light-green`
 * two-brand-family palette (removed — breaking change, no alias kept). 100,
 * 200, and 600 are the product-specified anchors (`#d4ddff`, `#a9bbff`,
 * `#4f46e5`); the remaining steps are interpolated to keep a smooth,
 * monotonically-darkening scale consistent with the previous scales' shape.
 */
const HA_BRAND_PALETTE = {
  primary: {
    25: '#f8faff',
    50: '#eef2ff',
    100: '#d4ddff',
    200: '#a9bbff',
    300: '#818cf8',
    400: '#6366f1',
    500: '#5956eb',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
  },
} satisfies Record<'primary', HaColorScale>;

/** `neutral` ships only 5 of 11 steps (design data) — `HaPartialColorScale`, not `HaColorScale`. */
const HA_NEUTRAL_PALETTE = {
  neutral: {
    900: '#4c4c4c',
    700: '#828282',
    500: '#b8b8b8',
    200: '#ededed',
    50: '#fafafa',
  },
} satisfies Record<'neutral', HaPartialColorScale>;

export const HA_FOUNDATION_PALETTE: HaFoundationPalette = {
  ...HA_BRAND_PALETTE,
  ...HA_NEUTRAL_PALETTE,
};

/**
 * Generic spacing scale. NOT sourced from any confirmed design value (no
 * spacing scale was ever provided — see `audit/halo-ui-foundation-tokens-triangulation`,
 * obs #341: "Spacing ... NO tienen diseño decidido en ninguna de las 3
 * fuentes"). Chosen as a conventional 4/8px-based progression; `md` (16px)
 * happens to match the Figma-confirmed Button `md` horizontal padding.
 * Assistant-authored, pending product/design confirmation — analogous in
 * spirit to D5's Button `sm`/`lg` placeholders, but not a spec-mandated
 * "provisional" CSS marker (no spec/design requirement demands one for this
 * generic scale).
 */
export const HA_SPACING_SCALE: HaSizeScale = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
};

/**
 * Generic gap scale — same assistant-authored status as `HA_SPACING_SCALE`.
 * Kept as an independent named scale (not a `HA_SPACING_SCALE` alias) per
 * design's explicit listing of "spacing, gap, radius, ..." as distinct
 * scales, even though the two currently share identical values.
 */
export const HA_GAP_SCALE: HaSizeScale = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
};

/**
 * Generic radius scale — assistant-authored, same status as spacing/gap.
 * `sm` (4px) intentionally matches the Figma-confirmed Button radius (4px,
 * constant across all sizes) as a real anchor point.
 */
export const HA_RADIUS_SCALE: HaSizeScale = {
  xs: '2px',
  sm: '4px',
  md: '8px',
  lg: '16px',
  xl: '24px',
};

/** Icon size scale — CONFIRMED design values (Flaticon-driven, `halo-ui-default-theme-design-values`). */
export const HA_ICON_SIZE_SCALE: HaSizeScale = {
  xs: '16px',
  sm: '20px',
  md: '24px',
  lg: '32px',
  xl: '40px',
};

/**
 * Font weight scale. Numeric CSS `font-weight` values for Montserrat's
 * Regular/Semibold/Bold cuts (confirmed design values name the 3 weights;
 * the numeric mapping itself is the assistant's standard Montserrat
 * assignment — Semibold has no typography role using it yet, kept available
 * for component-level use, e.g. Button).
 */
export const HA_FONT_WEIGHT_SCALE: HaFontWeightScale = {
  regular: '400',
  semibold: '600',
  bold: '700',
};

/** System-stack font-family declaration. No `@font-face`/CDN import — Montserrat is a consumer responsibility (design D1/open-question). */
export const HA_FONT_FAMILY =
  "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

/**
 * Typography scale. `fontSize`/`fontWeight` are CONFIRMED design values
 * (`halo-ui-default-theme-design-values`); `lineHeight` was not provided by
 * any source and is an assistant-authored standard convention (1.25 for
 * headings, 1.5 for body-scale text), pending design confirmation.
 * Role keys are kebab-case, matching the palette family key convention.
 */
export const HA_TYPOGRAPHY_SCALE: HaTypographyScale = {
  h1: { fontSize: '2rem', fontWeight: HA_FONT_WEIGHT_SCALE.bold, lineHeight: '1.25' },
  h2: { fontSize: '1.5rem', fontWeight: HA_FONT_WEIGHT_SCALE.bold, lineHeight: '1.25' },
  h3: { fontSize: '1.125rem', fontWeight: HA_FONT_WEIGHT_SCALE.bold, lineHeight: '1.3' },
  h4: { fontSize: '1rem', fontWeight: HA_FONT_WEIGHT_SCALE.bold, lineHeight: '1.3' },
  body: { fontSize: '1rem', fontWeight: HA_FONT_WEIGHT_SCALE.regular, lineHeight: '1.5' },
  'small-body': {
    fontSize: '0.875rem',
    fontWeight: HA_FONT_WEIGHT_SCALE.regular,
    lineHeight: '1.5',
  },
  caption: { fontSize: '0.75rem', fontWeight: HA_FONT_WEIGHT_SCALE.regular, lineHeight: '1.5' },
};
