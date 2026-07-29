import * as fs from 'node:fs';
import * as path from 'node:path';
import { Component, ViewEncapsulation } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { Subject } from 'rxjs';
import { providePaTheme } from '@pa-ui/core';
import { PaButton } from './button.component';

/** Reads the actual shipped Foundation stylesheet — the same artifact a real
 * consumer app imports once (`@pa-ui/core/theme.css`, D1). Resolved from
 * source (not `dist/`) so this test exercises the file this repo edits. */
function readFoundationThemeCss(): string {
  return fs.readFileSync(
    path.resolve(__dirname, '../../../core/src/lib/foundation/theme.css'),
    'utf-8',
  );
}

/** Reads the actual `button.component.css` source (not a mock). */
function readButtonComponentCss(): string {
  return fs.readFileSync(path.resolve(__dirname, 'button.component.css'), 'utf-8');
}

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

/**
 * Phase 3 (Task 3.4/3.5): proves the static Foundation stylesheet
 * (`@pa-ui/core/theme.css`) and the runtime Theme Engine compose correctly
 * for Button's dimension tokens, and that `button.component.css` actually
 * wires the per-size `min-width`/`gap` custom properties (not just declares
 * defaults for them in `theme.css`).
 *
 * jsdom does not resolve nested `var()` chains in computed shorthand-ish
 * properties (documented above and re-verified for this batch): a custom
 * property declared as a literal under `:root` (e.g. `--pa-button-min-width-md:
 * 224px`) IS readable via `getComputedStyle`, but a property whose declared
 * value is itself `var(--other)` is returned unresolved (the literal string
 * `"var(--other)"`), and full multi-hop resolution (e.g. `min-width` on an
 * element resolving all the way through two `var()` hops to a pixel value)
 * is a real-browser-only guarantee. Each assertion below is written to be
 * genuinely falsifiable within that real jsdom ceiling — not weakened to a
 * tautology.
 */
describe('Theme runtime integration — Foundation theme.css resolves Button dimension tokens (Phase 3)', () => {
  let focusOrigin$: Subject<FocusOrigin>;
  let focusMonitorMock: { monitor: jest.Mock; stopMonitoring: jest.Mock };
  let styleEl: HTMLStyleElement;

  beforeEach(async () => {
    styleEl = document.createElement('style');
    styleEl.textContent = readFoundationThemeCss();
    document.head.appendChild(styleEl);

    focusOrigin$ = new Subject<FocusOrigin>();
    focusMonitorMock = {
      monitor: jest.fn().mockReturnValue(focusOrigin$.asObservable()),
      stopMonitoring: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ThemeRuntimeTestHost],
      providers: [providePaTheme(), { provide: FocusMonitor, useValue: focusMonitorMock }],
    }).compileComponents();
  });

  afterEach(() => {
    styleEl.remove();
  });

  it('--pa-primary (default theme, no config) resolves to the confirmed brand blue, and the Foundation default for --pa-button-bg references it by name', () => {
    const fixture: ComponentFixture<ThemeRuntimeTestHost> =
      TestBed.createComponent(ThemeRuntimeTestHost);
    fixture.detectChanges();

    // Runtime color layer (Phase 1): providePaTheme() with no config writes
    // DEFAULT_THEME's primary base color as an inline style on documentElement.
    expect(document.documentElement.style.getPropertyValue('--pa-primary')).toBe('#16709e');

    // Static Foundation layer (theme.css, Phase 2): the shipped default for
    // --pa-button-bg is a reference to the runtime color, never a literal.
    const rootStyle = getComputedStyle(document.documentElement);
    expect(rootStyle.getPropertyValue('--pa-button-bg').trim()).toBe('var(--pa-primary)');
  });

  it('theme.css declares the md Button dimensions matching Figma exactly (48/224/4/0-16/10)', () => {
    TestBed.createComponent(ThemeRuntimeTestHost).detectChanges();
    const rootStyle = getComputedStyle(document.documentElement);

    expect(rootStyle.getPropertyValue('--pa-button-min-height-md').trim()).toBe('48px');
    expect(rootStyle.getPropertyValue('--pa-button-min-width-md').trim()).toBe('224px');
    expect(rootStyle.getPropertyValue('--pa-button-radius').trim()).toBe('4px');
    expect(rootStyle.getPropertyValue('--pa-button-padding-md').trim()).toBe('0 16px');
    expect(rootStyle.getPropertyValue('--pa-button-gap-md').trim()).toBe('10px');
  });

  /**
   * `getComputedStyle` on a TestBed-rendered element cannot observe
   * `button.component.css` here: this jsdom/jest-preset-angular combination
   * does not insert Angular component styles into `document.styleSheets` or
   * `document.adoptedStyleSheets` under `TestBed` (re-verified for this
   * batch — 0 style tags/adopted sheets originate from Angular, only the
   * one manually injected above). A `getComputedStyle`-on-rendered-element
   * assertion would therefore always read empty regardless of the CSS
   * source, i.e. it could never move from RED to GREEN for the right
   * reason. The real, falsifiable equivalent is a static read of the actual
   * `button.component.css` source (same fs-based pattern already proven in
   * `foundation-css.spec.ts`), asserting each `.pa-button--{size}` rule
   * wires `min-width`/`gap` to the size-specific custom property.
   */
  it('button.component.css wires min-width and gap for every size to the matching per-size custom property (Task 3.3)', () => {
    const css = readButtonComponentCss();

    const sizeBlock = (size: 'sm' | 'md' | 'lg'): string => {
      const match = css.match(new RegExp(`\\.pa-button--${size}\\s*\\{([^}]*)\\}`));
      expect(match).not.toBeNull();
      return match![1];
    };

    for (const size of ['sm', 'md', 'lg'] as const) {
      const block = sizeBlock(size);
      expect(block).toMatch(new RegExp(`min-width:\\s*var\\(--pa-button-min-width-${size}\\)`));
      expect(block).toMatch(new RegExp(`gap:\\s*var\\(--pa-button-gap-${size}\\)`));
    }

    // The unsized base rule keeps its own unsized gap default — per-size
    // rules win the cascade by source order (design D4), not by being the
    // only declaration.
    const baseBlock = css.match(/\.pa-button\s*\{([^}]*)\}/);
    expect(baseBlock).not.toBeNull();
    expect(baseBlock![1]).toMatch(/gap:\s*var\(--pa-button-gap\)/);
  });
});
