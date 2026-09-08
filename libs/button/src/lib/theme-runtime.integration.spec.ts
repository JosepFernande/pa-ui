import * as fs from 'node:fs';
import * as path from 'node:path';
import { Component, ViewEncapsulation } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { Subject } from 'rxjs';
import { provideHaTheme } from '@halolib-ui/core';
import { HaButton } from './button.component';

/** Reads the actual shipped Foundation stylesheet — the same artifact a real
 * consumer app imports once (`@halolib-ui/core/theme.css`, D1). Resolved from
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
 * registered via `provideHaTheme()` resolves through `HaButton`'s `colorVar`
 * computed once the eager DOM write (theme-provider.ts Phase 3) fires.
 *
 * Issue #48 originally shipped this as "zero changes to button.component.ts"
 * — that read-only boundary is intentionally lifted by #59: `HaButton` now
 * also consumes the theme engine's `-hover`/`-active`/`-contrast` derived
 * variants via 4 additive host `[style.--ha-button-*]` bindings
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
  selector: 'ha-theme-runtime-test-host',
  standalone: true,
  imports: [HaButton],
  encapsulation: ViewEncapsulation.None,
  template: `<button ha-button color="primary">Test</button>`,
})
class ThemeRuntimeTestHost {}

/**
 * Second host registered with a custom "accent" color (Issue #59
 * triangulation) — proves the `--ha-{name}-*` mapping is generic and not
 * hardcoded to "primary".
 */
@Component({
  selector: 'ha-theme-runtime-accent-test-host',
  standalone: true,
  imports: [HaButton],
  encapsulation: ViewEncapsulation.None,
  template: `<button ha-button color="accent">Test</button>`,
})
class ThemeRuntimeAccentTestHost {}

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
        provideHaTheme({ colors: { primary: '#111111' } }),
        { provide: FocusMonitor, useValue: focusMonitorMock },
      ],
    }).compileComponents();
  });

  it('writes --ha-primary to the DOM at bootstrap and Button references it unmodified', () => {
    const fixture: ComponentFixture<ThemeRuntimeTestHost> =
      TestBed.createComponent(ThemeRuntimeTestHost);
    fixture.detectChanges();

    expect(document.documentElement.style.getPropertyValue('--ha-primary')).toBe('#111111');

    const buttonEl = fixture.debugElement.query(By.css('button[ha-button]'))
      .nativeElement as HTMLButtonElement;
    expect(buttonEl.style.getPropertyValue('--ha-button-color')).toBe('var(--ha-primary)');
  });

  it('resolves the 4 derived variants (bg/hover/active/solid-color) for the registered primary color', () => {
    const fixture: ComponentFixture<ThemeRuntimeTestHost> =
      TestBed.createComponent(ThemeRuntimeTestHost);
    fixture.detectChanges();

    const buttonEl = fixture.debugElement.query(By.css('button[ha-button]'))
      .nativeElement as HTMLButtonElement;

    expect(buttonEl.style.getPropertyValue('--ha-button-bg')).toBe('var(--ha-primary)');
    expect(buttonEl.style.getPropertyValue('--ha-button-hover-bg')).toBe('var(--ha-primary-hover)');
    expect(buttonEl.style.getPropertyValue('--ha-button-active-bg')).toBe(
      'var(--ha-primary-active)',
    );
    expect(buttonEl.style.getPropertyValue('--ha-button-solid-color')).toBe(
      'var(--ha-primary-contrast)',
    );
  });
});

describe('Theme runtime integration — Button resolves a custom "accent" color (triangulation)', () => {
  let focusOrigin$: Subject<FocusOrigin>;
  let focusMonitorMock: { monitor: jest.Mock; stopMonitoring: jest.Mock };

  beforeEach(async () => {
    focusOrigin$ = new Subject<FocusOrigin>();
    focusMonitorMock = {
      monitor: jest.fn().mockReturnValue(focusOrigin$.asObservable()),
      stopMonitoring: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ThemeRuntimeAccentTestHost],
      providers: [
        provideHaTheme({ colors: { accent: '#222222' } }),
        { provide: FocusMonitor, useValue: focusMonitorMock },
      ],
    }).compileComponents();
  });

  it('resolves the 4 derived variants against --ha-accent-* for a registered accent color', () => {
    const fixture: ComponentFixture<ThemeRuntimeAccentTestHost> = TestBed.createComponent(
      ThemeRuntimeAccentTestHost,
    );
    fixture.detectChanges();

    expect(document.documentElement.style.getPropertyValue('--ha-accent')).toBe('#222222');

    const buttonEl = fixture.debugElement.query(By.css('button[ha-button]'))
      .nativeElement as HTMLButtonElement;

    expect(buttonEl.style.getPropertyValue('--ha-button-bg')).toBe('var(--ha-accent)');
    expect(buttonEl.style.getPropertyValue('--ha-button-hover-bg')).toBe('var(--ha-accent-hover)');
    expect(buttonEl.style.getPropertyValue('--ha-button-active-bg')).toBe(
      'var(--ha-accent-active)',
    );
    expect(buttonEl.style.getPropertyValue('--ha-button-solid-color')).toBe(
      'var(--ha-accent-contrast)',
    );
  });
});

