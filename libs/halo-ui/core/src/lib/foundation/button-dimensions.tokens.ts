import { HA_GAP_SCALE, HA_PADDING_X_SCALE, HA_RADIUS_SCALE } from './foundation.tokens';

/**
 * Button dimension source data, split into a confirmed set and a
 * placeholder set — physically separate constants so a reader cannot
 * mistake one for the other. Consumed by
 * `component-default-values.tokens.ts` to build the `--ha-button-*` defaults
 * the runtime Theme Engine writes.
 *
 * `height` is intentionally realized downstream as `min-height`: a
 * fixed `height` would clip a wrapped/long/i18n label. This file stores the
 * raw "height" concept; the CSS property choice is made by the consumer of
 * these values.
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
