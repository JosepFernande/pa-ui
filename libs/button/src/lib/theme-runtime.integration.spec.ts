import { Component, ViewEncapsulation } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { Subject } from 'rxjs';
import { providePaTheme } from '@pa-ui/core';
import { PaButton } from './button.component';

/**
 * End-to-end proof (Issue #48, Phase 6 → Issue #59): a custom color
 * registered via `providePaTheme()` resolves through `PaButton`'s `colorVar`
 * computed once the eager DOM write (theme-provider.ts Phase 3) fires.
 *
 * Issue #48 originally shipped this as "zero changes to button.component.ts"
 * — that read-only boundary is intentionally lifted by #59: `PaButton` now
 * also consumes the theme engine's `-hover`/`-active`/`-contrast` derived
 * variants via 4 additive host `[style.--pa-button-*]` bindings
 * (`hoverVar`/`activeVar`/`contrastVar`), so its solid background, hover,
 * active, and contrast-text states actually render from theme tokens. The
 * runtime-mutation guarantee this spec exists to prove — a registered color
 * reactively reaching Button through the DOM-variable contract — is
 * unaffected by that additive wiring.
 *
 * jsdom does not perform CSS `var()` resolution/cascade, so this test
 * proves the DOM-variable contract structurally: the correct value is
 * written to the correct custom property, and Button references that exact
 * property. True visual `var()` resolution is a browser guarantee outside
 * Jest's scope.
 */
@Component({
  selector: 'pa-theme-runtime-test-host',
  standalone: true,
  imports: [PaButton],
  encapsulation: ViewEncapsulation.None,
  template: `<button pa-button color="primary">Test</button>`,
})
class ThemeRuntimeTestHost {}

/**
 * Second host registered with a custom "secondary" color (Issue #59
 * triangulation) — proves the `--pa-{name}-*` mapping is generic and not
 * hardcoded to "primary".
 */
@Component({
  selector: 'pa-theme-runtime-secondary-test-host',
  standalone: true,
  imports: [PaButton],
  encapsulation: ViewEncapsulation.None,
  template: `<button pa-button color="secondary">Test</button>`,
})
class ThemeRuntimeSecondaryTestHost {}

describe('Theme runtime integration — Button resolves a custom color with zero Button changes', () => {
  let focusOrigin$: Subject<FocusOrigin>;
  let focusMonitorMock: { monitor: jest.Mock; stopMonitoring: jest.Mock };

  beforeEach(async () => {
    focusOrigin$ = new Subject<FocusOrigin>();
    focusMonitorMock = {
      monitor: jest.fn().mockReturnValue(focusOrigin$.asObservable()),
      stopMonitoring: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ThemeRuntimeTestHost],
      providers: [
        providePaTheme({ colors: { primary: '#111111' } }),
        { provide: FocusMonitor, useValue: focusMonitorMock },
      ],
    }).compileComponents();
  });

  it('writes --pa-primary to the DOM at bootstrap and Button references it unmodified', () => {
    const fixture: ComponentFixture<ThemeRuntimeTestHost> =
      TestBed.createComponent(ThemeRuntimeTestHost);
    fixture.detectChanges();

    expect(document.documentElement.style.getPropertyValue('--pa-primary')).toBe('#111111');

    const buttonEl = fixture.debugElement.query(By.css('button[pa-button]'))
      .nativeElement as HTMLButtonElement;
    expect(buttonEl.style.getPropertyValue('--pa-button-color')).toBe('var(--pa-primary)');
  });

  it('resolves the 4 derived variants (bg/hover/active/solid-color) for the registered primary color', () => {
    const fixture: ComponentFixture<ThemeRuntimeTestHost> =
      TestBed.createComponent(ThemeRuntimeTestHost);
    fixture.detectChanges();

    const buttonEl = fixture.debugElement.query(By.css('button[pa-button]'))
      .nativeElement as HTMLButtonElement;

    expect(buttonEl.style.getPropertyValue('--pa-button-bg')).toBe('var(--pa-primary)');
    expect(buttonEl.style.getPropertyValue('--pa-button-hover-bg')).toBe('var(--pa-primary-hover)');
    expect(buttonEl.style.getPropertyValue('--pa-button-active-bg')).toBe(
      'var(--pa-primary-active)',
    );
    expect(buttonEl.style.getPropertyValue('--pa-button-solid-color')).toBe(
      'var(--pa-primary-contrast)',
    );
  });
});

describe('Theme runtime integration — Button resolves a custom "secondary" color (triangulation)', () => {
  let focusOrigin$: Subject<FocusOrigin>;
  let focusMonitorMock: { monitor: jest.Mock; stopMonitoring: jest.Mock };

  beforeEach(async () => {
    focusOrigin$ = new Subject<FocusOrigin>();
    focusMonitorMock = {
      monitor: jest.fn().mockReturnValue(focusOrigin$.asObservable()),
      stopMonitoring: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ThemeRuntimeSecondaryTestHost],
      providers: [
        providePaTheme({ colors: { secondary: '#222222' } }),
        { provide: FocusMonitor, useValue: focusMonitorMock },
      ],
    }).compileComponents();
  });

  it('resolves the 4 derived variants against --pa-secondary-* for a registered secondary color', () => {
    const fixture: ComponentFixture<ThemeRuntimeSecondaryTestHost> = TestBed.createComponent(
      ThemeRuntimeSecondaryTestHost,
    );
    fixture.detectChanges();

    expect(document.documentElement.style.getPropertyValue('--pa-secondary')).toBe('#222222');

    const buttonEl = fixture.debugElement.query(By.css('button[pa-button]'))
      .nativeElement as HTMLButtonElement;

    expect(buttonEl.style.getPropertyValue('--pa-button-bg')).toBe('var(--pa-secondary)');
    expect(buttonEl.style.getPropertyValue('--pa-button-hover-bg')).toBe(
      'var(--pa-secondary-hover)',
    );
    expect(buttonEl.style.getPropertyValue('--pa-button-active-bg')).toBe(
      'var(--pa-secondary-active)',
    );
    expect(buttonEl.style.getPropertyValue('--pa-button-solid-color')).toBe(
      'var(--pa-secondary-contrast)',
    );
  });
});
