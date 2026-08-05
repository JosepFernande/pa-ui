import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  OnInit,
  OnDestroy,
  computed,
  forwardRef,
  inject,
  input,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import type { PaInputSize, PaInputType } from './input.types';

/**
 * Accessible, token-driven native text input (selector `input[pa-input]`).
 *
 * The host IS the native `<input>` element (mirroring `button[pa-button]`),
 * so the component renders no template content and carries no element of its
 * own — native semantics, keyboard, focus, and form behaviour are inherited
 * for free.
 *
 * Forms integration is provided through `NG_VALUE_ACCESSOR` (compatible with
 * both reactive `[formControl]`/`formControlName` and template-driven
 * `[(ngModel)]`). Angular's `selectValueAccessor` prefers this custom
 * accessor over the native `DefaultValueAccessor`, so a `[formControl]` on
 * the same element wires to `PaInput`.
 *
 * Error state (`invalid && touched`) is surfaced via `.pa-input--error` and
 * `aria-invalid`. Validity/touched changes come from the form control, which
 * is NOT signal-based, so `ngOnInit` subscribes to the control's `events`
 * stream to invalidate the `hasError` computed — `computed()` cannot observe
 * `control.invalid`/`control.touched` directly.
 */
@Component({
  selector: 'input[pa-input]',
  standalone: true,
  imports: [],
  template: '',
  styleUrl: './input.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PaInput), multi: true }],
  host: {
    '[class]': 'hostClasses()',
    '[disabled]': 'effectiveDisabled()',
    // `[attr.readonly]` — NOT `[readonly]` property binding: the DOM
    // property is `readOnly`, and `[readonly]` is a jsdom/TS gotcha.
    '[attr.readonly]': 'readonly() ? "readonly" : null',
    '[attr.aria-disabled]': 'effectiveDisabled()',
    '[attr.aria-invalid]': 'hasError() ? "true" : null',
    '[attr.aria-label]': 'ariaLabel() || null',
    '[attr.aria-describedby]': 'ariaDescribedBy() || null',
    '[attr.placeholder]': 'placeholder() || null',
    '[attr.type]': 'type()',
    '(input)': 'onInput($event)',
    '(blur)': 'onBlur()',
  },
})
export class PaInput implements ControlValueAccessor, OnInit, OnDestroy {
  /** Size preset: sm, md, or lg. */
  readonly size = input<PaInputSize>('md');

  /** Native input type: text, password, email, or number. */
  readonly type = input<PaInputType>('text');

  /** Whether the input is disabled. Overridden by the form control when disabled. */
  readonly disabled = input(false);

  /** Whether the input is read-only. */
  readonly readonly = input(false);

  /** Placeholder text shown while the input is empty. */
  readonly placeholder = input('');

  /** Accessible label (`aria-label`) for the input. */
  readonly ariaLabel = input('');

  /** Comma-separated ids referenced by `aria-describedby` (e.g. hint text). */
  readonly ariaDescribedBy = input('');

  /** Disabled state coming from the form control via `setDisabledState`. */
  protected readonly formDisabled = signal(false);

  /** CDK focus origin (keyboard, mouse, touch, program, or null). */
  protected readonly focusOrigin = signal<FocusOrigin>(null);

  /**
   * Re-computation trigger for `hasError`: `control.invalid`/`control.touched`
   * are not signals, so every relevant form event (touched, status, value)
   * bumps this version to mark the computed dirty.
   */
  private readonly validityVersion = signal(0);

  /**
   * Element injector used to resolve `NgControl` lazily. A construction-time
   * `inject(NgControl, { self: true })` would throw NG0200 (circular DI
   * dependency) here: the bound form directive (`[formControl]`) lives on
   * this same native input and itself injects `NG_VALUE_ACCESSOR` — which is
   * this component. Resolving on first read (inside the `hasError` computed,
   * after every directive on the element is constructed) breaks the cycle.
   */
  private readonly injector = inject(Injector);

  /** The form control bound to this input, if any (forms integration). */
  private get ngControl(): NgControl | null {
    return this.injector.get(NgControl, null, { self: true, optional: true });
  }

  private readonly destroyRef = inject(DestroyRef);

  /** Computed: disabled from the input OR from the bound form control. */
  protected readonly effectiveDisabled = computed(() => this.disabled() || this.formDisabled());

  /**
   * Computed: `true` when the bound control is invalid AND touched — drives
   * `.pa-input--error` and `aria-invalid`. Reactive via `validityVersion`.
   */
  protected readonly hasError = computed(() => {
    this.validityVersion();
    const control = this.ngControl?.control;
    return control != null && control.invalid && control.touched;
  });

  /** Computed: BEM class string for the host input element. */
  protected readonly hostClasses = computed(() =>
    [
      'pa-input',
      `pa-input--${this.size()}`,
      this.effectiveDisabled() ? 'pa-input--disabled' : '',
      this.readonly() ? 'pa-input--readonly' : '',
      this.hasError() ? 'pa-input--error' : '',
      this.focusOrigin() === 'keyboard' ? 'cdk-keyboard-focused' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  /** Change callback registered by the form directive. */
  private onChange: (value: string) => void = () => {};

  /** Touch callback registered by the form directive. */
  private onTouched: () => void = () => {};

  constructor(
    private readonly focusMonitor: FocusMonitor,
    private readonly elementRef: ElementRef<HTMLInputElement>,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.focusMonitor.monitor(this.elementRef.nativeElement, true).subscribe((origin) => {
      this.focusOrigin.set(origin);
    });

    // `control.invalid`/`control.touched` are not signals, so a `computed()`
    // reading them would be cached forever (verified against Angular 19: a
    // computed with no signal deps is evaluated once). Subscribing to the
    // control's `events` stream (covers touched, status, AND value changes —
    // `statusChanges` alone misses the blur/touch transition) invalidates
    // `hasError` whenever the form state that drives it changes.
    const control = this.ngControl?.control;
    control?.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.validityVersion.update((version) => version + 1);
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.focusMonitor.stopMonitoring(this.elementRef.nativeElement);
  }

  /** ControlValueAccessor: writes a model value into the native input. */
  writeValue(value: string | null): void {
    this.elementRef.nativeElement.value = value ?? '';
  }

  /** ControlValueAccessor: stores the change callback the form directive provides. */
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  /** ControlValueAccessor: stores the touch callback the form directive provides. */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /** ControlValueAccessor: mirrors the control's disabled state into the input. */
  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  /** Host handler: propagates the current native value to the form control. */
  onInput(event: Event): void {
    this.onChange((event.target as HTMLInputElement).value);
  }

  /** Host handler: notifies the form control that the input was touched. */
  onBlur(): void {
    this.onTouched();
  }
}
