import * as fs from 'node:fs';
import * as path from 'node:path';
import { TestBed } from '@angular/core/testing';
import { HaThemeService, provideHaTheme } from '@halolib-ui/core';

/** Reads the actual `input-text.component.css` source (not a mock). */
function readInputComponentCss(): string {
  return fs.readFileSync(path.resolve(__dirname, 'input-text.component.css'), 'utf-8');
}

/**
 * Proves the runtime Theme Engine writes Input's Component-layer defaults
 * directly onto `documentElement` as inline styles — no static stylesheet
 * involved anymore. `HaThemeService` is constructed via `TestBed`
 * (`provideHaTheme()` eagerly instantiates it), and assertions read
 * `document.documentElement.style` directly, which now carries the FULL var
 * set (Foundation included), rather than injecting a static Foundation
 * stylesheet as a `<style>` tag and reading it back through
 * `getComputedStyle`.
 */
describe('Theme runtime integration — Theme Engine writes Input defaults', () => {
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

  it('writes the key --ha-input-* defaults a consumer gets from provideHaTheme() alone', () => {
    const rootStyle = document.documentElement.style;

    const entries: Array<[key: string, value: string]> = [
      ['--ha-input-bg', 'var(--neutral-50)'],
      ['--ha-input-error-border', 'var(--ha-error)'],
      ['--ha-input-error-color', 'var(--ha-error)'],
      ['--ha-input-error-icon-color', 'var(--ha-error)'],
      ['--ha-input-radius-sm', '12px'],
      ['--ha-input-radius-md', '16px'],
      ['--ha-input-radius-lg', '24px'],
    ];

    for (const [key, value] of entries) {
      expect(rootStyle.getPropertyValue(key)).toBe(value);
    }
  });
});

describe('Theme runtime integration — input-text.component.css wires per-size tokens', () => {
  it('wires padding, min-height and font-size for every size to the matching per-size custom property', () => {
    const css = readInputComponentCss();

    const sizeBlock = (size: 'sm' | 'md' | 'lg'): string => {
      const match = css.match(new RegExp(`\\.ha-input-text--${size}\\s*\\{([^}]*)\\}`));
      expect(match).not.toBeNull();
      return match![1];
    };

    for (const size of ['sm', 'md', 'lg'] as const) {
      const block = sizeBlock(size);
      expect(block).toMatch(new RegExp(`padding:\\s*var\\(--ha-input-padding-${size}\\)`));
      expect(block).toMatch(new RegExp(`min-height:\\s*var\\(--ha-input-min-height-${size}\\)`));
      expect(block).toMatch(new RegExp(`font-size:\\s*var\\(--ha-input-font-${size}\\)`));
      expect(block).toMatch(new RegExp(`border-radius:\\s*var\\(--ha-input-radius-${size}\\)`));
    }
  });

  it('wires the focused-state rule to --ha-input-focus-border only (no box-shadow ring)', () => {
    const css = readInputComponentCss();
    const focusBlock = css.match(/\.ha-input-text--focused\s*\{([^}]*)\}/);
    expect(focusBlock).not.toBeNull();
    expect(focusBlock![1]).toMatch(/border-color:\s*var\(--ha-input-focus-border\)/);
    expect(focusBlock![1]).not.toMatch(/box-shadow/);
  });
});
