import * as fs from 'node:fs';
import * as path from 'node:path';

/** Reads the actual shipped Foundation stylesheet — the same artifact a real
 * consumer app imports once (`@halolib-ui/core/theme.css`). Resolved from
 * source (not `dist/`) so this test exercises the file this repo edits. */
function readFoundationThemeCss(): string {
  return fs.readFileSync(
    path.resolve(__dirname, '../../../core/src/lib/foundation/theme.css'),
    'utf-8',
  );
}

/** Reads the actual `input-text.component.css` source (not a mock). */
function readInputComponentCss(): string {
  return fs.readFileSync(path.resolve(__dirname, 'input-text.component.css'), 'utf-8');
}

/**
 * jsdom does not perform CSS `var()` resolution/cascade, so a custom property
 * declared as a literal under `:root` (e.g. `--ha-input-radius`) IS readable
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

  it('declares the key --ha-input-* defaults a consumer gets from @halolib-ui/core/theme.css, reachable through the legacy --pa-* alias (#139)', () => {
    const rootStyle = getComputedStyle(document.documentElement);

    const entries: Array<[legacy: string, value: string]> = [
      ['--pa-input-bg', 'var(--neutral-50)'],
      ['--pa-input-error-border', 'var(--ha-error)'],
      ['--pa-input-error-color', 'var(--ha-error)'],
      ['--pa-input-error-icon-color', 'var(--ha-error)'],
      ['--pa-input-radius-sm', '6px'],
      ['--pa-input-radius-md', '4px'],
      ['--pa-input-radius-lg', '8px'],
    ];

    for (const [legacyKey, value] of entries) {
      const haKey = '--ha-' + legacyKey.slice('--pa-'.length);
      expect(rootStyle.getPropertyValue(legacyKey).trim()).toBe(value);
      expect(rootStyle.getPropertyValue(haKey).trim()).toBe(`var(${legacyKey})`);
    }
  });

  it('marks ALL input dimension declarations (padding sm/md/lg + min-height sm/md/lg + radius sm/md/lg) as provisional', () => {
    const css = readFoundationThemeCss();
    for (const key of [
      '--ha-input-padding-sm',
      '--ha-input-padding-md',
      '--ha-input-padding-lg',
      '--ha-input-min-height-sm',
      '--ha-input-min-height-md',
      '--ha-input-min-height-lg',
      '--ha-input-radius-sm',
      '--ha-input-radius-md',
      '--ha-input-radius-lg',
    ]) {
      const lineRegex = new RegExp(`${key}\\s*:[^;]+;[^\\n]*`);
      const match = css.match(lineRegex);
      expect(match).not.toBeNull();
      expect(match![0]).toContain('provisional');
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
