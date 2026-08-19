import { PaSelectKeyIntent, PaSelectOption, PaSelectSize } from './select.types';

describe('select types', () => {
  it('should define PaSelectSize as a sm|md|lg union', () => {
    const size: PaSelectSize = 'lg';
    expect(size).toBe('lg');
  });

  it('should shape PaSelectOption with label, value, and optional disabled', () => {
    const option: PaSelectOption<string> = { label: 'Apple', value: 'apple' };
    expect(option.label).toBe('Apple');
    expect(option.value).toBe('apple');
    expect(option.disabled).toBeUndefined();

    const disabledOption: PaSelectOption<string> = {
      label: 'Banana',
      value: 'banana',
      disabled: true,
    };
    expect(disabledOption.disabled).toBe(true);
  });

  it('should shape PaSelectKeyIntent with a kind and a preventDefault flag', () => {
    const intent: PaSelectKeyIntent = { kind: 'open', preventDefault: true };
    expect(intent.kind).toBe('open');
    expect(intent.preventDefault).toBe(true);
  });

  it('should allow every PaSelectKeyIntent kind variant', () => {
    const kinds: Array<PaSelectKeyIntent['kind']> = [
      'open',
      'commit',
      'cancel',
      'delegate',
      'noop',
    ];
    for (const kind of kinds) {
      const intent: PaSelectKeyIntent = { kind, preventDefault: false };
      expect(intent.kind).toBe(kind);
    }
  });
});