/**
 * Phase 3 (Task 3.4/3.5): proves the static Foundation stylesheet
 * (`@halolib-ui/core/theme.css`) and the runtime Theme Engine compose correctly
 * for Button's dimension tokens, and that `button.component.css` actually
 * wires the per-size `min-width`/`gap` custom properties (not just declares
 * defaults for them in `theme.css`).
 *
 * jsdom does not resolve nested `var()` chains in computed shorthand-ish
 * properties (documented above and re-verified for this batch): a custom
 * property declared as a literal under `:root` (e.g. `--ha-button-min-width-md:
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
      providers: [provideHaTheme(), { provide: FocusMonitor, useValue: focusMonitorMock }],
    }).compileComponents();
  });

  afterEach(() => {
    styleEl.remove();
  });

  it('--ha-primary (default theme, no config) resolves directly to its real value, and the Foundation default for --ha-button-bg references it', () => {
    const fixture: ComponentFixture<ThemeRuntimeTestHost> =
      TestBed.createComponent(ThemeRuntimeTestHost);
    fixture.detectChanges();

    // Runtime color layer (Phase 1): provideHaTheme() with no config writes
    // DEFAULT_THEME's primary base color as an inline style on documentElement.
    expect(document.documentElement.style.getPropertyValue('--ha-primary')).toBe('#16709e');

    // Static Foundation layer (theme.css, Phase 2): the shipped default for
    // --ha-button-bg references --ha-primary directly.
    const rootStyle = getComputedStyle(document.documentElement);
    expect(rootStyle.getPropertyValue('--ha-button-bg').trim()).toBe('var(--ha-primary)');
  });

  it('theme.css declares the md Button dimensions matching Figma exactly (48/224/4/0-16/10)', () => {
    TestBed.createComponent(ThemeRuntimeTestHost).detectChanges();
    const rootStyle = getComputedStyle(document.documentElement);

    const dimensions: Array<[key: string, value: string]> = [
      ['--ha-button-min-height-md', '48px'],
      ['--ha-button-min-width-md', '224px'],
      ['--ha-button-radius', '4px'],
      ['--ha-button-padding-md', '0 16px'],
      ['--ha-button-gap-md', '10px'],
    ];

    for (const [key, value] of dimensions) {
      expect(rootStyle.getPropertyValue(key).trim()).toBe(value);
    }
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
   * `foundation-css.spec.ts`), asserting each `.ha-button--{size}` rule
   * wires `min-width`/`gap` to the size-specific custom property.
   */
  it('button.component.css wires min-width and gap for every size to the matching per-size custom property (Task 3.3)', () => {
    const css = readButtonComponentCss();

    const sizeBlock = (size: 'sm' | 'md' | 'lg'): string => {
      const match = css.match(new RegExp(`\\.ha-button--${size}\\s*\\{([^}]*)\\}`));
      expect(match).not.toBeNull();
      return match![1];
    };

    for (const size of ['sm', 'md', 'lg'] as const) {
      const block = sizeBlock(size);
      expect(block).toMatch(new RegExp(`min-width:\\s*var\\(--ha-button-min-width-${size}\\)`));
      expect(block).toMatch(new RegExp(`gap:\\s*var\\(--ha-button-gap-${size}\\)`));
    }

    // The unsized base rule keeps its own unsized gap default — per-size
    // rules win the cascade by source order (design D4), not by being the
    // only declaration.
    const baseBlock = css.match(/\.ha-button\s*\{([^}]*)\}/);
    expect(baseBlock).not.toBeNull();
    expect(baseBlock![1]).toMatch(/gap:\s*var\(--ha-button-gap\)/);
  });
});
