# ControlValueAccessor (CVA)

## What Is ControlValueAccessor

It's the Angular interface that lets a custom component plug into Angular's
forms system, both Reactive Forms and Template-Driven Forms.

Without CVA, an input wired to forms manually needs explicit bindings:

```html
<!-- Without CVA: the consumer has to do everything manually -->
<input
  pa-input
  [value]="form.get('email').value"
  (input)="form.get('email').setValue($event.target.value)"
/>
```

With CVA, the component integrates natively:

```html
<!-- With CVA: use it like any native input -->
<input pa-input formControlName="email" />
<input pa-input [(ngModel)]="email" />
```

## How `PaInput` Implements CVA (real code)

`PaInput` (`libs/input/src/lib/input.component.ts`) uses an **attribute**
selector on the native element (`input[pa-input]`), not a custom element
(`<pa-input>`). The host IS the native `<input>` — the component has no template
of its own (`template: ''`): there's no intermediate `value` signal,
`writeValue` writes directly to the DOM.

```typescript
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
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NgControl,
} from '@angular/forms';

@Component({
  selector: 'input[pa-input]',
  standalone: true,
  template: '',
  styleUrl: './input.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PaInput),
      multi: true,
    },
  ],
  host: {
    '[class]': 'hostClasses()',
    '[disabled]': 'effectiveDisabled()',
    '[attr.aria-invalid]': 'hasError() ? "true" : null',
    '(input)': 'onInput($event)',
    '(blur)': 'onBlur()',
  },
})
export class PaInput implements ControlValueAccessor, OnInit, OnDestroy {
  readonly disabled = input(false);
  protected readonly formDisabled = signal(false);
  protected readonly effectiveDisabled = computed(
    () => this.disabled() || this.formDisabled(),
  );

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private readonly elementRef: ElementRef<HTMLInputElement>) {}

  // ControlValueAccessor: writes a model value directly into the native input.
  writeValue(value: string | null): void {
    this.elementRef.nativeElement.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  onInput(event: Event): void {
    this.onChange((event.target as HTMLInputElement).value);
  }

  onBlur(): void {
    this.onTouched();
  }
}
```

_(Simplified excerpt — the real file additionally wires `size`, `readonly`,
`placeholder`, `ariaLabel`/`ariaDescribedBy`, `focusOrigin` via CDK
`FocusMonitor`, and the `hasError` logic explained below.)_

There's no template and no wrapper `<div class="pa-input">`: the host element is
directly the `<input>` the consumer wrote, and the BEM classes
(`pa-input--error`, `pa-input--disabled`, etc.) apply to that same element via
`[class]="hostClasses()"`.

## Which Components Implement CVA Today

| Component                        | CVA | Value type |
| -------------------------------- | --- | ---------- |
| `input[pa-input]` (`PaInput`)    | Yes | `string`   |
| `button[pa-button]` (`PaButton`) | No  | —          |

The remaining form components (`checkbox`, `radio`, `select`, `autocomplete`)
don't exist in the repo yet — they're roadmap, not a live contract.

## Injecting `NgControl`: Why It Can't Happen in the Constructor

Earlier documentation showed `inject(NgControl, { optional: true, self: true })`
as a field initializer. **That breaks with `NG0200` (circular DI)** in this
component: the `[formControl]`/`formControlName` directive lives on the same
native element and injects `NG_VALUE_ACCESSOR` in its own constructor — which is
`PaInput`. Resolving `NgControl` at construction time creates the cycle.

The real fix resolves it lazily, on first read, using an injected `Injector` and
a getter:

```typescript
private readonly injector = inject(Injector);

private get ngControl(): NgControl | null {
  return this.injector.get(NgControl, null, { self: true, optional: true });
}
```

`ngControl.valueAccessor` is never assigned manually — Angular resolves it on
its own via `selectValueAccessor`, because `PaInput` is already registered as
`NG_VALUE_ACCESSOR`.

## `hasError`: Why It Isn't a Plain `computed()`

`control.invalid` and `control.touched` are **not signals** — a `computed()`
that reads them directly evaluates once and stays cached forever (verified
empirically against Angular 19). The real solution uses a `validityVersion`
signal bumped by subscribing to the `control.events` stream (covers touched,
status, and value changes — `statusChanges` alone misses the blur/touch
transition):

```typescript
private readonly validityVersion = signal(0);

protected readonly hasError = computed(() => {
  this.validityVersion(); // invalidation dependency
  const control = this.ngControl?.control;
  return control != null && control.invalid && control.touched;
});

ngOnInit(): void {
  const control = this.ngControl?.control;
  control?.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
    this.validityVersion.update((v) => v + 1);
    this.cdr.markForCheck();
  });
}
```

`hasError` only drives state (`.pa-input--error` + `aria-invalid`). `PaInput`
renders no visual error message (`<span class="pa-input__error">` doesn't exist)
and no `paFormError` pipe — it isn't in the repo. Showing the error text is the
consumer's responsibility.

## Testing CVA (real pattern: TestBed, not Angular Testing Library)

Real tests use `TestBed` + `fixture.debugElement.query(By.css(...))`, not
`@testing-library/angular` (that dependency is not in `package.json`):

```typescript
describe('PaInput - CVA', () => {
  it('writes the form control value into the native input', () => {
    // TestBed.configureTestingModule({ imports: [ReactiveFormsModule] }), etc.
    // form.get('name')?.setValue('updated');
    // expect(input.nativeElement.value).toBe('updated');
  });

  it('propagates user input to the form control via onChange', () => {
    // input.nativeElement.value = 'Josep';
    // input.nativeElement.dispatchEvent(new Event('input'));
    // expect(form.get('name')?.value).toBe('Josep');
  });

  it('disables the native input when the form control is disabled', () => {
    // form.get('name')?.disable();
    // expect(input.nativeElement.disabled).toBe(true);
  });
});
```

See [Testing Strategy](./testing-strategy.md) for the full `TestBed` + Test Host
pattern used across the real specs.

## Rules of the Team

- Every form component MUST implement `ControlValueAccessor`.
- `NgControl` MUST be resolved lazily (a getter over `Injector`,
  `{ self: true, optional: true }`), never as a field initializer — avoids
  `NG0200`.
- Components MUST NOT break when used outside a form.
- Error state (`invalid && touched`) is exposed via a BEM class +
  `aria-invalid`; the visual error message is the consumer's responsibility, not
  the component's.
- Tests MUST cover the CVA cases: `writeValue`, `onChange` (via the `input`
  event), `setDisabledState`.
