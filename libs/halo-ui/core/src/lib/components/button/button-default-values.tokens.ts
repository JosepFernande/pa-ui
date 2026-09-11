import type { HaButtonTokens } from './button-token-shapes';
import {
  HA_GAP_SCALE,
  HA_PADDING_X_SCALE,
  HA_RADIUS_SCALE,
} from '../../foundation/foundation.tokens';

/**
 * Button dimension source data, split into a confirmed set and a
 * placeholder set — physically separate constants so a reader cannot
 * mistake one for the other. Consumed below to build the
 * `HA_BUTTON_TOKEN_DEFAULT_VALUES` the runtime Theme Engine writes.
 *
 * `height` is intentionally realized downstream as `min-height`: a
 * fixed `height` would clip a wrapped/long/i18n label. This constant stores
 * the raw "height" concept; the CSS property choice is made by the consumer.
 */
export const HA_BUTTON_DIMENSIONS = {
  sm: {
    minHeight: '32px',
    minWidth: '200px',
    radius: HA_RADIUS_SCALE.sm,
    paddingX: HA_PADDING_X_SCALE.sm,
    gap: HA_GAP_SCALE.sm,
  },
  md: {
    minHeight: '40px',
    minWidth: '224px',
    radius: HA_RADIUS_SCALE.md,
    paddingX: HA_PADDING_X_SCALE.md,
    gap: HA_GAP_SCALE.md,
  },
  lg: {
    minHeight: '48px',
    minWidth: '280px',
    radius: HA_RADIUS_SCALE.lg,
    paddingX: HA_PADDING_X_SCALE.lg,
    gap: HA_GAP_SCALE.lg,
  },
} as const;

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
