import * as fs from 'node:fs';
import * as path from 'node:path';

/** Reads the actual shipped Foundation stylesheet — the same artifact a real
 * consumer app imports once (`@pa-ui/core/theme.css`). Resolved from
 * source (not `dist/`) so this test exercises the file this repo edits. */
function readFoundationThemeCss(): string {
  return fs.readFileSync(
    path.resolve(__dirname, '../../../core/src/lib/foundation/theme.css'),
    'utf-8',
  );
}

/** Reads the actual `input.component.css` source (not a mock). */
function readInputComponentCss(): string {
  return fs.readFileSync(path.resolve(__dirname, 'input.component.css'), 'utf-8');
}

/**
 * jsdom does not perform CSS `var()` resolution/cascade, so a custom property
 * declared as a literal under `:root` (e.g. `--pa-input-radius`) IS readable
 * via `getComputedStyle`, but a property whose declared value is itself
 * `var(--other)` is returned unresolved (the literal string `"var(--other)"`),
 * and full multi-hop resolution is a real-browser-only guarantee. Each
 * assertion below is written to be genuinely falsifiable within that real
 * jsdom ceiling — not weakened to a tautology (same caveat as Button's
 * Phase 3 integration spec).
 */
describe('Theme runtime integration — Foundation theme.css ships Input defaults', () => {
  let styleEl: HTMLStyleElement;

  beforeEach(() => {
    styleEl = document.createElement('style');
    styleEl.textContent = readFoundationThemeCss();
    document.head.appendChild(styleEl);
  });

  afterEach(() => {
    styleEl.remove();
  });

  it('declares the key --pa-input-* defaults a consumer gets from @pa-ui/core/theme.css', () => {
    const rootStyle = getComputedStyle(document.documentElement);

    expect(rootStyle.getPropertyValue('--pa-input-bg').trim()).toBe('var(--neutral-50)');
    expect(rootStyle.getPropertyValue('--pa-input-error-border').trim()).toBe('var(--pa-danger)');
    expect(rootStyle.getPropertyValue('--pa-input-radius-sm').trim()).toBe('6px');
    expect(rootStyle.getPropertyValue('--pa-input-radius-md').trim()).toBe('4px');
    expect(rootStyle.getPropertyValue('--pa-input-radius-lg').trim()).toBe('8px');
  });

  it('marks ALL input dimension declarations (padding sm/md/lg + min-height sm/md/lg + radius sm/md/lg) as provisional', () => {
    const css = readFoundationThemeCss();
    for (const key of [
      '--pa-input-padding-sm',
      '--pa-input-padding-md',
      '--pa-input-padding-lg',
      '--pa-input-min-height-sm',
      '--pa-input-min-height-md',
      '--pa-input-min-height-lg',
      '--pa-input-radius-sm',
      '--pa-input-radius-md',
      '--pa-input-radius-lg',
    ]) {
      const lineRegex = new RegExp(`${key}\\s*:[^;]+;[^\\n]*`);
      const match = css.match(lineRegex);
      expect(match).not.toBeNull();
      expect(match![0]).toContain('provisional');
    }
  });
});

describe('Theme runtime integration — input.component.css wires per-size tokens', () => {
  it('wires padding, min-height and font-size for every size to the matching per-size custom property', () => {
    const css = readInputComponentCss();

    const sizeBlock = (size: 'sm' | 'md' | 'lg'): string => {
      const match = css.match(new RegExp(`\\.pa-input--${size}\\s*\\{([^}]*)\\}`));
      expect(match).not.toBeNull();
      return match![1];
    };

    for (const size of ['sm', 'md', 'lg'] as const) {
      const block = sizeBlock(size);
      expect(block).toMatch(new RegExp(`padding:\\s*var\\(--pa-input-padding-${size}\\)`));
      expect(block).toMatch(new RegExp(`min-height:\\s*var\\(--pa-input-min-height-${size}\\)`));
      expect(block).toMatch(new RegExp(`font-size:\\s*var\\(--pa-input-font-${size}\\)`));
      expect(block).toMatch(new RegExp(`border-radius:\\s*var\\(--pa-input-radius-${size}\\)`));
    }
  });

  it('wires the focused-state rule to --pa-input-focus-border only (no box-shadow ring)', () => {
    const css = readInputComponentCss();
    const focusBlock = css.match(/\.pa-input--focused\s*\{([^}]*)\}/);
    expect(focusBlock).not.toBeNull();
    expect(focusBlock![1]).toMatch(/border-color:\s*var\(--pa-input-focus-border\)/);
    expect(focusBlock![1]).not.toMatch(/box-shadow/);
  });
});
