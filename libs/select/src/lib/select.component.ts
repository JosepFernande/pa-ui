import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  Injector,
  OnInit,
  Output,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { CdkConnectedOverlay, Overlay } from '@angular/cdk/overlay';
import type { PaSelectOption, PaSelectSize } from './select.types';
import { PA_SELECT_POSITIONS, PA_SELECT_VIEWPORT_MARGIN } from './select.constants';
import { resolveSelectKeyIntent } from './select.keyboard';
import { findOptionIndexByValue } from './select.utils';

/**
 * Accessible, token-driven single-select combobox (custom element
 * `pa-select`, NOT an attribute selector — unlike `button[pa-button]`/
 * `input[pa-input]`, the trigger is a `<button role="combobox">` rendered
 * inside the component's own template).
 *
 * The panel is a `CdkConnectedOverlay` (`disableClose=true` — Escape is
 * handled by the trigger itself, see `onTriggerKeydown`) that opens on
 * trigger click/Enter/Space/ArrowDown and closes on outside click, Escape,
 * or trigger blur, without changing the bound value. `aria-expanded`
 * mirrors the real `panelOpen()` state. Commit-on-select and
 * `ActiveDescendantKeyManager` wiring (arrow/Home/End/typeahead navigation,
 * `aria-activedescendant`) land in Phase 5 — until then, `Enter`/`Space`
 * while the panel is already open, and arrow/typeahead navigation, are
 * no-ops (`resolveSelectKeyIntent` resolves them to `'commit'`/`'delegate'`,
 * which `onTriggerKeydown` does not yet act on).
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
  imports: [CdkConnectedOverlay],
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
  /** Selectable options rendered inside the panel. */
  readonly options = input<PaSelectOption[]>([]);

  /** Size preset: sm, md, or lg. */
  readonly size = input<PaSelectSize>('md');

  /** Whether the trigger is disabled. Overridden by the form control when disabled. */
  readonly disabled = input(false);

  /** Whether the trigger is read-only: focusable, but the panel never opens. */
  readonly readonly = input(false);

  /** Placeholder text shown while no option is selected. */
  readonly placeholder = input('');

  /** Accessible label (`aria-label`) for the trigger. */
  readonly ariaLabel = input('');

  /** Comma-separated ids referenced by `aria-describedby` (e.g. hint text). */
  readonly ariaDescribedBy = input('');

  /** Emits the committed value whenever the selection changes (commit path wired in Phase 5). */
  @Output() readonly valueChange = new EventEmitter<unknown>();

  /** Emits exactly once per open transition (click, opening key, or programmatic `open()`). */
  @Output() readonly opened = new EventEmitter<void>();

  /** Emits exactly once per close transition (outside click, Escape, blur, or programmatic `close()`). */
  @Output() readonly closed = new EventEmitter<void>();

  /** Disabled state coming from the form control via `setDisabledState`. */
  protected readonly formDisabled = signal(false);

  /** Raw model value, exactly as written by `writeValue` — never normalized. */
  protected readonly valueState = signal<unknown>(null);

  /**
   * Whether the caller last requested the panel to open (via click or an
   * opening key). Not the source of truth for rendering — see `panelOpen`
   * (D3): readonly/disabled must structurally prevent the panel from
   * actually opening even if this stays `true`.
   */
  private readonly openRequested = signal(false);

  /** Reference to the trigger button — the overlay's connection origin. */
  protected readonly triggerRef = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');

  /**
   * Width (px) applied to the overlay panel, measured from the trigger at
   * open time. `0` before the first open is harmless: the overlay is only
   * ever attached while `panelOpen()` is `true`.
   */
  protected readonly triggerWidth = signal<number>(0);

  /** Connected-overlay fallback positions (D7). */
  protected readonly positions = PA_SELECT_POSITIONS;

  /** Minimum gap (px) kept between the panel and the viewport edge (D7). */
  protected readonly viewportMargin = PA_SELECT_VIEWPORT_MARGIN;

  private readonly overlay = inject(Overlay);

  /** Scroll strategy (D7): reposition the panel on scroll rather than closing or blocking it. */
  protected readonly scrollStrategy = this.overlay.scrollStrategies.reposition();

  /** Tracks the last emitted open state so the transition effect below emits exactly once per transition. */
  private lastEmittedOpen = false;

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
   * Computed: the actual open/rendered state (D3). Structurally impossible
   * to be `true` while `readonly`/`disabled` — reopening never has to be
   * special-cased when either toggles on while the panel is already open.
   */
  protected readonly panelOpen = computed(
    () => this.openRequested() && !this.effectiveDisabled() && !this.readonly(),
  );

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

  /** Template helper: whether `option` is the currently selected option (`aria-selected`, `.pa-select__option--selected`). */
  protected isSelected(option: PaSelectOption): boolean {
    return Object.is(option.value, this.valueState());
  }

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

  constructor(private readonly cdr: ChangeDetectorRef) {
    // One effect emitting `opened`/`closed` on every `panelOpen()` transition
    // (D3) — guarantees output/DOM parity instead of duplicating the
    // open/close decision at every call site that can change it (click,
    // keydown, outside click, blur, or disabling/making readonly while open).
    effect(() => {
      const isOpen = this.panelOpen();
      if (isOpen === this.lastEmittedOpen) {
        return;
      }
      this.lastEmittedOpen = isOpen;
      if (isOpen) {
        this.triggerWidth.set(this.triggerRef().nativeElement.offsetWidth);
        this.opened.emit();
      } else {
        this.closed.emit();
      }
    });
  }

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

  /** Host handler: notifies the form control that the trigger was touched, and closes the panel if open. */
  protected onTriggerBlur(): void {
    this.onTouched();
    if (this.panelOpen()) {
      this.close();
    }
  }

  /** Host handler: opens the panel on trigger click (no-op if already open, disabled, or readonly). */
  protected onTriggerClick(): void {
    this.open();
  }

  /**
   * Host handler: resolves the keyboard intent (open/cancel here; commit/
   * delegate are wired in Phase 5 once the key manager exists) and acts on
   * it. `preventDefault` is honored exactly as the pure resolver decided
   * (D6 — e.g. `Tab` never calls `preventDefault`).
   */
  protected onTriggerKeydown(event: KeyboardEvent): void {
    const intent = resolveSelectKeyIntent(event, {
      open: this.panelOpen(),
      disabled: this.effectiveDisabled(),
      readonly: this.readonly(),
    });
    if (intent.preventDefault) {
      event.preventDefault();
    }
    if (intent.kind === 'open') {
      this.open();
    } else if (intent.kind === 'cancel') {
      this.close();
    }
  }

  /** Requests the panel to open. No-op when disabled or readonly (D3). */
  protected open(): void {
    if (this.effectiveDisabled() || this.readonly()) {
      return;
    }
    this.openRequested.set(true);
  }

  /** Requests the panel to close. Idempotent when already closed. */
  protected close(): void {
    this.openRequested.set(false);
  }
}
