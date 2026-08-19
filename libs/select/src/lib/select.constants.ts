import type { ConnectedPosition } from '@angular/cdk/overlay';

/** Debounce window (ms) for first-character typeahead, per `withTypeAhead`. */
export const PA_SELECT_TYPEAHEAD_DEBOUNCE = 200;

/** Minimum gap (px) kept between the overlay panel and the viewport edge. */
export const PA_SELECT_VIEWPORT_MARGIN = 8;

/**
 * Connected-overlay fallback positions (D7): below-start first, above-start
 * as the fallback when there isn't enough room below the trigger. Deliberately
 * NOT `STANDARD_DROPDOWN_BELOW_POSITIONS` — its `end`-aligned fallbacks would
 * make the panel jump horizontally.
 */
export const PA_SELECT_POSITIONS: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
];
