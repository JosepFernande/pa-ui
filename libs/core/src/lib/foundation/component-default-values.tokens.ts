/**
 * Component-level token DEFAULT VALUES, grouped by the exact same nested
 * shape as `HaButtonTokens`/`HaInputTextTokens`/`HaSelectTokens`
 * (`theme/component-token-shapes.ts`) — real CSS values instead of the
 * `--ha-*` variable NAMEs those registries carry. This is the "real CSS
 * value" half of the Component layer; `HA_BUTTON_TOKENS` etc. are the
 * "CSS variable name" half. `HA_DEFAULT_THEME` (`theme/default-theme.ts`)
 * assembles both halves; `theme/component-overrides.ts`'s
 * `flattenComponentTokenTree()` walks a NAME registry and a matching value
 * tree (this file, or a consumer's deep-partial override) in lockstep to
 * produce the flat `--ha-*` -> value CSS map every component actually reads.
 *
 * Every value here is a CSS-valid string: either a literal, or a `var(--x)`
 * reference into the foundation (unprefixed) or semantic (`--ha-*`) color
 * layer — component defaults are the one place foundation refs are used
 * directly, mirroring the Data Flow diagram in `design.md`.
 *
 * Reshaped from the former flat `HA_BUTTON_TOKEN_DEFAULTS`/
 * `HA_INPUT_TOKEN_DEFAULTS`/`HA_SELECT_TOKEN_DEFAULTS` constants (previously
 * declared directly in `component-defaults.tokens.ts`, before the Theme
 * Engine became the runtime builder of every CSS variable): same literal
 * values, just regrouped into the nested per-concern shape. All Input/Select
 * trigger dimensions still come from `HA_INPUT_PROVISIONAL_DIMENSIONS` —
 * assistant-authored, pending design validation (no Figma source exists for
 * Input), unlike Button whose `md` row is Figma-confirmed.
 */
import type {
  HaButtonTokens,
  HaInputTextTokens,
  HaSelectTokens,
} from '../theme/component-token-shapes';
import { HA_BUTTON_DIMENSIONS } from './button-dimensions.tokens';
import { HA_INPUT_PROVISIONAL_DIMENSIONS } from './input-dimensions.tokens';

/** Default values for every `--ha-button-*` design token, shaped like `HaButtonTokens`. */
export const HA_BUTTON_TOKEN_DEFAULT_VALUES = {
  surface: {
    bg: 'var(--ha-primary)',
    color: 'var(--ha-primary-contrast)',
    border: '1px solid var(--ha-primary)',
    radius: HA_BUTTON_DIMENSIONS.md.radius,
    solidColor: 'var(--ha-primary-contrast)',
  },

  typography: {
    fontFamily: 'var(--font-family)',
    fontWeight: 'var(--font-weight-semibold)',
    lineHeight: 'var(--line-height-body)',
  },

  sizing: {
    gap: 'var(--gap-sm)',
    paddingSm: `0 ${HA_BUTTON_DIMENSIONS.sm.paddingX}`,
    paddingMd: `0 ${HA_BUTTON_DIMENSIONS.md.paddingX}`,
    paddingLg: `0 ${HA_BUTTON_DIMENSIONS.lg.paddingX}`,
    fontSm: 'var(--font-size-small-body)',
    fontMd: 'var(--font-size-body)',
    fontLg: 'var(--font-size-body)',
    minHeightSm: HA_BUTTON_DIMENSIONS.sm.minHeight,
    minHeightMd: HA_BUTTON_DIMENSIONS.md.minHeight,
    minHeightLg: HA_BUTTON_DIMENSIONS.lg.minHeight,
    minWidthSm: HA_BUTTON_DIMENSIONS.sm.minWidth,
    minWidthMd: HA_BUTTON_DIMENSIONS.md.minWidth,
    minWidthLg: HA_BUTTON_DIMENSIONS.lg.minWidth,
    gapSm: HA_BUTTON_DIMENSIONS.sm.gap,
    gapMd: HA_BUTTON_DIMENSIONS.md.gap,
    gapLg: HA_BUTTON_DIMENSIONS.lg.gap,
    radiusSm: HA_BUTTON_DIMENSIONS.sm.radius,
    radiusMd: HA_BUTTON_DIMENSIONS.md.radius,
    radiusLg: HA_BUTTON_DIMENSIONS.lg.radius,
  },

  focus: {
    focusRing: '2px solid var(--ha-primary-hover)',
    focusRingOffset: '5px',
  },

  states: {
    hoverBg: 'var(--ha-primary-hover)',
    activeBg: 'var(--ha-primary-active)',
    disabledBg: 'var(--neutral-200)',
    disabledColor: 'var(--neutral-500)',
    disabledOpacity: '0.6',
  },

  transition: {
    transitionDuration: '150ms',
    transitionEasing: 'ease-in-out',
  },

  loading: {
    loadingColor: 'var(--ha-primary-contrast)',
    spinnerSize: '1em',
    spinnerBorder: '2px solid currentColor',
    spinnerDuration: '600ms',
  },

  accessibility: {
    srOnlyWidth: '1px',
    srOnlyHeight: '1px',
    srOnlyMargin: '-1px',
  },
} as const satisfies HaButtonTokens;

