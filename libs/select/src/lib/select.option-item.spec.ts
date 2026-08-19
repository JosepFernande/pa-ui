import { PaSelectOptionItem } from './select.option-item';
import type { PaSelectOption } from './select.types';

describe('PaSelectOptionItem', () => {
  it('starts inactive and returns the wrapped option label', () => {
    const option: PaSelectOption<string> = { label: 'Apple', value: 'apple' };
    const item = new PaSelectOptionItem(option, 'pa-select-1-option-0');

    expect(item.active()).toBe(false);
    expect(item.getLabel()).toBe('Apple');
    expect(item.id).toBe('pa-select-1-option-0');
  });

  it('toggles the active signal via setActiveStyles/setInactiveStyles', () => {
    const option: PaSelectOption<string> = { label: 'Banana', value: 'banana' };
    const item = new PaSelectOptionItem(option, 'pa-select-1-option-1');

    item.setActiveStyles();
    expect(item.active()).toBe(true);

    item.setInactiveStyles();
    expect(item.active()).toBe(false);
  });

  it('reflects option.disabled through the disabled getter, defaulting to false', () => {
    const enabledItem = new PaSelectOptionItem<string>({ label: 'Apple', value: 'apple' }, 'id-0');
    const disabledItem = new PaSelectOptionItem<string>(
      { label: 'Cherry', value: 'cherry', disabled: true },
      'id-1',
    );

    expect(enabledItem.disabled).toBe(false);
    expect(disabledItem.disabled).toBe(true);
  });
});
