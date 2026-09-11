import { HA_INPUT_DIMENSIONS_SCALE } from '../../foundation/foundation.tokens';
import type { HaSelectTokens } from './select-token-shapes';

/**
 * Default values for every `--ha-select-*` design token, shaped like
 * `HaSelectTokens`. Trigger `padding*`/`min-height*`/`radius*` import the
 * same shared `HA_INPUT_DIMENSIONS_SCALE` (`foundation/foundation.tokens.ts`)
 * Input's own defaults use — a select trigger MUST match input field metrics
 * exactly, so both read from the one scale instead of two hand-kept tables.
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
    panelPaddingY: 'var(--gap-sm)',
    panelOffset: 'var(--gap-sm)',
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
