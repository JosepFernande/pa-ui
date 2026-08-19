import { DOWN_ARROW, END, ENTER, ESCAPE, HOME, SPACE, TAB, UP_ARROW } from '@angular/cdk/keycodes';
import { resolveSelectKeyIntent } from './select.keyboard';
import type { PaSelectKeyState } from './select.keyboard';

function key(keyCode: number, altKey = false): { keyCode: number; altKey: boolean } {
  return { keyCode, altKey };
}

const OPEN: PaSelectKeyState = { open: true, disabled: false, readonly: false };
const CLOSED: PaSelectKeyState = { open: false, disabled: false, readonly: false };

describe('resolveSelectKeyIntent', () => {
  it('opens the panel when ArrowDown is pressed while closed', () => {
    expect(resolveSelectKeyIntent(key(DOWN_ARROW), CLOSED)).toEqual({
      kind: 'open',
      preventDefault: true,
    });
  });

  it('opens the panel when ArrowUp is pressed while closed', () => {
    expect(resolveSelectKeyIntent(key(UP_ARROW), CLOSED)).toEqual({
      kind: 'open',
      preventDefault: true,
    });
  });

  it('delegates ArrowDown/ArrowUp to the key manager while open (wrap handled downstream)', () => {
    expect(resolveSelectKeyIntent(key(DOWN_ARROW), OPEN)).toEqual({
      kind: 'delegate',
      preventDefault: true,
    });
    expect(resolveSelectKeyIntent(key(UP_ARROW), OPEN)).toEqual({
      kind: 'delegate',
      preventDefault: true,
    });
  });

  it('delegates Home/End to the key manager while open', () => {
    expect(resolveSelectKeyIntent(key(HOME), OPEN)).toEqual({
      kind: 'delegate',
      preventDefault: true,
    });
    expect(resolveSelectKeyIntent(key(END), OPEN)).toEqual({
      kind: 'delegate',
      preventDefault: true,
    });
  });

  it('commits (with preventDefault) on Enter/Space while open', () => {
    expect(resolveSelectKeyIntent(key(ENTER), OPEN)).toEqual({
      kind: 'commit',
      preventDefault: true,
    });
    expect(resolveSelectKeyIntent(key(SPACE), OPEN)).toEqual({
      kind: 'commit',
      preventDefault: true,
    });
  });

  it('cancels (with preventDefault) on Escape while open', () => {
    expect(resolveSelectKeyIntent(key(ESCAPE), OPEN)).toEqual({
      kind: 'cancel',
      preventDefault: true,
    });
  });

  it('commits WITHOUT preventDefault on Tab while open (focus must move, D6)', () => {
    expect(resolveSelectKeyIntent(key(TAB), OPEN)).toEqual({
      kind: 'commit',
      preventDefault: false,
    });
  });

  it('commits on Alt+ArrowUp while open', () => {
    expect(resolveSelectKeyIntent(key(UP_ARROW, true), OPEN)).toEqual({
      kind: 'commit',
      preventDefault: true,
    });
  });

  it('opens the panel on a printable character while closed (typeahead-triggers-open)', () => {
    const A_KEY_CODE = 65;
    expect(resolveSelectKeyIntent(key(A_KEY_CODE), CLOSED)).toEqual({
      kind: 'open',
      preventDefault: true,
    });
  });

  it('delegates a printable character to the key manager while open (typeahead)', () => {
    const A_KEY_CODE = 65;
    expect(resolveSelectKeyIntent(key(A_KEY_CODE), OPEN)).toEqual({
      kind: 'delegate',
      preventDefault: true,
    });
  });

  it('is a no-op for every key while disabled, regardless of open state', () => {
    const disabledOpen: PaSelectKeyState = { open: true, disabled: true, readonly: false };
    const disabledClosed: PaSelectKeyState = { open: false, disabled: true, readonly: false };
    expect(resolveSelectKeyIntent(key(ENTER), disabledOpen)).toEqual({
      kind: 'noop',
      preventDefault: false,
    });
    expect(resolveSelectKeyIntent(key(DOWN_ARROW), disabledClosed)).toEqual({
      kind: 'noop',
      preventDefault: false,
    });
  });

  it('is a no-op for every opening key while readonly', () => {
    const readonlyClosed: PaSelectKeyState = { open: false, disabled: false, readonly: true };
    expect(resolveSelectKeyIntent(key(DOWN_ARROW), readonlyClosed)).toEqual({
      kind: 'noop',
      preventDefault: false,
    });
    expect(resolveSelectKeyIntent(key(ENTER), readonlyClosed)).toEqual({
      kind: 'noop',
      preventDefault: false,
    });
  });

  it('is a no-op for irrelevant keys while closed (e.g. a modifier-only key like Escape)', () => {
    expect(resolveSelectKeyIntent(key(ESCAPE), CLOSED)).toEqual({
      kind: 'noop',
      preventDefault: false,
    });
  });
});
