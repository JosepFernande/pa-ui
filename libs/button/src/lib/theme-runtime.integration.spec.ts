import { Component, ViewEncapsulation } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { Subject } from 'rxjs';
import { providePaTheme } from '@pa-ui/core';
import { PaButton } from './button.component';

/**
 * End-to-end proof (Issue #48, Phase 6): a custom color registered via
 * `providePaTheme()` resolves through `PaButton`'s existing, UNMODIFIED
 * `colorVar` computed once the eager DOM write (theme-provider.ts Phase 3)
 * fires — zero changes to button.component.ts/.css/.spec.ts.
 *
 * jsdom does not perform CSS `var()` resolution/cascade, so this test
 * proves the DOM-variable contract structurally: the correct value is
 * written to the correct custom property, and Button references that exact
 * property, unmodified. True visual `var()` resolution is a browser
 * guarantee outside Jest's scope.
 */
@Component({
  selector: 'pa-theme-runtime-test-host',
  standalone: true,
  imports: [PaButton],
  encapsulation: ViewEncapsulation.None,
  template: `<button pa-button color="primary">Test</button>`,
})
class ThemeRuntimeTestHost {}

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
});
