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
import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import type { PaSelectOption, PaSelectSize } from './select.types';
import {
  PA_SELECT_POSITIONS,
  PA_SELECT_TYPEAHEAD_DEBOUNCE,
  PA_SELECT_VIEWPORT_MARGIN,
} from './select.constants';
import { resolveSelectKeyIntent } from './select.keyboard';
import { PaSelectOptionItem } from './select.option-item';
import { findOptionIndexByValue, firstEnabledIndex, nextSelectId, optionId } from './select.utils';

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
 * mirrors the real `panelOpen()` state.
 *
 * Keyboard navigation and commit (D4, D6) are driven by an
 * `ActiveDescendantKeyManager<PaSelectOptionItem>` built over a *signal*
 * item source (`optionItems`) — no RxJS subscription needed. Arrow/Home/End/
 * typeahead move `aria-activedescendant` only (navigate); Enter, Space, Tab,
 * and Alt+ArrowUp commit the active option, write it through the CVA
 * `onChange`, and close the panel. Escape cancels without committing.
 * `withWrap(true)` is enabled so Arrow navigation wraps past disabled
 * options at either end — this is a deliberate deviation from design
 * decision D5 ("clamp, not wrap"): the spec's Keyboard navigation matrix
 * requirement and its explicit "Arrow Down wraps past the last option"
 * scenario mandate wrap-around, which D5 did not account for.
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

  /** Emits the committed value whenever Enter/Space/Tab/Alt+ArrowUp commits the active option. */
  @Output() readonly valueChange = new EventEmitter<unknown>();

  /** Emits exactly once per open transition (click, opening key, or programmatic `open()`). */
  @Output() readonly opened = new EventEmitter<void>();

  /** Emits exactly once per close transition (outside click, Escape, blur, or programmatic `close()`). */
  @Output() readonly closed = new EventEmitter<void>();

  /** Disabled state coming from the form control via `setDisabledState`. */
  protected readonly formDisabled = signal(false);

  /** Raw model value, exactly as written by `writeValue` — never normalized. */
  protected readonly valueState = signal<unknown>(null);

  /** Last open request (click/opening key). Not the render source of truth — see `panelOpen` (D3). */
  private readonly openRequested = signal(false);

  /** Reference to the trigger button — the overlay's connection origin. */
  protected readonly triggerRef = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');

  /** Width (px) of the overlay panel, measured from the trigger at open time. `0` before the first open is harmless. */
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

  /** Deterministic instance id (D10) — prefixes every option DOM id and the panel id. */
  private readonly selectId = nextSelectId();

  /** DOM id of the listbox panel, referenced by the trigger's `aria-controls`. */
  protected readonly panelId = `${this.selectId}-panel`;

  /** Computed: `Highlightable` wrappers per option (D4), passed as a signal to `ActiveDescendantKeyManager`. */
  protected readonly optionItems = computed<PaSelectOptionItem[]>(() =>
    this.options().map(
      (option, index) => new PaSelectOptionItem(option, optionId(this.selectId, index)),
    ),
  );

  /** Computed: the DOM id of the option the key manager currently considers active, or `null`. */
  protected readonly activeDescendantId = computed(
    () => this.optionItems().find((item) => item.active())?.id ?? null,
  );

  /**
   * `ActiveDescendantKeyManager` over `optionItems` (D4). Built in the
   * constructor body, NOT inside the `effect()` below: CDK's signal-source
   * overload calls `effect()` internally, which throws NG0602 if nested
   * inside another running effect.
   */
  private readonly keyManager: ActiveDescendantKeyManager<PaSelectOptionItem>;

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

  /** Computed: the actual open/rendered state (D3) — structurally never `true` while `readonly`/`disabled`. */
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
    // Built here, NOT inside the effect() below — see the `keyManager` field
    // TSDoc for why (NG0602: nested effect() creation).
    this.keyManager = new ActiveDescendantKeyManager<PaSelectOptionItem>(
      this.optionItems,
      this.injector,
    )
      .withVerticalOrientation(true)
      .withWrap(true)
      .withHomeAndEnd(true)
      .withTypeAhead(PA_SELECT_TYPEAHEAD_DEBOUNCE);
    this.destroyRef.onDestroy(() => this.keyManager.destroy());

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
        this.seedActiveItem();
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
   * Host handler: resolves the keyboard intent and acts on it.
   * `preventDefault` is honored exactly as the pure resolver decided (D6 —
   * e.g. `Tab` never calls `preventDefault`, so focus can move on).
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
    switch (intent.kind) {
      case 'open':
        this.open();
        break;
      case 'cancel':
        this.close();
        break;
      case 'commit':
        this.commitActive();
        break;
      case 'delegate':
        this.keyManager.onKeydown(event);
        break;
      default:
        break;
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

  /**
   * Writes the key manager's current active option through the CVA
   * `onChange`/`valueChange` path (D6 — navigate-then-commit) and closes the
   * panel. A no-op commit (no active item, e.g. empty `options`) still
   * closes the panel without emitting `valueChange`.
   */
  private commitActive(): void {
    const activeItem = this.keyManager.activeItem;
    if (activeItem) {
      const value = activeItem.option.value;
      this.valueState.set(value);
      this.onChange(value);
      this.valueChange.emit(value);
    }
    this.close();
  }

  /**
   * Seeds the key manager's active item on open: the currently selected
   * option if one matches, otherwise the first enabled option.
   */
  private seedActiveItem(): void {
    const selectedIndex = findOptionIndexByValue(this.options(), this.valueState());
    const activeIndex = selectedIndex !== -1 ? selectedIndex : firstEnabledIndex(this.options());
    if (activeIndex !== -1) {
      this.keyManager.setActiveItem(activeIndex);
    }
  }
}
