/**
 * Foundation layer constants: raw color scales, generic size scales
 * (spacing/gap/radius/icon-size), and the typography scale. Static,
 * unprefixed, shipped as CSS via `theme.css` (D1) — never routed through
 * the runtime Theme Engine (Requirement: `deriveTokens()` Never Processes
 * Raw Scales).
 *
 * Values sourced from `pa-ui-default-theme-design-values` (color palette,
 * icon sizes, typography font-size/weight) except where noted otherwise.
 */
import type {
  PaColorScale,
  PaFontWeightScale,
  PaFoundationPalette,
  PaPartialColorScale,
  PaSizeScale,
  PaTypographyScale,
} from './foundation.types';

/**
 * The 4 brand families, each a complete 11-step scale (25-900). `satisfies`
 * enforces completeness here — omitting a step is a compile error — while
 * the exported constant widens to the open `PaFoundationPalette` type
 * (Requirement: adding a 5th family requires no type change).
 */
const PA_BRAND_PALETTE = {
  'dark-blue': {
    25: '#f2f6f7',
    50: '#e6edf0',
    100: '#cedbe1',
    200: '#9db8c3',
    300: '#6c95a6',
    400: '#3b7288',
    500: '#0a4f6b',
    600: '#083f55',
    700: '#062f40',
    800: '#041f2a',
    900: '#020f15',
  },
  'light-blue': {
    25: '#f3f7fa',
    50: '#e7f0f5',
    100: '#d0e2eb',
    200: '#a1c5d8',
    300: '#73a9c4',
    400: '#448cb1',
    500: '#16709e',
    600: '#11597e',
    700: '#0d435e',
    800: '#082c3f',
    900: '#04161f',
  },
  'dark-green': {
    25: '#f6f8f2',
    50: '#edf1e5',
    100: '#dce4cc',
    200: '#b9c999',
    300: '#96ae67',
    400: '#739334',
    500: '#507802',
    600: '#406001',
    700: '#304801',
    800: '#203000',
    900: '#101800',
  },
  'light-green': {
    25: '#f9fbf3',
    50: '#f3f8e8',
    100: '#e8f2d2',
    200: '#d2e5a6',
    300: '#bbd879',
    400: '#a5cb4d',
    500: '#8fbf21',
    600: '#72981a',
    700: '#557213',
    800: '#394c0d',
    900: '#1c2606',
  },
} satisfies Record<'dark-blue' | 'light-blue' | 'dark-green' | 'light-green', PaColorScale>;

/** `neutral` ships only 5 of 11 steps (design data) — `PaPartialColorScale`, not `PaColorScale`. */
const PA_NEUTRAL_PALETTE = {
  neutral: {
    900: '#4c4c4c',
    700: '#828282',
    500: '#b8b8b8',
    200: '#ededed',
    50: '#fafafa',
  },
} satisfies Record<'neutral', PaPartialColorScale>;

export const PA_FOUNDATION_PALETTE: PaFoundationPalette = {
  ...PA_BRAND_PALETTE,
  ...PA_NEUTRAL_PALETTE,
};

/**
 * Generic spacing scale. NOT sourced from any confirmed design value (no
 * spacing scale was ever provided — see `audit/pa-ui-foundation-tokens-triangulation`,
 * obs #341: "Spacing ... NO tienen diseño decidido en ninguna de las 3
 * fuentes"). Chosen as a conventional 4/8px-based progression; `md` (16px)
 * happens to match the Figma-confirmed Button `md` horizontal padding.
 * Assistant-authored, pending product/design confirmation — analogous in
 * spirit to D5's Button `sm`/`lg` placeholders, but not a spec-mandated
 * "provisional" CSS marker (no spec/design requirement demands one for this
 * generic scale).
 */
export const PA_SPACING_SCALE: PaSizeScale = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
};

/**
 * Generic gap scale — same assistant-authored status as `PA_SPACING_SCALE`.
 * Kept as an independent named scale (not a `PA_SPACING_SCALE` alias) per
 * design's explicit listing of "spacing, gap, radius, ..." as distinct
 * scales, even though the two currently share identical values.
 */
export const PA_GAP_SCALE: PaSizeScale = {
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
export const PA_RADIUS_SCALE: PaSizeScale = {
  xs: '2px',
  sm: '4px',
  md: '8px',
  lg: '16px',
  xl: '24px',
};

/** Icon size scale — CONFIRMED design values (Flaticon-driven, `pa-ui-default-theme-design-values`). */
export const PA_ICON_SIZE_SCALE: PaSizeScale = {
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
export const PA_FONT_WEIGHT_SCALE: PaFontWeightScale = {
  regular: '400',
  semibold: '600',
  bold: '700',
};

/** System-stack font-family declaration. No `@font-face`/CDN import — Montserrat is a consumer responsibility (design D1/open-question). */
export const PA_FONT_FAMILY =
  "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

/**
 * Typography scale. `fontSize`/`fontWeight` are CONFIRMED design values
 * (`pa-ui-default-theme-design-values`); `lineHeight` was not provided by
 * any source and is an assistant-authored standard convention (1.25 for
 * headings, 1.5 for body-scale text), pending design confirmation.
 * Role keys are kebab-case, matching the palette family key convention.
 */
export const PA_TYPOGRAPHY_SCALE: PaTypographyScale = {
  h1: { fontSize: '2rem', fontWeight: PA_FONT_WEIGHT_SCALE.bold, lineHeight: '1.25' },
  h2: { fontSize: '1.5rem', fontWeight: PA_FONT_WEIGHT_SCALE.bold, lineHeight: '1.25' },
  h3: { fontSize: '1.125rem', fontWeight: PA_FONT_WEIGHT_SCALE.bold, lineHeight: '1.3' },
  h4: { fontSize: '1rem', fontWeight: PA_FONT_WEIGHT_SCALE.bold, lineHeight: '1.3' },
  body: { fontSize: '1rem', fontWeight: PA_FONT_WEIGHT_SCALE.regular, lineHeight: '1.5' },
  'small-body': {
    fontSize: '0.875rem',
    fontWeight: PA_FONT_WEIGHT_SCALE.regular,
    lineHeight: '1.5',
  },
  caption: { fontSize: '0.75rem', fontWeight: PA_FONT_WEIGHT_SCALE.regular, lineHeight: '1.5' },
};
