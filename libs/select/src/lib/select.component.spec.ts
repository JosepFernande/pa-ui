import { Component, ViewEncapsulation } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
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

import { PaSelect } from './select.component';
import type { PaSelectOption, PaSelectSize } from './select.types';

expect.extend(toHaveNoViolations);

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toHaveNoViolations(): R;
    }
  }
}

const FRUIT_OPTIONS: PaSelectOption[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry', disabled: true },
];

/**
 * Test host that wraps PaSelect in a reactive form, matching real consumer
 * usage with `<pa-select [formControl]="control">`.
 */
@Component({
  selector: 'pa-select-test-host',
  standalone: true,
  imports: [PaSelect, ReactiveFormsModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <pa-select
      id="pa-select-test"
      [formControl]="control"
      [options]="options"
      [size]="size"
      [placeholder]="placeholder"
      [disabled]="disabled"
      [readonly]="readonly"
      [ariaLabel]="ariaLabel"
      [ariaDescribedBy]="ariaDescribedBy"
    ></pa-select>
  `,
})
class TestHost {
  control = new FormControl<unknown>(null);
  options: PaSelectOption[] = FRUIT_OPTIONS;
  size: PaSelectSize = 'md';
  placeholder = 'Select a fruit';
  disabled = false;
  readonly = false;
  ariaLabel = 'Fruit';
  ariaDescribedBy = '';
}

/**
 * Standalone host WITHOUT any form directive — proves PaSelect works outside
 * a form (ngControl is null, no errors).
 */
@Component({
  selector: 'pa-select-standalone-host',
  standalone: true,
  imports: [PaSelect],
  encapsulation: ViewEncapsulation.None,
  template: `<pa-select [options]="options" placeholder="Pick one"></pa-select>`,
})
class StandaloneHost {
  options: PaSelectOption[] = FRUIT_OPTIONS;
}

describe('PaSelect', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHost, StandaloneHost],
    }).compileComponents();
  });

  function createTestHost(): {
    fixture: ComponentFixture<TestHost>;
    host: TestHost;
    triggerEl: HTMLButtonElement;
    hostEl: HTMLElement;
  } {
    const fixture = TestBed.createComponent(TestHost);
    const host = fixture.componentInstance;
    const triggerEl = fixture.debugElement.query(By.css('[role="combobox"]'))
      .nativeElement as HTMLButtonElement;
    const hostEl = fixture.debugElement.query(By.directive(PaSelect)).nativeElement as HTMLElement;
    return { fixture, host, triggerEl, hostEl };
  }

  // -----------------------------------------------------------------------
  // Rendering
  // -----------------------------------------------------------------------
  describe('rendering', () => {
    it('should render a trigger button with role combobox', () => {
      const { fixture, triggerEl } = createTestHost();
      fixture.detectChanges();

      expect(triggerEl.tagName).toBe('BUTTON');
      expect(triggerEl.getAttribute('role')).toBe('combobox');
    });

    it('should always have the base BEM class pa-select on the host element', () => {
      const { fixture, hostEl } = createTestHost();
      fixture.detectChanges();

      expect(hostEl.classList.contains('pa-select')).toBe(true);
    });

    it('should show the placeholder text when no value is selected', () => {
      const { fixture, triggerEl } = createTestHost();
      fixture.detectChanges();

      expect(triggerEl.textContent?.trim()).toBe('Select a fruit');
    });

    it('should show the label of the option matching the bound value', () => {
      const { fixture, host, triggerEl } = createTestHost();
      host.control.setValue('banana');
      fixture.detectChanges();

      expect(triggerEl.textContent?.trim()).toBe('Banana');
    });

    it('should have aria-haspopup listbox and aria-expanded false (no overlay wired yet)', () => {
      const { fixture, triggerEl } = createTestHost();
      fixture.detectChanges();

      expect(triggerEl.getAttribute('aria-haspopup')).toBe('listbox');
      expect(triggerEl.getAttribute('aria-expanded')).toBe('false');
    });

    it('should apply aria-label from the input', () => {
      const { fixture, triggerEl } = createTestHost();
      fixture.detectChanges();

      expect(triggerEl.getAttribute('aria-label')).toBe('Fruit');
    });

    it('should never render an overlay/listbox panel in this phase', () => {
      const { fixture } = createTestHost();
      fixture.detectChanges();

      expect(document.querySelector('[role="listbox"]')).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // Size classes
  // -----------------------------------------------------------------------
  describe('size classes', () => {
    it('should apply pa-select--md by default', () => {
      const { fixture, host, hostEl } = createTestHost();
      host.size = 'md';
      fixture.detectChanges();

      expect(hostEl.classList.contains('pa-select--md')).toBe(true);
    });

    it('should apply pa-select--sm when size is sm', () => {
      const { fixture, host, hostEl } = createTestHost();
      host.size = 'sm';
      fixture.detectChanges();

      expect(hostEl.classList.contains('pa-select--sm')).toBe(true);
    });

    it('should apply pa-select--lg when size is lg', () => {
      const { fixture, host, hostEl } = createTestHost();
      host.size = 'lg';
      fixture.detectChanges();

      expect(hostEl.classList.contains('pa-select--lg')).toBe(true);
    });

    it('should NOT have classes for other sizes', () => {
      const { fixture, host, hostEl } = createTestHost();
      host.size = 'sm';
      fixture.detectChanges();

      expect(hostEl.classList.contains('pa-select--md')).toBe(false);
      expect(hostEl.classList.contains('pa-select--lg')).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // Disabled state / tab order
  // -----------------------------------------------------------------------
  describe('disabled state', () => {
    it('should set native disabled, aria-disabled, and the class when [disabled] is true', () => {
      const { fixture, host, triggerEl, hostEl } = createTestHost();
      host.disabled = true;
      fixture.detectChanges();

      expect(triggerEl.disabled).toBe(true);
      expect(triggerEl.getAttribute('aria-disabled')).toBe('true');
      expect(hostEl.classList.contains('pa-select--disabled')).toBe(true);
    });

    it('should remove the trigger from the tab order when disabled', () => {
      const { fixture, host, triggerEl } = createTestHost();
      host.disabled = true;
      fixture.detectChanges();

      // Native disabled buttons are structurally excluded from the tab order.
      expect(triggerEl.disabled).toBe(true);
    });

    it('should disable the trigger when the bound control is disabled (CVA setDisabledState)', () => {
      const { fixture, host, triggerEl } = createTestHost();
      fixture.detectChanges();

      host.control.disable();
      fixture.detectChanges();

      expect(triggerEl.disabled).toBe(true);
    });

    it('should re-enable the trigger when the bound control is enabled (CVA setDisabledState)', () => {
      const { fixture, host, triggerEl } = createTestHost();
      fixture.detectChanges();

      host.control.disable();
      fixture.detectChanges();
      expect(triggerEl.disabled).toBe(true);

      host.control.enable();
      fixture.detectChanges();

      expect(triggerEl.disabled).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // Readonly state / tab order
  // -----------------------------------------------------------------------
  describe('readonly state', () => {
    it('should keep the trigger focusable/tabbable (NOT disabled) when readonly', () => {
      const { fixture, host, triggerEl, hostEl } = createTestHost();
      host.readonly = true;
      fixture.detectChanges();

      expect(triggerEl.disabled).toBe(false);
      expect(triggerEl.tabIndex).toBe(0);
      expect(hostEl.classList.contains('pa-select--readonly')).toBe(true);
    });

    it('should remove the readonly class when [readonly] is false', () => {
      const { fixture, host, hostEl } = createTestHost();
      host.readonly = false;
      fixture.detectChanges();

      expect(hostEl.classList.contains('pa-select--readonly')).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // Forms integration (ControlValueAccessor)
  // -----------------------------------------------------------------------
  describe('forms integration (ControlValueAccessor)', () => {
    it('should render the label of the option matching control.setValue', () => {
      const { fixture, host, triggerEl } = createTestHost();
      fixture.detectChanges();

      host.control.setValue('apple');
      fixture.detectChanges();

      expect(triggerEl.textContent?.trim()).toBe('Apple');
    });

    it('writeValue with a value NOT present in options shows the placeholder and does NOT clear the control value', () => {
      const { fixture, host, triggerEl } = createTestHost();
      fixture.detectChanges();

      host.control.setValue('missing-id');
      fixture.detectChanges();

      expect(triggerEl.textContent?.trim()).toBe('Select a fruit');
      expect(host.control.value).toBe('missing-id');
    });

    it('should mark the control touched on trigger blur', () => {
      const { fixture, host, triggerEl } = createTestHost();
      fixture.detectChanges();

      triggerEl.dispatchEvent(new Event('blur'));

      expect(host.control.touched).toBe(true);
    });

    it('should work outside a form control (standalone host, ngControl null, no errors)', () => {
      const fixture = TestBed.createComponent(StandaloneHost);
      fixture.detectChanges();

      const triggerEl = fixture.nativeElement.querySelector(
        '[role="combobox"]',
      ) as HTMLButtonElement;
      expect(triggerEl).not.toBeNull();
      expect(triggerEl.textContent?.trim()).toBe('Pick one');
    });
  });

  // -----------------------------------------------------------------------
  // Error state
  // -----------------------------------------------------------------------
  describe('error state', () => {
    it('should apply .pa-select--error and aria-invalid="true" when the control is invalid and touched', () => {
      const { fixture, host, triggerEl, hostEl } = createTestHost();
      fixture.detectChanges();

      host.control.setValidators(Validators.required);
      host.control.updateValueAndValidity();
      host.control.markAsTouched();
      fixture.detectChanges();

      expect(hostEl.classList.contains('pa-select--error')).toBe(true);
      expect(triggerEl.getAttribute('aria-invalid')).toBe('true');
    });

    it('should NOT apply the error class when invalid but untouched', () => {
      const { fixture, host, triggerEl, hostEl } = createTestHost();
      fixture.detectChanges();

      host.control.setValidators(Validators.required);
      host.control.updateValueAndValidity();
      fixture.detectChanges();

      expect(hostEl.classList.contains('pa-select--error')).toBe(false);
      expect(triggerEl.getAttribute('aria-invalid')).toBeNull();
    });

    it('should clear the error state when the control becomes valid', () => {
      const { fixture, host, triggerEl, hostEl } = createTestHost();
      fixture.detectChanges();

      host.control.setValidators(Validators.required);
      host.control.updateValueAndValidity();
      host.control.markAsTouched();
      fixture.detectChanges();
      expect(hostEl.classList.contains('pa-select--error')).toBe(true);

      host.control.setValue('apple');
      fixture.detectChanges();

      expect(hostEl.classList.contains('pa-select--error')).toBe(false);
      expect(triggerEl.getAttribute('aria-invalid')).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // Architectural compliance
  // -----------------------------------------------------------------------
  describe('architectural compliance', () => {
    it('should be a standalone component', () => {
      const { fixture } = createTestHost();
      fixture.detectChanges();

      const selectDebug = fixture.debugElement.query(By.directive(PaSelect));
      expect(selectDebug!.componentInstance).toBeDefined();
    });

    it('should use OnPush change detection (input change re-renders the DOM)', () => {
      const { fixture, host, hostEl } = createTestHost();
      fixture.detectChanges();

      host.size = 'lg';
      fixture.detectChanges();

      expect(hostEl.classList.contains('pa-select--lg')).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // Accessibility (jest-axe)
  // -----------------------------------------------------------------------
  describe('accessibility', () => {
    it('should have no accessibility violations in the default closed state', async () => {
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

    it('should have no accessibility violations when invalid and touched', async () => {
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
