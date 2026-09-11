import type { OverlayRef } from '@angular/cdk/overlay';
import { createHaSelectScrollStrategy } from './select.scroll-strategy';

/** Dispatches a native, non-bubbling `scroll` event on `target` — exactly how the DOM fires it on a real scrollable element. */
function dispatchScroll(target: EventTarget): void {
  target.dispatchEvent(new Event('scroll', { bubbles: false }));
}

describe('createHaSelectScrollStrategy', () => {
  let nestedScrollable: HTMLDivElement;
  let overlayRef: Pick<OverlayRef, 'updatePosition'>;

  beforeEach(() => {
    nestedScrollable = document.createElement('div');
    document.body.appendChild(nestedScrollable);
    overlayRef = { updatePosition: jest.fn() };
  });

  afterEach(() => {
    nestedScrollable.remove();
  });

  it('repositions the overlay on scroll from a nested container with no cdkScrollable registration', () => {
    const strategy = createHaSelectScrollStrategy();
    strategy.attach(overlayRef as OverlayRef);
    strategy.enable();

    dispatchScroll(nestedScrollable);

    expect(overlayRef.updatePosition).toHaveBeenCalledTimes(1);
  });

  it('stops repositioning once disabled', () => {
    const strategy = createHaSelectScrollStrategy();
    strategy.attach(overlayRef as OverlayRef);
    strategy.enable();
    strategy.disable();

    dispatchScroll(nestedScrollable);

    expect(overlayRef.updatePosition).not.toHaveBeenCalled();
  });

  it('does not attach a second listener when enabled twice', () => {
    const strategy = createHaSelectScrollStrategy();
    strategy.attach(overlayRef as OverlayRef);
    strategy.enable();
    strategy.enable();

    dispatchScroll(nestedScrollable);

    expect(overlayRef.updatePosition).toHaveBeenCalledTimes(1);
  });

  it('tolerates disable() without a prior enable()', () => {
    const strategy = createHaSelectScrollStrategy();
    strategy.attach(overlayRef as OverlayRef);

    expect(() => strategy.disable()).not.toThrow();
  });

  it('ignores scroll events before attach() has run', () => {
    const strategy = createHaSelectScrollStrategy();
    strategy.enable();

    expect(() => dispatchScroll(nestedScrollable)).not.toThrow();
  });
});
