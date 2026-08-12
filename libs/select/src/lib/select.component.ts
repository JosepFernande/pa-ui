import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  Injector,
  OnInit,
  Output,
  computed,
  forwardRef,
  inject,
  input,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import type { PaSelectOption, PaSelectSize } from './select.types';
import { findOptionIndexByValue } from './select.utils';

/**
 * Accessible, token-driven single-select combobox (custom element
 * `pa-select`, NOT an attribute selector — unlike `button[pa-button]`/
 * `input[pa-input]`, the trigger is a `<button role="combobox">` rendered
 * inside the component's own template).
 *
 * This phase (Work Unit 1) renders the closed trigger only: no
 * `CdkConnectedOverlay` panel, no keyboard wiring yet (Phases 4-5).
 * `aria-expanded` is always `"false"` and no `[role="listbox"]` panel exists
 * until the overlay lands.
 *
 * Forms integration mirrors `PaInput`'s `NgControl` lazy-injection +
 * `validityVersion` idiom verbatim (D8,
 * `libs/input/src/lib/input.component.ts:103-175`): the bound form
 * directive on this same host also injects `NG_VALUE_ACCESSOR` (this
 * component), so resolving `NgControl` at construction time would throw
 * NG0200. Resolving lazily inside `hasError` breaks the cycle.
 */
@Component({
  selector: 'pa-select',
  standalone: true,
  imports: [],
  templateUrl: './select.component.html',
  styleUrl: './select.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PaSelect), multi: true }],
  host: {
    '[class]': 'hostClasses()',
  },
})
export class PaSelect implements ControlValueAccessor, OnInit {
  /** Selectable options rendered inside the panel (Phase 4+). */
  readonly options = input<PaSelectOption[]>([]);

  /** Size preset: sm, md, or lg. */
  readonly size = input<PaSelectSize>('md');

  /** Whether the trigger is disabled. Overridden by the form control when disabled. */
  readonly disabled = input(false);

  /** Whether the trigger is read-only: focusable, but the panel never opens (Phase 4+). */
  readonly readonly = input(false);

  /** Placeholder text shown while no option is selected. */
  readonly placeholder = input('');

  /** Accessible label (`aria-label`) for the trigger. */
  readonly ariaLabel = input('');

  /** Comma-separated ids referenced by `aria-describedby` (e.g. hint text). */
  readonly ariaDescribedBy = input('');

  /** Emits the committed value whenever the selection changes (Phase 4+ wires the commit path). */
  @Output() readonly valueChange = new EventEmitter<unknown>();

  /** Emits when the panel opens (Phase 4+). */
  @Output() readonly opened = new EventEmitter<void>();

  /** Emits when the panel closes (Phase 4+). */
  @Output() readonly closed = new EventEmitter<void>();

  /** Disabled state coming from the form control via `setDisabledState`. */
  protected readonly formDisabled = signal(false);

  /** Raw model value, exactly as written by `writeValue` — never normalized. */
  protected readonly valueState = signal<unknown>(null);

  /**
   * Re-computation trigger for `hasError`: `control.invalid`/`control.touched`
   * are not signals, so every relevant form event (touched, status, value)
   * bumps this version to mark the computed dirty.
   */
  private readonly validityVersion = signal(0);

  /**
   * Element injector used to resolve `NgControl` lazily (see class TSDoc —
   * mirrors `PaInput`'s NG0200 workaround).
   */
  private readonly injector = inject(Injector);

  /** The form control bound to this select, if any (forms integration). */
  private get ngControl(): NgControl | null {
    return this.injector.get(NgControl, null, { self: true, optional: true });
  }

  private readonly destroyRef = inject(DestroyRef);

  /** Computed: disabled from the input OR from the bound form control. */
  protected readonly effectiveDisabled = computed(() => this.disabled() || this.formDisabled());

  /**
   * Computed: `true` when the bound control is invalid AND touched — drives
   * `.pa-select--error` and `aria-invalid`. Reactive via `validityVersion`.
   */
  protected readonly hasError = computed(() => {
    this.validityVersion();
    const control = this.ngControl?.control;
    return control != null && control.invalid && control.touched;
  });

  /**
   * Computed: the option whose value matches `valueState` via `Object.is`,
   * or `null` when unmatched (or no value is set). Never mutates
   * `valueState`/the bound control — a later `options()` change re-resolves
   * the same raw value for free.
   */
  protected readonly selectedOption = computed<PaSelectOption | null>(() => {
    const index = findOptionIndexByValue(this.options(), this.valueState());
    return index === -1 ? null : this.options()[index];
  });

  /** Computed: the trigger's visible text — the selected option's label, or the placeholder. */
  protected readonly triggerLabel = computed(
    () => this.selectedOption()?.label ?? this.placeholder(),
  );

  /** Computed: BEM class string for the host `pa-select` element. */
  protected readonly hostClasses = computed(() =>
    [
      'pa-select',
      `pa-select--${this.size()}`,
      this.effectiveDisabled() ? 'pa-select--disabled' : '',
      this.readonly() ? 'pa-select--readonly' : '',
      this.hasError() ? 'pa-select--error' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  /** Change callback registered by the form directive. */
  private onChange: (value: unknown) => void = () => {};

  /** Touch callback registered by the form directive. */
  private onTouched: () => void = () => {};

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // See `PaInput.ngOnInit` for why a subscription (not a computed()) is
    // required to react to control.invalid/control.touched changes.
    const control = this.ngControl?.control;
    control?.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.validityVersion.update((version) => version + 1);
      this.cdr.markForCheck();
    });
  }

  /** ControlValueAccessor: stores the raw model value; never mutates the control. */
  writeValue(value: unknown): void {
    this.valueState.set(value ?? null);
  }

  /** ControlValueAccessor: stores the change callback the form directive provides. */
  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  /** ControlValueAccessor: stores the touch callback the form directive provides. */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /** ControlValueAccessor: mirrors the control's disabled state into the trigger. */
  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  /** Host handler: notifies the form control that the trigger was touched. */
  protected onTriggerBlur(): void {
    this.onTouched();
  }
}
