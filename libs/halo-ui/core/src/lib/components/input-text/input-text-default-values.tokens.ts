import { HA_PADDING_X_SCALE, HA_RADIUS_SCALE } from '../../foundation/foundation.tokens';
import type { HaInputTextTokens } from './input-text-token-shapes';

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

/**
 * Default values for every `--ha-input-*` design token, shaped like
 * `HaInputTextTokens`. Consumed by `component-defaults.tokens.ts` (flat
 * `HA_COMPONENT_TOKEN_DEFAULTS`) and `theme/default-theme.ts`
 * (`HA_DEFAULT_THEME`). Sizing dimensions come from the shared
 * `HA_INPUT_DIMENSIONS_SCALE` (`foundation/foundation.tokens.ts`) — also
 * consumed verbatim by Select's trigger, so the two never drift apart.
 */
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
    paddingSm: `0 ${HA_INPUT_DIMENSIONS_SCALE.sm.paddingX}`,
    paddingMd: `0 ${HA_INPUT_DIMENSIONS_SCALE.md.paddingX}`,
    paddingLg: `0 ${HA_INPUT_DIMENSIONS_SCALE.lg.paddingX}`,
    fontSm: 'var(--font-size-small-body)',
    fontMd: 'var(--font-size-body)',
    fontLg: 'var(--font-size-body)',
    minHeightSm: HA_INPUT_DIMENSIONS_SCALE.sm.minHeight,
    minHeightMd: HA_INPUT_DIMENSIONS_SCALE.md.minHeight,
    minHeightLg: HA_INPUT_DIMENSIONS_SCALE.lg.minHeight,
    radiusSm: HA_INPUT_DIMENSIONS_SCALE.sm.radius,
    radiusMd: HA_INPUT_DIMENSIONS_SCALE.md.radius,
    radiusLg: HA_INPUT_DIMENSIONS_SCALE.lg.radius,
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