/** Default values for every `--ha-input-*` design token, shaped like `HaInputTextTokens`. */
export const HA_INPUT_TOKEN_DEFAULT_VALUES = {
  surface: {
    bg: 'var(--neutral-50)',
    color: 'var(--neutral-900)',
    border: '1px solid var(--neutral-700)',
    placeholderColor: 'var(--neutral-500)',
  },

  typography: {
    fontFamily: 'var(--font-family)',
    fontWeight: 'var(--font-weight-regular)',
    lineHeight: 'var(--line-height-body)',
  },

  sizing: {
    paddingSm: `0 ${HA_INPUT_PROVISIONAL_DIMENSIONS.sm.paddingX}`,
    paddingMd: `0 ${HA_INPUT_PROVISIONAL_DIMENSIONS.md.paddingX}`,
    paddingLg: `0 ${HA_INPUT_PROVISIONAL_DIMENSIONS.lg.paddingX}`,
    fontSm: 'var(--font-size-small-body)',
    fontMd: 'var(--font-size-body)',
    fontLg: 'var(--font-size-body)',
    minHeightSm: HA_INPUT_PROVISIONAL_DIMENSIONS.sm.minHeight,
    minHeightMd: HA_INPUT_PROVISIONAL_DIMENSIONS.md.minHeight,
    minHeightLg: HA_INPUT_PROVISIONAL_DIMENSIONS.lg.minHeight,
    radiusSm: HA_INPUT_PROVISIONAL_DIMENSIONS.sm.radius,
    radiusMd: HA_INPUT_PROVISIONAL_DIMENSIONS.md.radius,
    radiusLg: HA_INPUT_PROVISIONAL_DIMENSIONS.lg.radius,
  },

  focus: {
    focusBorder: 'var(--ha-primary)',
    focusRing: '2px solid var(--ha-primary-hover)',
    focusRingOffset: '5px',
  },

  error: {
    errorBorder: 'var(--ha-error)',
    errorColor: 'var(--ha-error)',
    errorIconColor: 'var(--ha-error)',
  },

  disabled: {
    disabledBg: 'var(--neutral-200)',
    disabledColor: 'var(--neutral-500)',
    disabledOpacity: '0.6',
  },

  readonly: {
    readonlyBg: 'var(--neutral-50)',
    readonlyBorder: '1px solid var(--neutral-200)',
  },

  hint: {
    hintColor: 'var(--neutral-500)',
    hintFontSize: 'var(--font-size-caption)',
  },

  label: {
    labelColor: 'var(--neutral-700)',
    labelFontSize: 'var(--font-size-small-body)',
    labelFontWeight: 'var(--font-weight-semibold)',
  },

  transition: {
    transitionDuration: '150ms',
    transitionEasing: 'ease-in-out',
  },
} as const satisfies HaInputTextTokens;

