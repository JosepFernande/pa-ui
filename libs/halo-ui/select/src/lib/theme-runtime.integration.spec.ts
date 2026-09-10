import * as fs from 'node:fs';
import * as path from 'node:path';
import { TestBed } from '@angular/core/testing';
import { HaThemeService, provideHaTheme } from '@halolib-ui/angular/core';

/** Reads the actual `select.component.css` source (not a mock). */
function readSelectComponentCss(): string {
  return fs.readFileSync(path.resolve(__dirname, 'select.component.css'), 'utf-8');
}

/**
 * Proves the runtime Theme Engine writes Select's Component-layer defaults
 * directly onto `documentElement` as inline styles — no static stylesheet
 * involved anymore. `HaThemeService` is constructed via `TestBed`
 * (`provideHaTheme()` eagerly instantiates it), and assertions read
 * `document.documentElement.style` directly, which now carries the FULL var
 * set (Foundation included), rather than injecting a static Foundation
 * stylesheet as a `<style>` tag and reading it back through
 * `getComputedStyle`.
 */
describe('Theme runtime integration — Theme Engine writes Select defaults', () => {
  let originalDocumentElementStyle: string | null;

  beforeEach(() => {
    originalDocumentElementStyle = document.documentElement.getAttribute('style');
    TestBed.configureTestingModule({ providers: [provideHaTheme()] });
    // provideHaTheme() eagerly instantiates HaThemeService via
    // provideEnvironmentInitializer(), but forcing an explicit inject here
    // makes the eager construction (and its DOM write) unambiguous.
    TestBed.inject(HaThemeService);
  });

  afterEach(() => {
    if (originalDocumentElementStyle === null) {
      document.documentElement.removeAttribute('style');
    } else {
      document.documentElement.setAttribute('style', originalDocumentElementStyle);
    }
  });

  it('writes the key --ha-select-* defaults a consumer gets from provideHaTheme() alone', () => {
    const rootStyle = document.documentElement.style;

    const entries: Array<[key: string, value: string]> = [
      ['--ha-select-bg', 'var(--neutral-50)'],
      ['--ha-select-focus-border', 'var(--ha-primary)'],
      ['--ha-select-focus-ring', '2px solid var(--ha-primary-hover)'],
      ['--ha-select-focus-ring-offset', '5px'],
      ['--ha-select-error-border', 'var(--ha-error)'],
      ['--ha-select-error-color', 'var(--ha-error)'],
      ['--ha-select-radius-sm', '12px'],
      ['--ha-select-radius-md', '16px'],
      ['--ha-select-radius-lg', '24px'],
      ['--ha-select-panel-radius', 'var(--radius-sm)'],
    ];

    for (const [key, value] of entries) {
      expect(rootStyle.getPropertyValue(key)).toBe(value);
    }
  });
});

describe('Theme runtime integration — select.component.css wires per-size tokens', () => {
  it('wires padding, min-height, font-size and border-radius for every size to the matching per-size custom property', () => {
    const css = readSelectComponentCss();

    const sizeBlock = (size: 'sm' | 'md' | 'lg'): string => {
      const match = css.match(
        new RegExp(`\\.ha-select--${size} \\.ha-select__trigger\\s*\\{([^}]*)\\}`),
      );
      expect(match).not.toBeNull();
      return match![1];
    };

    for (const size of ['sm', 'md', 'lg'] as const) {
      const block = sizeBlock(size);
      expect(block).toMatch(new RegExp(`padding:\\s*var\\(--ha-select-padding-${size}\\)`));
      expect(block).toMatch(new RegExp(`min-height:\\s*var\\(--ha-select-min-height-${size}\\)`));
      expect(block).toMatch(new RegExp(`font-size:\\s*var\\(--ha-select-font-${size}\\)`));
      expect(block).toMatch(new RegExp(`border-radius:\\s*var\\(--ha-select-radius-${size}\\)`));
    }
  });

  it('wires the focus-visible rule to --ha-select-focus-border plus a keyboard-only outline ring (no box-shadow ring)', () => {
    const css = readSelectComponentCss();
    const focusBlock = css.match(/\.ha-select__trigger:focus-visible\s*\{([^}]*)\}/);
    expect(focusBlock).not.toBeNull();
    expect(focusBlock![1]).toMatch(/border-color:\s*var\(--ha-select-focus-border\)/);
    expect(focusBlock![1]).toMatch(/outline:\s*var\(--ha-select-focus-ring\)/);
    expect(focusBlock![1]).toMatch(/outline-offset:\s*var\(--ha-select-focus-ring-offset\)/);
    expect(focusBlock![1]).not.toMatch(/box-shadow/);
  });
});
