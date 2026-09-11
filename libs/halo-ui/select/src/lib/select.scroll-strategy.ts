import type { OverlayRef, ScrollStrategy } from '@angular/cdk/overlay';

/**
 * Reposition scroll strategy that never requires `cdkScrollable` from
 * consumers. `Overlay.scrollStrategies.reposition()` only reacts to scroll on
 * containers registered with CDK's `ScrollDispatcher` (via the
 * `cdkScrollable` directive) — an ancestor scroll container without it is
 * invisible to that dispatcher, so the panel drifts away from the trigger
 * while the page still looks "in sync". Native `scroll` events don't bubble,
 * but the DOM still dispatches them through the capturing phase, so one
 * capture-phase listener on `window` observes every scroll in the document —
 * nested container or not — with zero markup required from consumers.
 */
// gga-ignore: custom ScrollStrategy implementation, not Overlay.scrollStrategies.reposition() —
// justified above (reposition() misses scroll on containers without cdkScrollable).
export function createHaSelectScrollStrategy(): ScrollStrategy {
  let overlayRef: OverlayRef | undefined;
  let listening = false;

  const reposition = (): void => {
    overlayRef?.updatePosition();
  };

  return {
    attach(ref: OverlayRef): void {
      overlayRef = ref;
    },
    enable(): void {
      if (listening) {
        return;
      }
      window.addEventListener('scroll', reposition, true);
      listening = true;
    },
    disable(): void {
      if (!listening) {
        return;
      }
      window.removeEventListener('scroll', reposition, true);
      listening = false;
    },
  };
}
