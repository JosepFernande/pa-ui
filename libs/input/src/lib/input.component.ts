import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  forwardRef,
  inject,
  signal,
  computed,
  input,
  OnInit,
  OnDestroy,
  ElementRef,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { FocusMonitor } from '@angular/cdk/a11y';
import { PaInputSize, PaInputType } from './input.types';

let nextId = 0;

@Component({
  selector: 'pa-input',
  standalone: true,
  imports: [],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PaInputComponent),
      multi: true,
    },
  ],
  host: {
    '[class]': 'cssClasses()',
  },
})
export class PaInputComponent implements ControlValueAccessor, OnInit, OnDestroy {
  private focusMonitor = inject(FocusMonitor);
  private hostElement = inject(ElementRef<HTMLElement>);
  private id = `pa-input-${nextId++}`;

  readonly ngControl = inject(NgControl, { optional: true, self: true });

  // Signal inputs
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly errorMessage = input<string>('');
  readonly hintText = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly size = input<PaInputSize>('md');
  readonly type = input<PaInputType>('text');

  // View child for the native input
  readonly inputElement = viewChild<ElementRef<HTMLInputElement>>('nativeInput');

  // Internal state
  protected internalValue = signal<string | number>('');
  private programmaticDisabled = signal<boolean>(false);
  private onChange: (value: string | number) => void = () => {};
  private onTouched: () => void = () => {};

  // Computed signals
  readonly inputId = computed(() => this.id);
  readonly hintId = computed(() => `${this.id}-hint`);
  readonly errorId = computed(() => `${this.id}-error`);

  readonly effectiveDisabled = computed(() => this.disabled() || this.programmaticDisabled());

  readonly hasError = computed(() => {
    const explicitError = this.errorMessage() !== '';
    const formError = !!(this.ngControl?.invalid && this.ngControl?.touched);
    return explicitError || formError;
  });

  readonly ariaDescribedBy = computed(() => {
    const ids: string[] = [];
    // Only include hintId if hint is present AND there's no error (hint is hidden when error shows)
    if (this.hintText() && !this.hasError()) ids.push(this.hintId());
    if (this.hasError()) ids.push(this.errorId());
    return ids.length > 0 ? ids.join(' ') : null;
  });

  readonly ariaInvalid = computed(() => this.hasError());

  readonly cssClasses = computed(() => {
    const classes = ['pa-input'];
    if (this.size() === 'sm') classes.push('pa-input--sm');
    if (this.size() === 'md') classes.push('pa-input--md');
    if (this.size() === 'lg') classes.push('pa-input--lg');
    if (this.effectiveDisabled()) classes.push('pa-input--disabled');
    if (this.readonly()) classes.push('pa-input--readonly');
    if (this.hasError()) classes.push('pa-input--invalid');
    return classes.join(' ');
  });

  ngOnInit(): void {
    this.focusMonitor.monitor(this.hostElement.nativeElement).subscribe(() => {
      // Focus state is handled via CSS :focus-within
    });

    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnDestroy(): void {
    this.focusMonitor.stopMonitoring(this.hostElement.nativeElement);
  }

  // ControlValueAccessor
  writeValue(value: string | number | null): void {
    this.internalValue.set(value ?? '');
  }

  registerOnChange(fn: (value: string | number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.programmaticDisabled.set(isDisabled);
  }

  // Event handlers
  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    let newValue: string | number = target.value;

    if (this.type() === 'number') {
      newValue = target.valueAsNumber;
    }

    this.internalValue.set(newValue);
    this.onChange(newValue);
  }

  onBlur(): void {
    this.onTouched();
  }
}
