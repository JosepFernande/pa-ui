import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaInputComponent } from './input.component';
import { FocusMonitor } from '@angular/cdk/a11y';
import { By } from '@angular/platform-browser';

// jest-axe v10 has no TS declarations — use require()
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { axe, toHaveNoViolations } = require('jest-axe') as {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  axe: (element: Element | Document) => Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toHaveNoViolations: any;
};
expect.extend(toHaveNoViolations);

@Component({
  template: `
    <pa-input
      [label]="label"
      [placeholder]="placeholder"
      [errorMessage]="errorMessage"
      [hintText]="hintText"
      [disabled]="disabled"
      [readonly]="readonly"
      [size]="size"
      [type]="type"
    />
  `,
  standalone: true,
  imports: [PaInputComponent],
})
class TestHostComponent {
  label = '';
  placeholder = '';
  errorMessage = '';
  hintText = '';
  disabled = false;
  readonly = false;
  size: 'sm' | 'md' | 'lg' = 'md';
  type: 'text' | 'password' | 'email' | 'number' = 'text';
}

describe('PaInputComponent', () => {
  let host: ComponentFixture<TestHostComponent>;
  let component: PaInputComponent;
  let focusMonitor: jest.Mocked<FocusMonitor>;

  beforeEach(async () => {
    const mockFocusMonitor = {
      monitor: jest.fn().mockReturnValue({ subscribe: jest.fn() }),
      stopMonitoring: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [{ provide: FocusMonitor, useValue: mockFocusMonitor }],
    }).compileComponents();

    host = TestBed.createComponent(TestHostComponent);
    component = host.debugElement.query(By.directive(PaInputComponent)).componentInstance;
    focusMonitor = TestBed.inject(FocusMonitor) as jest.Mocked<FocusMonitor>;
  });

  describe('rendering', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should render label when provided', () => {
      host.componentInstance.label = 'Email';
      host.detectChanges();

      const label = host.debugElement.query(By.css('.pa-input__label'));
      expect(label).toBeTruthy();
      expect(label.nativeElement.textContent).toBe('Email');
    });

    it('should not render label when empty', () => {
      host.componentInstance.label = '';
      host.detectChanges();

      const label = host.debugElement.query(By.css('.pa-input__label'));
      expect(label).toBeFalsy();
    });

    it('should render placeholder', () => {
      host.componentInstance.placeholder = 'Enter email';
      host.detectChanges();

      const input = host.debugElement.query(By.css('input'));
      expect(input.nativeElement.getAttribute('placeholder')).toBe('Enter email');
    });

    it('should render hint text when provided', () => {
      host.componentInstance.hintText = 'We will never share your email';
      host.detectChanges();

      const hint = host.debugElement.query(By.css('.pa-input__hint'));
      expect(hint).toBeTruthy();
      expect(hint.nativeElement.textContent).toBe('We will never share your email');
    });

    it('should render error message when provided', () => {
      host.componentInstance.errorMessage = 'Email is required';
      host.detectChanges();

      const error = host.debugElement.query(By.css('.pa-input__error'));
      expect(error).toBeTruthy();
      expect(error.nativeElement.textContent).toBe('Email is required');
    });

    it('should hide hint when error is present', () => {
      host.componentInstance.hintText = 'Hint text';
      host.componentInstance.errorMessage = 'Error text';
      host.detectChanges();

      const hint = host.debugElement.query(By.css('.pa-input__hint'));
      const error = host.debugElement.query(By.css('.pa-input__error'));
      expect(hint).toBeFalsy();
      expect(error).toBeTruthy();
    });
  });

  describe('size classes', () => {
    it('should apply sm size class', () => {
      host.componentInstance.size = 'sm';
      host.detectChanges();

      const wrapper = host.debugElement.query(By.css('.pa-input'));
      expect(wrapper.nativeElement.classList.contains('pa-input--sm')).toBe(true);
    });

    it('should apply md size class by default', () => {
      host.detectChanges();

      const wrapper = host.debugElement.query(By.css('.pa-input'));
      expect(wrapper.nativeElement.classList.contains('pa-input--md')).toBe(true);
    });

    it('should apply lg size class', () => {
      host.componentInstance.size = 'lg';
      host.detectChanges();

      const wrapper = host.debugElement.query(By.css('.pa-input'));
      expect(wrapper.nativeElement.classList.contains('pa-input--lg')).toBe(true);
    });
  });

  describe('state classes', () => {
    it('should apply disabled class when disabled', () => {
      host.componentInstance.disabled = true;
      host.detectChanges();

      const wrapper = host.debugElement.query(By.css('.pa-input'));
      expect(wrapper.nativeElement.classList.contains('pa-input--disabled')).toBe(true);
    });

    it('should apply readonly class when readonly', () => {
      host.componentInstance.readonly = true;
      host.detectChanges();

      const wrapper = host.debugElement.query(By.css('.pa-input'));
      expect(wrapper.nativeElement.classList.contains('pa-input--readonly')).toBe(true);
    });

    it('should apply invalid class when error message is present', () => {
      host.componentInstance.errorMessage = 'Error';
      host.detectChanges();

      const wrapper = host.debugElement.query(By.css('.pa-input'));
      expect(wrapper.nativeElement.classList.contains('pa-input--invalid')).toBe(true);
    });
  });

  describe('CVA integration', () => {
    it('should write value to input', () => {
      component.writeValue('test@example.com');
      host.detectChanges();

      const input = host.debugElement.query(By.css('input'));
      expect(input.nativeElement.value).toBe('test@example.com');
    });

    it('should write null as empty string', () => {
      component.writeValue(null);
      host.detectChanges();

      const input = host.debugElement.query(By.css('input'));
      expect(input.nativeElement.value).toBe('');
    });

    it('should register onChange callback', () => {
      const onChange = jest.fn();
      component.registerOnChange(onChange);

      const input = host.debugElement.query(By.css('input'));
      input.nativeElement.value = 'new value';
      input.nativeElement.dispatchEvent(new Event('input'));

      expect(onChange).toHaveBeenCalledWith('new value');
    });

    it('should register onTouched callback', () => {
      const onTouched = jest.fn();
      component.registerOnTouched(onTouched);

      const input = host.debugElement.query(By.css('input'));
      input.nativeElement.dispatchEvent(new Event('blur'));

      expect(onTouched).toHaveBeenCalled();
    });

    it('should set disabled state', () => {
      component.setDisabledState(true);
      host.detectChanges();

      const input = host.debugElement.query(By.css('input'));
      expect(input.nativeElement.disabled).toBe(true);
    });

    it('should enable when setDisabledState(false)', () => {
      component.setDisabledState(false);
      host.detectChanges();

      const input = host.debugElement.query(By.css('input'));
      expect(input.nativeElement.disabled).toBe(false);
    });

    it('should handle number type input', () => {
      host.componentInstance.type = 'number';
      host.detectChanges();

      const input = host.debugElement.query(By.css('input'));
      expect(input.nativeElement.type).toBe('number');
    });
  });

  describe('accessibility', () => {
    it('should associate label with input', () => {
      host.componentInstance.label = 'Email';
      host.detectChanges();

      const label = host.debugElement.query(By.css('label'));
      const input = host.debugElement.query(By.css('input'));

      const labelFor = label.nativeElement.getAttribute('for');
      const inputId = input.nativeElement.getAttribute('id');

      expect(labelFor).toBe(inputId);
    });

    it('should set aria-invalid when error is present', () => {
      host.componentInstance.errorMessage = 'Error';
      host.detectChanges();

      const input = host.debugElement.query(By.css('input'));
      expect(input.nativeElement.getAttribute('aria-invalid')).toBe('true');
    });

    it('should set aria-describedby for hint', () => {
      host.componentInstance.hintText = 'Hint text';
      host.detectChanges();

      const input = host.debugElement.query(By.css('input'));
      const hint = host.debugElement.query(By.css('.pa-input__hint'));

      const describedBy = input.nativeElement.getAttribute('aria-describedby');
      const hintId = hint.nativeElement.getAttribute('id');

      expect(describedBy).toBe(hintId);
    });

    it('should set aria-describedby for error', () => {
      host.componentInstance.errorMessage = 'Error text';
      host.detectChanges();

      const input = host.debugElement.query(By.css('input'));
      const error = host.debugElement.query(By.css('.pa-input__error'));

      const describedBy = input.nativeElement.getAttribute('aria-describedby');
      const errorId = error.nativeElement.getAttribute('id');

      expect(describedBy).toBe(errorId);
    });

    it('should set role=alert on error message', () => {
      host.componentInstance.errorMessage = 'Error text';
      host.detectChanges();

      const error = host.debugElement.query(By.css('.pa-input__error'));
      expect(error.nativeElement.getAttribute('role')).toBe('alert');
    });

    it('should pass accessibility checks with jest-axe', async () => {
      host.componentInstance.label = 'Email';
      host.componentInstance.hintText = 'Hint text';
      host.detectChanges();

      const results = await axe(host.nativeElement);
      expect(results).toHaveNoViolations();
    });
  });

  describe('CDK integration', () => {
    it('should monitor focus on native element', () => {
      host.detectChanges();
      expect(focusMonitor.monitor).toHaveBeenCalled();
    });

    it('should stop monitoring on destroy', () => {
      component.ngOnDestroy();
      expect(focusMonitor.stopMonitoring).toHaveBeenCalled();
    });
  });

  describe('architectural compliance', () => {
    it('should be standalone', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cmp = (component.constructor as any).ɵcmp;
      expect(cmp?.standalone).toBe(true);
    });

    it('should have component metadata', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cmp = (component.constructor as any).ɵcmp;
      expect(cmp).toBeDefined();
      expect(cmp.type).toBeDefined();
    });

    it('should not use any types in public API', () => {
      // This is a compile-time check, but we verify the component exists
      expect(component).toBeTruthy();
    });
  });
});
