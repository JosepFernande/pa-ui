import { HaSelectKeyIntent, HaSelectOption, HaSelectSize } from './select.types';

describe('select types', () => {
  it('should define HaSelectSize as a sm|md|lg union', () => {
    const size: HaSelectSize = 'lg';
    expect(size).toBe('lg');
  });

  it('should shape HaSelectOption with label, value, and optional disabled', () => {
    const option: HaSelectOption<string> = { label: 'Apple', value: 'apple' };
    expect(option.label).toBe('Apple');
    expect(option.value).toBe('apple');
    expect(option.disabled).toBeUndefined();

    const disabledOption: HaSelectOption<string> = {
      label: 'Banana',
      value: 'banana',
      disabled: true,
    };
    expect(disabledOption.disabled).toBe(true);
  });

  it('should shape HaSelectKeyIntent with a kind and a preventDefault flag', () => {
    const intent: HaSelectKeyIntent = { kind: 'open', preventDefault: true };
    expect(intent.kind).toBe('open');
    expect(intent.preventDefault).toBe(true);
  });

  it('should allow every HaSelectKeyIntent kind variant', () => {
    const kinds: Array<HaSelectKeyIntent['kind']> = [
      'open',
      'commit',
      'cancel',
      'delegate',
      'noop',
    ];
    for (const kind of kinds) {
      const intent: HaSelectKeyIntent = { kind, preventDefault: false };
      expect(intent.kind).toBe(kind);
    }
  });
});
