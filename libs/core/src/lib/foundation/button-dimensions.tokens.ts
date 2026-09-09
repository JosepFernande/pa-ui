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
    radius: '12px',
    paddingX: '12px',
    gap: '8px',
  },
  md: {
    minHeight: '40px',
    minWidth: '224px',
    radius: '24px',
    paddingX: '16px',
    gap: '10px',
  },
  lg: {
    minHeight: '48px',
    minWidth: '280px',
    radius: '32px',
    paddingX: '20px',
    gap: '12px',
  },
} as const;
