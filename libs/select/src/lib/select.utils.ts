import type { PaSelectOption } from './select.types';

/**
 * Finds the index of the option whose value is `Object.is`-equal to `value`,
 * or `-1` when no option matches (including when `options` is empty).
 */
export function findOptionIndexByValue<T>(options: readonly PaSelectOption<T>[], value: T): number {
  return options.findIndex((option) => Object.is(option.value, value));
}

/**
 * Finds the index of the first non-disabled option, or `-1` when every
 * option is disabled (or `options` is empty).
 */
export function firstEnabledIndex<T>(options: readonly PaSelectOption<T>[]): number {
  return options.findIndex((option) => !option.disabled);
}

/** Builds the DOM id for the option at `index` within a select instance `selectId`. */
export function optionId(selectId: string, index: number): string {
  return `${selectId}-option-${index}`;
}

let selectIdCounter = 0;

/**
 * Deterministic, testable id generator (D10) — NOT CDK's private,
 * underscore-prefixed `_IdGenerator` (no stability guarantee).
 */
export function nextSelectId(): string {
  selectIdCounter += 1;
  return `pa-select-${selectIdCounter}`;
}
