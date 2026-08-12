import { DOWN_ARROW, END, ENTER, ESCAPE, HOME, SPACE, TAB, UP_ARROW } from '@angular/cdk/keycodes';
import type { PaSelectKeyIntent } from './select.types';

/** Current component state the resolver needs to decide an intent. */
export interface PaSelectKeyState {
  readonly open: boolean;
  readonly disabled: boolean;
  readonly readonly: boolean;
}

/** Duck-typed subset of `KeyboardEvent` — keeps this module DOM-independent. */
export interface PaSelectKeyboardEventLike {
  readonly keyCode: number;
  readonly altKey?: boolean;
}

const NOOP: PaSelectKeyIntent = { kind: 'noop', preventDefault: false };

/** `0-9` and `A-Z` key codes — candidates for typeahead (SPACE is handled separately). */
function isPrintableCharCode(keyCode: number): boolean {
  return keyCode >= 48 && keyCode <= 90;
}

/**
 * Pure keyboard-intent resolver (D6 — navigate-then-commit). Arrow/Home/End/
 * typeahead characters resolve to `'delegate'` while open: this module never
 * moves the active item itself — the caller forwards the raw event to
 * `ActiveDescendantKeyManager.onKeydown` (wired in Phase 5). Only the
 * high-level state transitions (open, commit, cancel) and the
 * readonly/disabled short-circuit are decided here.
 */
export function resolveSelectKeyIntent(
  event: PaSelectKeyboardEventLike,
  state: PaSelectKeyState,
): PaSelectKeyIntent {
  if (state.disabled || state.readonly) {
    return NOOP;
  }

  const { keyCode, altKey = false } = event;

  if (!state.open) {
    const opensPanel =
      keyCode === DOWN_ARROW ||
      keyCode === UP_ARROW ||
      keyCode === ENTER ||
      keyCode === SPACE ||
      isPrintableCharCode(keyCode);
    return opensPanel ? { kind: 'open', preventDefault: true } : NOOP;
  }

  if (keyCode === ESCAPE) {
    return { kind: 'cancel', preventDefault: true };
  }

  if (keyCode === TAB) {
    // D6: Tab commits WITHOUT preventDefault — focus must move to the next tabbable element.
    return { kind: 'commit', preventDefault: false };
  }

  if (keyCode === ENTER || keyCode === SPACE || (keyCode === UP_ARROW && altKey)) {
    return { kind: 'commit', preventDefault: true };
  }

  const delegatesToKeyManager =
    keyCode === DOWN_ARROW ||
    keyCode === UP_ARROW ||
    keyCode === HOME ||
    keyCode === END ||
    isPrintableCharCode(keyCode);

  return delegatesToKeyManager ? { kind: 'delegate', preventDefault: true } : NOOP;
}
