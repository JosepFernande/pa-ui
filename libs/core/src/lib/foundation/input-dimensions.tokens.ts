import { HA_PADDING_X_SCALE, HA_RADIUS_SCALE } from './foundation.tokens';

/**
 * Input dimension source data. Unlike Button — which has a Figma-confirmed
 * `md` row (`HA_BUTTON_FIGMA_DIMENSIONS`) and placeholder `sm`/`lg` — NO
 * Figma source exists for Input anywhere in
 * `halo-ui-default-theme-design-values`, so ALL sizes are placeholders.
 * Consumed by `component-default-values.tokens.ts` to build the
 * `--ha-input-*` (and, for the trigger, `--ha-select-*`) defaults the
 * runtime Theme Engine writes.
 *
 * `minHeight` is intentionally realized downstream as `min-height` (D6): a
 * fixed `height` would clip wrapped/long content. This file stores the raw
 * "height" concept; the CSS property choice is made by the consumer.
 *
 * `paddingX` reuses `HA_PADDING_X_SCALE` (`foundation.tokens.ts`) — Button
 * landed on the exact same sm/md/lg values independently.
 */

/**
 * @deprecated-style banner (mirror of D5 point 2, adapted for Input):
 * `minHeight`/`paddingX` values below are ASSISTANT-AUTHORED PLACEHOLDERS,
 * explicitly requested by the user pending designer validation. They are NOT
 * Figma-confirmed; NO Figma source exists for Input. `sm.minHeight` (33px)
 * is an explicit user-provided value, not an 8px-step derivation like the
 * rest of the scale. `radius` reuses `HA_RADIUS_SCALE` (`foundation.tokens.ts`)
 * — unified with Button's radius, not an Input-specific value.
 *
 * Every dimension sourced from this object is provisional — including `md`,
 * because unlike Button, no size is confirmed for Input.
 */
export const HA_INPUT_PROVISIONAL_DIMENSIONS = {
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
