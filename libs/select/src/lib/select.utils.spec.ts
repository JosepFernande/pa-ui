import { findOptionIndexByValue, firstEnabledIndex, nextSelectId, optionId } from './select.utils';
import type { PaSelectOption } from './select.types';

describe('select utils', () => {
  describe('findOptionIndexByValue', () => {
    const options: PaSelectOption<string>[] = [
      { label: 'Apple', value: 'apple' },
      { label: 'Banana', value: 'banana' },
      { label: 'Cherry', value: 'cherry', disabled: true },
    ];

    it('returns the index of the option whose value matches', () => {
      expect(findOptionIndexByValue(options, 'banana')).toBe(1);
    });

    it('returns -1 when no option matches the value', () => {
      expect(findOptionIndexByValue(options, 'missing')).toBe(-1);
    });

    it('returns -1 for an empty options array', () => {
      expect(findOptionIndexByValue([], 'apple')).toBe(-1);
    });
  });

  describe('firstEnabledIndex', () => {
    it('returns the index of the first non-disabled option', () => {
      const options: PaSelectOption<string>[] = [
        { label: 'Apple', value: 'apple', disabled: true },
        { label: 'Banana', value: 'banana' },
      ];
      expect(firstEnabledIndex(options)).toBe(1);
    });

    it('returns 0 when the first option is already enabled', () => {
      const options: PaSelectOption<string>[] = [
        { label: 'Apple', value: 'apple' },
        { label: 'Banana', value: 'banana', disabled: true },
      ];
      expect(firstEnabledIndex(options)).toBe(0);
    });

    it('returns -1 when every option is disabled', () => {
      const options: PaSelectOption<string>[] = [
        { label: 'Apple', value: 'apple', disabled: true },
        { label: 'Banana', value: 'banana', disabled: true },
      ];
      expect(firstEnabledIndex(options)).toBe(-1);
    });

    it('returns -1 for an empty options array', () => {
      expect(firstEnabledIndex([])).toBe(-1);
    });
  });

  describe('optionId', () => {
    it('builds a deterministic id from the select id and index', () => {
      expect(optionId('pa-select-1', 0)).toBe('pa-select-1-option-0');
      expect(optionId('pa-select-1', 3)).toBe('pa-select-1-option-3');
    });
  });

  describe('nextSelectId', () => {
    it('returns a unique, incrementing id on every call', () => {
      const first = nextSelectId();
      const second = nextSelectId();
      expect(first).not.toBe(second);
      expect(first).toMatch(/^pa-select-\d+$/);
      expect(second).toMatch(/^pa-select-\d+$/);
    });
  });
});
