import { Component, DebugElement, ViewEncapsulation } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
// jest-axe v10 has no TS declarations — use require()
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { axe, toHaveNoViolations } = require('jest-axe') as {
  axe: (
    element: Element | Document,
    options?: Record<string, unknown>,
  ) => Promise<Record<string, unknown>>;
  toHaveNoViolations: Record<string, jest.CustomMatcher>;
};

import { PaInput } from './input.component';
import { PaInputSize } from './input.types';

expect.extend(toHaveNoViolations);

// Augment Jest matchers for toHaveNoViolations
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toHaveNoViolations(): R;
    }
  }
}

/**
 * Test host that wraps PaInput in a reactive form, matching real consumer
 * usage with `<input pa-input [formControl]="control">`.
 */
@Component({
  selector: 'pa-input-test-host',
  standalone: true,
  imports: [PaInput, ReactiveFormsModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <input
      pa-input
      id="pa-input-test"
      [formControl]="control"
      [size]="size"
      [placeholder]="placeholder"
      [disabled]="disabled"
      [readonly]="readonly"
      [ariaLabel]="ariaLabel"
    />
  `,
})
class TestHost {
  control = new FormControl<string>('');
  size: PaInputSize = 'md';
  placeholder = '';
  disabled = false;
  readonly = false;
  ariaLabel = 'Test input';
}

/**
 * Standalone host WITHOUT any form directive — proves PaInput works outside
 * a form (ngControl is null, typing works, no errors).
 */
@Component({
  selector: 'pa-input-standalone-host',
  standalone: true,
  imports: [PaInput],
  encapsulation: ViewEncapsulation.None,
  template: `<input pa-input placeholder="Write something" />`,
})
class StandaloneHost {}

describe('PaInput', () => {
  let focusOrigin$: Subject<FocusOrigin>;
  let focusMonitorMock: { monitor: jest.Mock; stopMonitoring: jest.Mock };

  beforeEach(() => {
    focusOrigin$ = new Subject<FocusOrigin>();
    focusMonitorMock = {
      monitor: jest.fn().mockReturnValue(focusOrigin$.asObservable()),
      stopMonitoring: jest.fn(),
    };
  });

  function createTestHost(): {
    fixture: ComponentFixture<TestHost>;
    host: TestHost;
    inputEl: HTMLInputElement;
    inputDebug: DebugElement;
  } {
    const fixture = TestBed.createComponent(TestHost);
    const host = fixture.componentInstance;
    const inputDebug = fixture.debugElement.query(By.css('input'));
    const inputEl = inputDebug.nativeElement as HTMLInputElement;
    return { fixture, host, inputEl, inputDebug };
  }

  // -----------------------------------------------------------------------
  // Rendering
  // -----------------------------------------------------------------------
  describe('rendering', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestHost],
        providers: [{ provide: FocusMonitor, useValue: focusMonitorMock }],
      }).compileComponents();
    });

    it('should render a native input element', () => {
      const { fixture, inputEl } = createTestHost();
      fixture.detectChanges();

      expect(inputEl.tagName).toBe('INPUT');
    });

    it('should have implicit role textbox from the native element', () => {
      const { fixture, inputEl } = createTestHost();
      fixture.detectChanges();

      // Native <input type="text"> has implicit role textbox — no explicit role attribute
      expect(inputEl.getAttribute('role')).toBeNull();
      const byCss = fixture.debugElement.query(By.css('input'));
      expect(byCss).not.toBeNull();
    });

    it('should always have the base BEM class pa-input', () => {
      const { fixture, inputEl } = createTestHost();
      fixture.detectChanges();

      expect(inputEl.classList.contains('pa-input')).toBe(true);
    });

    it('should apply aria-label from the input', () => {
      const { fixture, inputEl } = createTestHost();
      fixture.detectChanges();

      expect(inputEl.getAttribute('aria-label')).toBe('Test input');
    });

    it('should let the id attribute pass through (host is the native input)', () => {
      const { fixture, inputEl } = createTestHost();
      fixture.detectChanges();

      expect(inputEl.getAttribute('id')).toBe('pa-input-test');
    });

    it('should always render a text input, overriding any consumer-set type attribute', () => {
      const { fixture, inputEl } = createTestHost();
      inputEl.setAttribute('type', 'number');
      fixture.detectChanges();

      expect(inputEl.getAttribute('type')).toBe('text');
    });
  });

  // -----------------------------------------------------------------------
  // Size classes
  // -----------------------------------------------------------------------
  describe('size classes', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestHost],
        providers: [{ provide: FocusMonitor, useValue: focusMonitorMock }],
      }).compileComponents();
    });

    it('should apply pa-input--md by default', () => {
      const { fixture, host, inputEl } = createTestHost();
      host.size = 'md';
      fixture.detectChanges();

      expect(inputEl.classList.contains('pa-input--md')).toBe(true);
    });

    it('should apply pa-input--sm when size is sm', () => {
      const { fixture, host, inputEl } = createTestHost();
      host.size = 'sm';
      fixture.detectChanges();

      expect(inputEl.classList.contains('pa-input--sm')).toBe(true);
    });

    it('should apply pa-input--lg when size is lg', () => {
      const { fixture, host, inputEl } = createTestHost();
      host.size = 'lg';
      fixture.detectChanges();

      expect(inputEl.classList.contains('pa-input--lg')).toBe(true);
    });

    it('should NOT have classes for other sizes', () => {
      const { fixture, host, inputEl } = createTestHost();
      host.size = 'sm';
      fixture.detectChanges();

      expect(inputEl.classList.contains('pa-input--md')).toBe(false);
      expect(inputEl.classList.contains('pa-input--lg')).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // Placeholder
  // -----------------------------------------------------------------------
  describe('placeholder', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestHost],
        providers: [{ provide: FocusMonitor, useValue: focusMonitorMock }],
      }).compileComponents();
    });

    it('should bind the placeholder attribute', () => {
      const { fixture, host, inputEl } = createTestHost();
      host.placeholder = 'Type here';
      fixture.detectChanges();

      expect(inputEl.getAttribute('placeholder')).toBe('Type here');
    });

    it('should remove the placeholder attribute when empty', () => {
      const { fixture, host, inputEl } = createTestHost();
      host.placeholder = '';
      fixture.detectChanges();

      expect(inputEl.hasAttribute('placeholder')).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // Disabled state
  // -----------------------------------------------------------------------
  describe('disabled state', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestHost],
        providers: [{ provide: FocusMonitor, useValue: focusMonitorMock }],
      }).compileComponents();
    });

    it('should set native disabled, aria-disabled and the class when [disabled] is true', () => {
      const { fixture, host, inputEl } = createTestHost();
      host.disabled = true;
      fixture.detectChanges();

      expect(inputEl.disabled).toBe(true);
      expect(inputEl.getAttribute('aria-disabled')).toBe('true');
      expect(inputEl.classList.contains('pa-input--disabled')).toBe(true);
    });

    it('should NOT disable the input when [disabled] is false', () => {
      const { fixture, host, inputEl } = createTestHost();
      host.disabled = false;
      fixture.detectChanges();

      expect(inputEl.disabled).toBe(false);
      expect(inputEl.classList.contains('pa-input--disabled')).toBe(false);
    });

    it('should disable the native input when the control is disabled (CVA setDisabledState)', () => {
      const { fixture, host, inputEl } = createTestHost();
      fixture.detectChanges();

      host.control.disable();
      fixture.detectChanges();

      expect(inputEl.disabled).toBe(true);
      expect(inputEl.getAttribute('aria-disabled')).toBe('true');
      expect(inputEl.classList.contains('pa-input--disabled')).toBe(true);
    });

    it('should re-enable the native input when the control is enabled (CVA setDisabledState)', () => {
      const { fixture, host, inputEl } = createTestHost();
      fixture.detectChanges();

      host.control.disable();
      fixture.detectChanges();
      expect(inputEl.disabled).toBe(true);

      host.control.enable();
      fixture.detectChanges();

      expect(inputEl.disabled).toBe(false);
      expect(inputEl.classList.contains('pa-input--disabled')).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // Readonly state
  // -----------------------------------------------------------------------
  describe('readonly state', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestHost],
        providers: [{ provide: FocusMonitor, useValue: focusMonitorMock }],
      }).compileComponents();
    });

    it('should set readOnly, the readonly attribute and the class when [readonly] is true', () => {
      const { fixture, host, inputEl } = createTestHost();
      host.readonly = true;
      fixture.detectChanges();

      expect(inputEl.readOnly).toBe(true);
      expect(inputEl.hasAttribute('readonly')).toBe(true);
      expect(inputEl.classList.contains('pa-input--readonly')).toBe(true);
    });

    it('should remove the readonly state when [readonly] is false', () => {
      const { fixture, host, inputEl } = createTestHost();
      host.readonly = false;
      fixture.detectChanges();

      expect(inputEl.readOnly).toBe(false);
      expect(inputEl.hasAttribute('readonly')).toBe(false);
      expect(inputEl.classList.contains('pa-input--readonly')).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // Forms integration (ControlValueAccessor)
  // -----------------------------------------------------------------------
  describe('forms integration (ControlValueAccessor)', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestHost, StandaloneHost],
        providers: [{ provide: FocusMonitor, useValue: focusMonitorMock }],
      }).compileComponents();
    });

    it('should write the model value into the native input (control.setValue)', () => {
      const { fixture, host, inputEl } = createTestHost();
      fixture.detectChanges();

      host.control.setValue('hello');
      fixture.detectChanges();

      expect(inputEl.value).toBe('hello');
    });

    it('should update the control value when typing (input event)', () => {
      const { fixture, host, inputEl } = createTestHost();
      fixture.detectChanges();

      inputEl.value = 'world';
      inputEl.dispatchEvent(new Event('input'));

      expect(host.control.value).toBe('world');
    });

    it('should mark the control touched on blur (blur event)', () => {
      const { fixture, host, inputEl } = createTestHost();
      fixture.detectChanges();

      inputEl.dispatchEvent(new Event('blur'));

      expect(host.control.touched).toBe(true);
    });

    it('should work outside a form control (standalone host, ngControl null, no errors)', () => {
      const fixture = TestBed.createComponent(StandaloneHost);
      fixture.detectChanges();

      const inputEl = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(inputEl).not.toBeNull();
      expect(inputEl.classList.contains('pa-input')).toBe(true);

      inputEl.value = 'typed without form';
      inputEl.dispatchEvent(new Event('input'));

      expect(inputEl.value).toBe('typed without form');
    });
  });

  // -----------------------------------------------------------------------
  // Error state
  // -----------------------------------------------------------------------
  describe('error state', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestHost],
        providers: [{ provide: FocusMonitor, useValue: focusMonitorMock }],
      }).compileComponents();
    });

    it('should apply .pa-input--error and aria-invalid="true" when the control is invalid and touched', () => {
      const { fixture, host, inputEl } = createTestHost();
      fixture.detectChanges();

      host.control.setValidators(Validators.required);
      host.control.updateValueAndValidity();
      host.control.markAsTouched();
      fixture.detectChanges();

      expect(inputEl.classList.contains('pa-input--error')).toBe(true);
      expect(inputEl.getAttribute('aria-invalid')).toBe('true');
    });

    it('should NOT apply the error class when invalid but untouched', () => {
      const { fixture, host, inputEl } = createTestHost();
      fixture.detectChanges();

      host.control.setValidators(Validators.required);
      host.control.updateValueAndValidity();
      fixture.detectChanges();

      expect(inputEl.classList.contains('pa-input--error')).toBe(false);
      expect(inputEl.getAttribute('aria-invalid')).toBeNull();
    });

    it('should clear the error state when the control becomes valid', () => {
      const { fixture, host, inputEl } = createTestHost();
      fixture.detectChanges();

      host.control.setValidators(Validators.required);
      host.control.updateValueAndValidity();
      host.control.markAsTouched();
      fixture.detectChanges();
      expect(inputEl.classList.contains('pa-input--error')).toBe(true);

      host.control.setValue('ok');
      fixture.detectChanges();

      expect(inputEl.classList.contains('pa-input--error')).toBe(false);
      expect(inputEl.getAttribute('aria-invalid')).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // CDK FocusMonitor
  // -----------------------------------------------------------------------
  describe('FocusMonitor integration', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestHost],
        providers: [{ provide: FocusMonitor, useValue: focusMonitorMock }],
      }).compileComponents();
    });

    it('should call focusMonitor.monitor on init', () => {
      const { fixture } = createTestHost();
      fixture.detectChanges();

      expect(focusMonitorMock.monitor).toHaveBeenCalledTimes(1);
    });

    it('should apply pa-input--focused class on keyboard focus', () => {
      const { fixture, inputEl } = createTestHost();
      fixture.detectChanges();

      focusOrigin$.next('keyboard');
      fixture.detectChanges();

      expect(inputEl.classList.contains('pa-input--focused')).toBe(true);
    });

    it('should also apply pa-input--focused class on mouse focus (any origin shows the focus color, not just keyboard)', () => {
      const { fixture, inputEl } = createTestHost();
      fixture.detectChanges();

      focusOrigin$.next('mouse');
      fixture.detectChanges();

      expect(inputEl.classList.contains('pa-input--focused')).toBe(true);
    });

    it('should remove pa-input--focused when focus is lost (null origin)', () => {
      const { fixture, inputEl } = createTestHost();
      fixture.detectChanges();

      focusOrigin$.next('keyboard');
      fixture.detectChanges();
      expect(inputEl.classList.contains('pa-input--focused')).toBe(true);

      focusOrigin$.next(null);
      fixture.detectChanges();
      expect(inputEl.classList.contains('pa-input--focused')).toBe(false);
    });

    it('should call focusMonitor.stopMonitoring on destroy', () => {
      const { fixture } = createTestHost();
      fixture.detectChanges();

      fixture.destroy();

      expect(focusMonitorMock.stopMonitoring).toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------------------------
  // Standalone, OnPush, signal inputs (architectural compliance)
  // -----------------------------------------------------------------------
  describe('architectural compliance', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestHost],
        providers: [{ provide: FocusMonitor, useValue: focusMonitorMock }],
      }).compileComponents();
    });

    it('should be a standalone component', () => {
      const { fixture } = createTestHost();
      fixture.detectChanges();

      const inputDebug = fixture.debugElement.query(By.directive(PaInput));
      expect(inputDebug!.componentInstance).toBeDefined();
    });

    it('should use OnPush change detection (input change re-renders the DOM)', () => {
      const { fixture, host } = createTestHost();
      fixture.detectChanges();

      host.size = 'lg';
      fixture.detectChanges();

      const inputEl = fixture.debugElement.query(By.css('input'))!
        .nativeElement as HTMLInputElement;
      expect(inputEl.classList.contains('pa-input--lg')).toBe(true);
    });

    it('should update the DOM when a signal input is set via the host', () => {
      const { fixture, host } = createTestHost();
      fixture.detectChanges();

      host.placeholder = 'Search';
      fixture.detectChanges();

      const inputEl = fixture.debugElement.query(By.css('input'))!
        .nativeElement as HTMLInputElement;
      expect(inputEl.getAttribute('placeholder')).toBe('Search');
    });
  });

  // -----------------------------------------------------------------------
  // Accessibility (jest-axe)
  // -----------------------------------------------------------------------
  describe('accessibility', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestHost],
        providers: [{ provide: FocusMonitor, useValue: focusMonitorMock }],
      }).compileComponents();
    });

    it('should have no accessibility violations in default state', async () => {
      const { fixture } = createTestHost();
      fixture.detectChanges();

      const results = await axe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations when disabled', async () => {
      const { fixture, host } = createTestHost();
      host.disabled = true;
      fixture.detectChanges();

      const results = await axe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations when readonly', async () => {
      const { fixture, host } = createTestHost();
      host.readonly = true;
      fixture.detectChanges();

      const results = await axe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in error state', async () => {
      const { fixture, host } = createTestHost();
      fixture.detectChanges();

      host.control.setValidators(Validators.required);
      host.control.updateValueAndValidity();
      host.control.markAsTouched();
      fixture.detectChanges();

      const results = await axe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });
  });
});
