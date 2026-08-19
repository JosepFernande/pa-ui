/** Size preset: sm, md, or lg. */
export type PaSelectSize = 'sm' | 'md' | 'lg';

/** A single selectable option rendered inside the panel. */
export interface PaSelectOption<T = unknown> {
  /** Text rendered for the option and matched by typeahead. */
  readonly label: string;
  /** Value committed to the bound form control / `valueChange` output. */
  readonly value: T;
  /** Whether the option is skipped by keyboard navigation and unselectable. */
  readonly disabled?: boolean;
}

/** Discriminant for the outcome of `resolveSelectKeyIntent`. */
export type PaSelectKeyIntentKind = 'open' | 'commit' | 'cancel' | 'delegate' | 'noop';

/**
 * Pure result of resolving a keyboard event against the component's current
 * state (open/closed, readonly, disabled). `preventDefault` is `false` for
 * `Tab` (D6 — focus must be allowed to move to the next tabbable element).
 */
export interface PaSelectKeyIntent {
  readonly kind: PaSelectKeyIntentKind;
  readonly preventDefault: boolean;
}
