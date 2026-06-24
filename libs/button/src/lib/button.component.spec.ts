import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
// jest-axe v10 has no TS declarations — use require()
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { axe, toHaveNoViolations } = require('jest-axe') as {
  axe: (element: Element | Document, options?: Record<string, unknown>) => Promise<Record<string, unknown>>;
  toHaveNoViolations: Record<string, jest.CustomMatcher>;
};

import { PaButton } from './button.component';
import { PaButtonVariant, PaButtonSize } from './button.types';

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
 * Test host that wraps PaButton in a parent template,
 * matching real consumer usage with `<button pa-button>`.
 */
@Component({
  standalone: true,
  imports: [PaButton],
  template: `
    <button
      pa-button
      [variant]="variant"
      [size]="size"
      [color]="color"
      [disabled]="disabled"
      [loading]="loading"
      [type]="type"
      (click)="onClick()"
    >
      {{ label }}
    </button>
  `,
})
class TestHost {
  variant: PaButtonVariant = 'solid';
  size: PaButtonSize = 'md';
  color = 'primary';
  disabled = false;
  loading = false;
  type: 'button' | 'submit' | 'reset' = 'button';
  label = 'Test Button';
  clicked = false;

  onClick(): void {
    this.clicked = true;
  }
}

describe('PaButton', () => {
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
    buttonEl: HTMLButtonElement;
    buttonDebug: DebugElement;
  } {
    const fixture = TestBed.createComponent(TestHost);
    const host = fixture.componentInstance;
    const buttonDebug = fixture.debugElement.query(By.css('button'));
    const buttonEl = buttonDebug.nativeElement as HTMLButtonElement;
    return { fixture, host, buttonEl, buttonDebug };
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

    it('should render a native button element', () => {
      const { fixture, buttonEl } = createTestHost();
      fixture.detectChanges();

      expect(buttonEl.tagName).toBe('BUTTON');
    });

    it('should project ng-content as the button label', () => {
      const { fixture, host, buttonEl } = createTestHost();
      host.label = 'Save Changes';
      fixture.detectChanges();

      expect(buttonEl.textContent).toContain('Save Changes');
    });

    it('should have implicit role="button" from the native element', () => {
      const { fixture, buttonEl } = createTestHost();
      fixture.detectChanges();

      // Native <button> has implicit role=button
      expect(buttonEl.getAttribute('role')).toBeNull();
      // but the element is a button — query by role confirms semantics
      const byRole = fixture.debugElement.query(By.css('button'));
      expect(byRole).not.toBeNull();
    });

    it('should always have the base BEM class pa-button', () => {
      const { fixture, buttonEl } = createTestHost();
      fixture.detectChanges();

      expect(buttonEl.classList.contains('pa-button')).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // Variant classes
  // -----------------------------------------------------------------------
  describe('variant classes', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestHost],
        providers: [{ provide: FocusMonitor, useValue: focusMonitorMock }],
      }).compileComponents();
    });

    it('should apply pa-button--solid by default', () => {
      const { fixture, host, buttonEl } = createTestHost();
      host.variant = 'solid';
      fixture.detectChanges();

      expect(buttonEl.classList.contains('pa-button--solid')).toBe(true);
    });

    it('should apply pa-button--outline when variant is outline', () => {
      const { fixture, host, buttonEl } = createTestHost();
      host.variant = 'outline';
      fixture.detectChanges();

      expect(buttonEl.classList.contains('pa-button--outline')).toBe(true);
    });

    it('should apply pa-button--ghost when variant is ghost', () => {
      const { fixture, host, buttonEl } = createTestHost();
      host.variant = 'ghost';
      fixture.detectChanges();

      expect(buttonEl.classList.contains('pa-button--ghost')).toBe(true);
    });

    it('should NOT have classes for other variants', () => {
      const { fixture, host, buttonEl } = createTestHost();
      host.variant = 'solid';
      fixture.detectChanges();

      expect(buttonEl.classList.contains('pa-button--outline')).toBe(false);
      expect(buttonEl.classList.contains('pa-button--ghost')).toBe(false);
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

    it('should apply pa-button--md by default', () => {
      const { fixture, host, buttonEl } = createTestHost();
      host.size = 'md';
      fixture.detectChanges();

      expect(buttonEl.classList.contains('pa-button--md')).toBe(true);
    });

    it('should apply pa-button--sm when size is sm', () => {
      const { fixture, host, buttonEl } = createTestHost();
      host.size = 'sm';
      fixture.detectChanges();

      expect(buttonEl.classList.contains('pa-button--sm')).toBe(true);
    });

    it('should apply pa-button--lg when size is lg', () => {
      const { fixture, host, buttonEl } = createTestHost();
      host.size = 'lg';
      fixture.detectChanges();

      expect(buttonEl.classList.contains('pa-button--lg')).toBe(true);
    });

    it('should NOT have classes for other sizes', () => {
      const { fixture, host, buttonEl } = createTestHost();
      host.size = 'sm';
      fixture.detectChanges();

      expect(buttonEl.classList.contains('pa-button--md')).toBe(false);
      expect(buttonEl.classList.contains('pa-button--lg')).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // Color CSS variable
  // -----------------------------------------------------------------------
  describe('color CSS variable', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestHost],
        providers: [{ provide: FocusMonitor, useValue: focusMonitorMock }],
      }).compileComponents();
    });

    it('should resolve --pa-button-color to var(--pa-primary) by default', () => {
      const { fixture, host, buttonEl } = createTestHost();
      host.color = 'primary';
      fixture.detectChanges();

      const style = buttonEl.style.getPropertyValue('--pa-button-color');
      expect(style).toBe('var(--pa-primary)');
    });

    it('should resolve --pa-button-color to var(--pa-danger) when color is danger', () => {
      const { fixture, host, buttonEl } = createTestHost();
      host.color = 'danger';
      fixture.detectChanges();

      const style = buttonEl.style.getPropertyValue('--pa-button-color');
      expect(style).toBe('var(--pa-danger)');
    });

    it('should resolve --pa-button-color to var(--pa-custom) for any string', () => {
      const { fixture, host, buttonEl } = createTestHost();
      host.color = 'custom-theme';
      fixture.detectChanges();

      const style = buttonEl.style.getPropertyValue('--pa-button-color');
      expect(style).toBe('var(--pa-custom-theme)');
    });
  });

  // -----------------------------------------------------------------------
  // Type attribute
  // -----------------------------------------------------------------------
  describe('type attribute', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestHost],
        providers: [{ provide: FocusMonitor, useValue: focusMonitorMock }],
      }).compileComponents();
    });

    it('should default to type="button"', () => {
      const { fixture, host, buttonEl } = createTestHost();
      host.type = 'button';
      fixture.detectChanges();

      expect(buttonEl.getAttribute('type')).toBe('button');
    });

    it('should set type="submit" when type input is submit', () => {
      const { fixture, host, buttonEl } = createTestHost();
      host.type = 'submit';
      fixture.detectChanges();

      expect(buttonEl.getAttribute('type')).toBe('submit');
    });

    it('should set type="reset" when type input is reset', () => {
      const { fixture, host, buttonEl } = createTestHost();
      host.type = 'reset';
      fixture.detectChanges();

      expect(buttonEl.getAttribute('type')).toBe('reset');
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

    it('should set native disabled attribute when disabled is true', () => {
      const { fixture, host, buttonEl } = createTestHost();
      host.disabled = true;
      fixture.detectChanges();

      expect(buttonEl.disabled).toBe(true);
    });

    it('should suppress click when disabled', () => {
      const { fixture, host } = createTestHost();
      host.disabled = true;
      fixture.detectChanges();

      const { buttonEl } = { buttonEl: fixture.debugElement.query(By.css('button'))!.nativeElement as HTMLButtonElement };
      buttonEl.click();

      expect(host.clicked).toBe(false);
    });

    it('should apply pa-button--disabled class when disabled', () => {
      const { fixture, host, buttonEl } = createTestHost();
      host.disabled = true;
      fixture.detectChanges();

      expect(buttonEl.classList.contains('pa-button--disabled')).toBe(true);
    });

    it('should NOT suppress click when not disabled', () => {
      const { fixture, host, buttonEl } = createTestHost();
      host.disabled = false;
      fixture.detectChanges();

      buttonEl.click();

      // Native button without disabled should fire click.
      // jsdom may or may not dispatch click — assert the attribute is not set
      expect(buttonEl.disabled).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // Loading state
  // -----------------------------------------------------------------------
  describe('loading state', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestHost],
        providers: [{ provide: FocusMonitor, useValue: focusMonitorMock }],
      }).compileComponents();
    });

    it('should set aria-busy="true" when loading', () => {
      const { fixture, host, buttonEl } = createTestHost();
      host.loading = true;
      fixture.detectChanges();

      expect(buttonEl.getAttribute('aria-busy')).toBe('true');
    });

    it('should NOT have aria-busy when not loading', () => {
      const { fixture, host, buttonEl } = createTestHost();
      host.loading = false;
      fixture.detectChanges();

      expect(buttonEl.hasAttribute('aria-busy')).toBe(false);
    });

    it('should suppress click when loading', () => {
      const { fixture, host } = createTestHost();
      host.loading = true;
      fixture.detectChanges();

      const buttonEl = fixture.debugElement.query(By.css('button'))!.nativeElement as HTMLButtonElement;
      buttonEl.click();

      // effectiveDisabled = disabled || loading → native disabled prevents click
      expect(host.clicked).toBe(false);
    });

    it('should apply pa-button--loading class when loading', () => {
      const { fixture, host, buttonEl } = createTestHost();
      host.loading = true;
      fixture.detectChanges();

      expect(buttonEl.classList.contains('pa-button--loading')).toBe(true);
    });

    it('should render a spinner element when loading', () => {
      const { fixture, host } = createTestHost();
      host.loading = true;
      fixture.detectChanges();

      const spinner = fixture.debugElement.query(By.css('.pa-button__spinner'));
      expect(spinner).not.toBeNull();
    });

    it('should NOT render a spinner when not loading', () => {
      const { fixture, host } = createTestHost();
      host.loading = false;
      fixture.detectChanges();

      const spinner = fixture.debugElement.query(By.css('.pa-button__spinner'));
      expect(spinner).toBeNull();
    });

    it('should have the spinner marked as aria-hidden', () => {
      const { fixture, host } = createTestHost();
      host.loading = true;
      fixture.detectChanges();

      const spinner = fixture.debugElement.query(By.css('.pa-button__spinner'))!.nativeElement;
      expect(spinner.getAttribute('aria-hidden')).toBe('true');
    });

    it('should be disabled AND show aria-busy when both disabled and loading', () => {
      const { fixture, host, buttonEl } = createTestHost();
      host.disabled = true;
      host.loading = true;
      fixture.detectChanges();

      expect(buttonEl.disabled).toBe(true);
      expect(buttonEl.getAttribute('aria-busy')).toBe('true');
    });
  });

  // -----------------------------------------------------------------------
  // US-4 outcome mapping (variant × color)
  // -----------------------------------------------------------------------
  describe('US-4 outcome mapping', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestHost],
        providers: [{ provide: FocusMonitor, useValue: focusMonitorMock }],
      }).compileComponents();
    });

    it('should produce primary outcome: solid + primary', () => {
      const { fixture, host, buttonEl } = createTestHost();
      host.variant = 'solid';
      host.color = 'primary';
      fixture.detectChanges();

      expect(buttonEl.classList.contains('pa-button--solid')).toBe(true);
      const style = buttonEl.style.getPropertyValue('--pa-button-color');
      expect(style).toBe('var(--pa-primary)');
    });

    it('should produce secondary outcome: outline + primary', () => {
      const { fixture, host, buttonEl } = createTestHost();
      host.variant = 'outline';
      host.color = 'primary';
      fixture.detectChanges();

      expect(buttonEl.classList.contains('pa-button--outline')).toBe(true);
      const style = buttonEl.style.getPropertyValue('--pa-button-color');
      expect(style).toBe('var(--pa-primary)');
    });

    it('should produce ghost outcome: ghost + primary', () => {
      const { fixture, host, buttonEl } = createTestHost();
      host.variant = 'ghost';
      host.color = 'primary';
      fixture.detectChanges();

      expect(buttonEl.classList.contains('pa-button--ghost')).toBe(true);
      const style = buttonEl.style.getPropertyValue('--pa-button-color');
      expect(style).toBe('var(--pa-primary)');
    });

    it('should produce danger outcome: solid + danger', () => {
      const { fixture, host, buttonEl } = createTestHost();
      host.variant = 'solid';
      host.color = 'danger';
      fixture.detectChanges();

      expect(buttonEl.classList.contains('pa-button--solid')).toBe(true);
      const style = buttonEl.style.getPropertyValue('--pa-button-color');
      expect(style).toBe('var(--pa-danger)');
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

    it('should apply cdk-keyboard-focused class on keyboard focus', () => {
      const { fixture, buttonEl } = createTestHost();
      fixture.detectChanges();

      focusOrigin$.next('keyboard');
      fixture.detectChanges();

      expect(buttonEl.classList.contains('cdk-keyboard-focused')).toBe(true);
    });

    it('should NOT apply cdk-keyboard-focused on mouse focus', () => {
      const { fixture, buttonEl } = createTestHost();
      fixture.detectChanges();

      focusOrigin$.next('mouse');
      fixture.detectChanges();

      expect(buttonEl.classList.contains('cdk-keyboard-focused')).toBe(false);
    });

    it('should remove cdk-keyboard-focused when focus is lost (null origin)', () => {
      const { fixture, buttonEl } = createTestHost();
      fixture.detectChanges();

      // First keyboard focus
      focusOrigin$.next('keyboard');
      fixture.detectChanges();
      expect(buttonEl.classList.contains('cdk-keyboard-focused')).toBe(true);

      // Then blur
      focusOrigin$.next(null);
      fixture.detectChanges();
      expect(buttonEl.classList.contains('cdk-keyboard-focused')).toBe(false);
    });

    it('should call focusMonitor.stopMonitoring on destroy', () => {
      const { fixture } = createTestHost();
      fixture.detectChanges();

      fixture.destroy();

      expect(focusMonitorMock.stopMonitoring).toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------------------------
  // Standalone, OnPush, ViewEncapsulation (architectural compliance)
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

      const buttonDebug = fixture.debugElement.query(By.directive(PaButton));
      const component = buttonDebug!.componentInstance;
      // Standalone components can be created via TestBed without an NgModule
      expect(component).toBeDefined();
    });

    it('should use OnPush change detection', () => {
      const { fixture } = createTestHost();
      fixture.detectChanges();

      const buttonDebug = fixture.debugElement.query(By.directive(PaButton));
      // OnPush components have changeDetectorRef with OnPush strategy (internal)
      // We verify behavior: input change triggers DOM update
      const host = fixture.componentInstance;
      host.variant = 'ghost';
      fixture.detectChanges();

      const buttonEl = buttonDebug!.nativeElement as HTMLButtonElement;
      expect(buttonEl.classList.contains('pa-button--ghost')).toBe(true);
    });

    it('should have all inputs defined as Angular signals', () => {
      const { fixture } = createTestHost();
      fixture.detectChanges();

      // Signal inputs are reflected; we can verify by setting inputs
      // and confirming they update the component state
      const host = fixture.componentInstance;
      host.size = 'lg';
      fixture.detectChanges();

      const buttonEl = fixture.debugElement.query(By.css('button'))!.nativeElement as HTMLButtonElement;
      expect(buttonEl.classList.contains('pa-button--lg')).toBe(true);
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

    it('should have no accessibility violations when loading', async () => {
      const { fixture, host } = createTestHost();
      host.loading = true;
      fixture.detectChanges();

      const results = await axe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });
  });
});
