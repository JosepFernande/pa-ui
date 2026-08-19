import { signal } from '@angular/core';
import type { Highlightable } from '@angular/cdk/a11y';
import type { PaSelectOption } from './select.types';

/**
 * Wraps a `PaSelectOption` to satisfy CDK's `Highlightable` contract for
 * `ActiveDescendantKeyManager` (D4). Internal implementation detail of
 * `PaSelect` — deliberately NOT exported from `public-api.ts`.
 */
export class PaSelectOptionItem<T = unknown> implements Highlightable {
  /** Whether the key manager currently considers this item active. */
  readonly active = signal(false);

  constructor(
    readonly option: PaSelectOption<T>,
    readonly id: string,
  ) {}

  /** `Highlightable`/`ListKeyManagerOption`: skipped by keyboard navigation when `true`. */
  get disabled(): boolean {
    return this.option.disabled ?? false;
  }

  /** `ListKeyManagerOption`: label matched by `withTypeAhead`. */
  getLabel(): string {
    return this.option.label;
  }

  /** `Highlightable`: called by the key manager when this item becomes active. */
  setActiveStyles(): void {
    this.active.set(true);
  }

  /** `Highlightable`: called by the key manager when this item stops being active. */
  setInactiveStyles(): void {
    this.active.set(false);
  }
}
