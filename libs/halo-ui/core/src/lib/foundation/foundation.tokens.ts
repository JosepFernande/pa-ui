/**
 * Foundation layer constants: raw color scales, generic size scales
 * (spacing/gap/radius/padding-x/icon-size), and the typography scale. Static,
 * unprefixed default values, assembled into `HA_DEFAULT_THEME`
 * (`theme/default-theme.ts`) and built into `--*` CSS custom properties at
 * runtime by `theme/foundation-overrides.ts` — but NEVER passed to
 * `deriveTokens()`/routed through the hex-HSL color-math pipeline
 * (Requirement: `deriveTokens()` Never Processes Raw Scales).
 *
 * Values sourced from `halo-ui-default-theme-design-values` (color palette,
 * icon sizes, typography font-size/weight) except where noted otherwise.
 *
 * Growth policy for the generic scales below: this file is NOT a place to
 * pre-populate every dimension a component might one day need. Add a new
 * generic scale (or reference an existing one from a component's
 * `*-dimensions.tokens.ts`) only when its per-size values genuinely match
 * what another component already defines — e.g. `HA_PADDING_X_SCALE` is
 * shared verbatim by Button and Input. A dimension whose values are specific
 * to one component (even if conceptually similar, like Button's and Input's
 * differently-sized `minHeight`) stays local to that component's own
 * `*-dimensions.tokens.ts` file — do not force a shared scale onto values
 * that only coincidentally have the same shape.
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
 * `#6f5de8`); the remaining steps are interpolated to keep a smooth,
 * monotonically-darkening scale consistent with the previous scales' shape.
 */
const HA_BRAND_PALETTE = {
  primary: {
    50: '#ccc5fd',
    100: '#bcb3fa',
    200: '#ada2f6',
    300: '#9c8ff5',
    400: '#8d7ef0',
    500: '#7e6dec',
    600: '#6f5de8',
    700: '#624fe2',
    800: '#5642dd',
    900: '#432dd7',
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
 * Resolved `primary-900` anchor, precisely typed as `string` (not
 * `string | undefined`). `HA_FOUNDATION_PALETTE`'s index signature widens
 * `.primary` to `HaPartialColorScale` — fine for the open-dictionary
 * requirement it exists for, but it loses the completeness `HA_BRAND_PALETTE`
 * actually has. This constant is read directly off `HA_BRAND_PALETTE` (still
 * a complete `HaColorScale` at this point) so the semantic layer
 * (`theme/theme.tokens.ts`'s `DEFAULT_THEME`) can reference one resolved
 * scalar without indexing the widened dictionary or asserting non-null.
 */
export const HA_PRIMARY_ANCHOR: string = HA_BRAND_PALETTE.primary[900];

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
  sm: '8px',
  md: '16px',
  lg: '24px',
};

/**
 * Generic gap scale — same assistant-authored status as `HA_SPACING_SCALE`.
 * Kept as an independent named scale (not a `HA_SPACING_SCALE` alias) per
 * design's explicit listing of "spacing, gap, radius, ..." as distinct
 * scales, even though the two currently share identical values.
 */
export const HA_GAP_SCALE: HaSizeScale = {
  sm: '8px',
  md: '16px',
  lg: '24px',
};

/**
 * Generic radius scale — assistant-authored, same status as spacing/gap.
 * Consumed by Button's per-size `radius` (`button-default-values.tokens.ts`).
 */
export const HA_RADIUS_SCALE: HaSizeScale = {
  sm: '12px',
  md: '16px',
  lg: '24px',
};

/**
 * Generic horizontal-padding scale — assistant-authored, same status as
 * spacing/gap/radius. Extracted here because Button's and Input's
 * `paddingX` (`button/button-default-values.tokens.ts` /
 * `input-text/input-text-default-values.tokens.ts`) independently landed on
 * the exact same sm/md/lg values.
 */
export const HA_PADDING_X_SCALE: HaSizeScale = {
  sm: '12px',
  md: '16px',
  lg: '20px',
};

/**
 * Input dimension scale (min-height/padding-x/radius per size). ASSISTANT-
 * AUTHORED PLACEHOLDERS pending design validation — no Figma source exists
 * for Input anywhere in `halo-ui-default-theme-design-values`, so every size
 * is provisional, including `md`. `sm.minHeight` (33px) is an explicit
 * user-provided value, not an 8px-step derivation like the rest of the scale.
 * `paddingX`/`radius` reuse `HA_PADDING_X_SCALE`/`HA_RADIUS_SCALE` above.
 *
 * Promoted here (rather than living in Input's own `*-dimensions.tokens.ts`,
 * the way Button's used to) because it is shared verbatim by two components:
 * Input's own field (`input-text/input-text-default-values.tokens.ts`) and
 * Select's trigger (`select/select-default-values.tokens.ts`), which MUST
 * match Input's metrics exactly — a select trigger is visually an input, and
 * a copied table would drift.
 */
export const HA_INPUT_DIMENSIONS_SCALE = {
  sm: {
    minHeight: '33px',
    paddingX: HA_PADDING_X_SCALE.sm,
    radius: HA_RADIUS_SCALE.sm,
  },
  md: {
    minHeight: '48px',
    paddingX: HA_PADDING_X_SCALE.md,
    radius: HA_RADIUS_SCALE.md,
  },
  lg: {
    minHeight: '56px',
    paddingX: HA_PADDING_X_SCALE.lg,
    radius: HA_RADIUS_SCALE.lg,
  },
} as const;

/** Icon size scale — CONFIRMED design values (Flaticon-driven, `halo-ui-default-theme-design-values`). */
export const HA_ICON_SIZE_SCALE: HaSizeScale = {
  sm: '20px',
  md: '24px',
  lg: '32px',
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
