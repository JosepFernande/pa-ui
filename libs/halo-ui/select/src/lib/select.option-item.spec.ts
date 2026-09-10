import { HaSelectOptionItem } from './select.option-item';
import type { HaSelectOption } from './select.types';

describe('HaSelectOptionItem', () => {
  it('starts inactive and returns the wrapped option label', () => {
    const option: HaSelectOption<string> = { label: 'Apple', value: 'apple' };
    const item = new HaSelectOptionItem(option, 'ha-select-1-option-0');

    expect(item.active()).toBe(false);
    expect(item.getLabel()).toBe('Apple');
    expect(item.id).toBe('ha-select-1-option-0');
  });

  it('toggles the active signal via setActiveStyles/setInactiveStyles', () => {
    const option: HaSelectOption<string> = { label: 'Banana', value: 'banana' };
    const item = new HaSelectOptionItem(option, 'ha-select-1-option-1');

    item.setActiveStyles();
    expect(item.active()).toBe(true);

    item.setInactiveStyles();
    expect(item.active()).toBe(false);
  });

  it('reflects option.disabled through the disabled getter, defaulting to false', () => {
    const enabledItem = new HaSelectOptionItem<string>({ label: 'Apple', value: 'apple' }, 'id-0');
    const disabledItem = new HaSelectOptionItem<string>(
      { label: 'Cherry', value: 'cherry', disabled: true },
      'id-1',
    );

    expect(enabledItem.disabled).toBe(false);
    expect(disabledItem.disabled).toBe(true);
  });
});