/**
 * Default values for every `--ha-select-*` design token, shaped like
 * `HaSelectTokens`. Trigger `padding*`/`min-height*`/`radius*` reuse
 * `HA_INPUT_PROVISIONAL_DIMENSIONS` verbatim (a select trigger MUST match
 * input field metrics exactly; a copied table would drift).
 */
export const HA_SELECT_TOKEN_DEFAULT_VALUES = {
  trigger: {
    bg: 'var(--neutral-50)',
    color: 'var(--neutral-900)',
    border: '1px solid var(--neutral-700)',
    placeholderColor: 'var(--neutral-500)',
    fontFamily: 'var(--font-family)',
    fontWeight: 'var(--font-weight-regular)',
    lineHeight: 'var(--line-height-body)',
    gap: 'var(--gap-sm)',
    paddingSm: `0 ${HA_INPUT_PROVISIONAL_DIMENSIONS.sm.paddingX}`,
    paddingMd: `0 ${HA_INPUT_PROVISIONAL_DIMENSIONS.md.paddingX}`,
    paddingLg: `0 ${HA_INPUT_PROVISIONAL_DIMENSIONS.lg.paddingX}`,
    fontSm: 'var(--font-size-small-body)',
    fontMd: 'var(--font-size-body)',
    fontLg: 'var(--font-size-body)',
    minHeightSm: HA_INPUT_PROVISIONAL_DIMENSIONS.sm.minHeight,
    minHeightMd: HA_INPUT_PROVISIONAL_DIMENSIONS.md.minHeight,
    minHeightLg: HA_INPUT_PROVISIONAL_DIMENSIONS.lg.minHeight,
    radiusSm: HA_INPUT_PROVISIONAL_DIMENSIONS.sm.radius,
    radiusMd: HA_INPUT_PROVISIONAL_DIMENSIONS.md.radius,
    radiusLg: HA_INPUT_PROVISIONAL_DIMENSIONS.lg.radius,
    focusBorder: 'var(--ha-primary)',
    focusRing: '2px solid var(--ha-primary-hover)',
    focusRingOffset: '5px',
    errorBorder: 'var(--ha-error)',
    errorColor: 'var(--ha-error)',
    disabledBg: 'var(--neutral-200)',
    disabledColor: 'var(--neutral-500)',
    disabledOpacity: '0.6',
    readonlyBg: 'var(--neutral-50)',
    readonlyBorder: '1px solid var(--neutral-200)',
    transitionDuration: '150ms',
    transitionEasing: 'ease-in-out',
  },

  panel: {
    panelBg: 'var(--neutral-50)',
    panelBorder: '1px solid var(--neutral-200)',
    panelRadius: 'var(--radius-sm)',
    panelShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    panelMaxHeight: '320px',
    panelPaddingY: 'var(--gap-xs)',
    panelOffset: 'var(--gap-xs)',
  },

  option: {
    optionColor: 'var(--neutral-900)',
    optionBg: 'transparent',
    optionPaddingX: 'var(--spacing-md)',
    optionPaddingY: 'var(--spacing-sm)',
    optionMinHeight: '40px',
    optionFontSize: 'var(--font-size-body)',
    optionHoverBg: 'var(--neutral-200)',
    optionActiveBg: 'var(--neutral-200)',
    optionActiveColor: 'var(--neutral-900)',
    optionSelectedBg: 'var(--ha-primary-hover)',
    optionSelectedColor: 'var(--ha-primary-contrast)',
    optionSelectedFontWeight: 'var(--font-weight-semibold)',
    optionDisabledColor: 'var(--neutral-500)',
    optionDisabledOpacity: '0.6',
  },
} as const satisfies HaSelectTokens;
