# ControlValueAccessor (CVA)

## What Is ControlValueAccessor

It's the Angular interface that lets a custom component plug into Angular's
forms system, both Reactive Forms and Template-Driven Forms.

Without CVA, an input wired to forms manually needs explicit bindings:

```html
<!-- Without CVA: the consumer has to do everything manually -->
<input
  ha-input-text
  [value]="form.get('email').value"
  (input)="form.get('email').setValue($event.target.value)"
/>
```

With CVA, the component integrates natively:

```html
<!-- With CVA: use it like any native input -->
<input ha-input-text formControlName="email" />
<input ha-input-text [(ngModel)]="email" />
```

## How `HaInputText` Implements CVA (real code)

`HaInputText` (`libs/input-text/src/lib/input-text.component.ts`) uses an
**attribute** selector on the native element (`input[ha-input-text]`), not a
custom element (`<ha-input-text>`). The host IS the native `<input>` — the
component has no template of its own (`template: ''`): there's no intermediate
`value` signal, `writeValue` writes directly to the DOM.

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
  selector: 'input[ha-input-text]',
  standalone: true,
  template: '',
  styleUrl: './input-text.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => HaInputText),
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
export class HaInputText implements ControlValueAccessor, OnInit, OnDestroy {
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

There's no template and no wrapper `<div class="ha-input-text">`: the host
element is directly the `<input>` the consumer wrote, and the BEM classes
(`ha-input-text--error`, `ha-input-text--disabled`, etc.) apply to that same
element via `[class]="hostClasses()"`.

## Which Components Implement CVA Today

| Component                              | CVA | Value type |
| -------------------------------------- | --- | ---------- |
| `input[ha-input-text]` (`HaInputText`) | Yes | `string`   |
| `ha-select` (`HaSelect`)               | Yes | `unknown`  |
| `button[ha-button]` (`HaButton`)       | No  | —          |

`HaSelect` (`libs/select/src/lib/select.component.ts`) follows the same
lazy-`NgControl` / `validityVersion` pattern as `HaInputText`, but it's a custom
element with its own template (not an attribute selector on the native control):
`writeValue` stores the raw value into a `valueState` signal instead of writing
to the DOM, and `registerOnChange`/`registerOnTouched` wire the same way. See
its class-level TSDoc for the full comparison.

The remaining form components (`checkbox`, `radio`, `autocomplete`) don't exist
in the repo yet — they're roadmap, not a live contract.

## Injecting `NgControl`: Why It Can't Happen in the Constructor

Earlier documentation showed `inject(NgControl, { optional: true, self: true })`
as a field initializer. **That breaks with `NG0200` (circular DI)** in this
component: the `[formControl]`/`formControlName` directive lives on the same
native element and injects `NG_VALUE_ACCESSOR` in its own constructor — which is
`HaInputText`. Resolving `NgControl` at construction time creates the cycle.

The real fix resolves it lazily, on first read, using an injected `Injector` and
a getter:

```typescript
private readonly injector = inject(Injector);

private get ngControl(): NgControl | null {
  return this.injector.get(NgControl, null, { self: true, optional: true });
}
```

`ngControl.valueAccessor` is never assigned manually — Angular resolves it on
its own via `selectValueAccessor`, because `HaInputText` is already registered
as `NG_VALUE_ACCESSOR`.

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

`hasError` only drives state (`.ha-input-text--error` + `aria-invalid`).
`HaInputText` renders no visual error message
(`<span class="ha-input-text__error">` doesn't exist) and no `paFormError` pipe
— it isn't in the repo. Showing the error text is the consumer's responsibility.

## Testing CVA (real pattern: TestBed, not Angular Testing Library)

Real tests use `TestBed` + `fixture.debugElement.query(By.css(...))`, not
`@testing-library/angular` (that dependency is not in `package.json`):

```typescript
describe('HaInputText - CVA', () => {
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
