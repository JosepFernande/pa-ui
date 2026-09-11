import { HA_ICON_SIZE_SCALE } from '../../foundation/foundation.tokens';

/**
 * Numeric pixel sizes per icon size step, derived from `HA_ICON_SIZE_SCALE`
 * (the Foundation icon-size scale). Component-layer boundary: `HaIcon`
 * consumes this instead of importing Foundation directly, the same rule
 * `HA_BUTTON_DIMENSIONS`/`HA_INPUT_DIMENSIONS_SCALE` follow for their own
 * components.
 */
export const HA_ICON_SIZE_PX: Record<'sm' | 'md' | 'lg', number> = {
  sm: parseInt(HA_ICON_SIZE_SCALE.sm, 10),
  md: parseInt(HA_ICON_SIZE_SCALE.md, 10),
  lg: parseInt(HA_ICON_SIZE_SCALE.lg, 10),
};
