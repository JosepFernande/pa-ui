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

/** Reads the actual `select.component.css` source (not a mock). */
function readSelectComponentCss(): string {
  return fs.readFileSync(path.resolve(__dirname, 'select.component.css'), 'utf-8');
}

/**
 * jsdom does not perform CSS `var()` resolution/cascade, so a custom property
 * declared as a literal under `:root` (e.g. `--pa-select-radius-md`) IS
 * readable via `getComputedStyle`, but a property whose declared value is
 * itself `var(--other)` is returned unresolved (the literal string
 * `"var(--other)"`), and full multi-hop resolution is a real-browser-only
 * guarantee. Each assertion below is written to be genuinely falsifiable
 * within that real jsdom ceiling — not weakened to a tautology (same caveat
 * as Input's and Button's equivalent integration specs).
 */
describe('Theme runtime integration — Foundation theme.css ships Select defaults', () => {
  let styleEl: HTMLStyleElement;

  beforeEach(() => {
    styleEl = document.createElement('style');
    styleEl.textContent = readFoundationThemeCss();
    document.head.appendChild(styleEl);
  });

  afterEach(() => {
    styleEl.remove();
  });

  it('declares the key --pa-select-* defaults a consumer gets from @pa-ui/core/theme.css', () => {
    const rootStyle = getComputedStyle(document.documentElement);

    expect(rootStyle.getPropertyValue('--pa-select-bg').trim()).toBe('var(--neutral-50)');
    expect(rootStyle.getPropertyValue('--pa-select-focus-border').trim()).toBe('var(--pa-primary)');
    expect(rootStyle.getPropertyValue('--pa-select-error-border').trim()).toBe('var(--pa-error)');
    expect(rootStyle.getPropertyValue('--pa-select-error-color').trim()).toBe('var(--pa-error)');
    expect(rootStyle.getPropertyValue('--pa-select-radius-sm').trim()).toBe('6px');
    expect(rootStyle.getPropertyValue('--pa-select-radius-md').trim()).toBe('4px');
    expect(rootStyle.getPropertyValue('--pa-select-radius-lg').trim()).toBe('8px');
    expect(rootStyle.getPropertyValue('--pa-select-panel-radius').trim()).toBe('var(--radius-sm)');
  });

  it('marks ALL select dimension declarations (padding sm/md/lg + min-height sm/md/lg + radius sm/md/lg) as provisional', () => {
    const css = readFoundationThemeCss();
    for (const key of [
      '--pa-select-padding-sm',
      '--pa-select-padding-md',
      '--pa-select-padding-lg',
      '--pa-select-min-height-sm',
      '--pa-select-min-height-md',
      '--pa-select-min-height-lg',
      '--pa-select-radius-sm',
      '--pa-select-radius-md',
      '--pa-select-radius-lg',
    ]) {
      const lineRegex = new RegExp(`${key}\\s*:[^;]+;[^\\n]*`);
      const match = css.match(lineRegex);
      expect(match).not.toBeNull();
      expect(match![0]).toContain('provisional');
    }
  });
});

describe('Theme runtime integration — select.component.css wires per-size tokens', () => {
  it('wires padding, min-height, font-size and border-radius for every size to the matching per-size custom property', () => {
    const css = readSelectComponentCss();

    const sizeBlock = (size: 'sm' | 'md' | 'lg'): string => {
      const match = css.match(
        new RegExp(`\\.pa-select--${size} \\.pa-select__trigger\\s*\\{([^}]*)\\}`),
      );
      expect(match).not.toBeNull();
      return match![1];
    };

    for (const size of ['sm', 'md', 'lg'] as const) {
      const block = sizeBlock(size);
      expect(block).toMatch(new RegExp(`padding:\\s*var\\(--pa-select-padding-${size}\\)`));
      expect(block).toMatch(new RegExp(`min-height:\\s*var\\(--pa-select-min-height-${size}\\)`));
      expect(block).toMatch(new RegExp(`font-size:\\s*var\\(--pa-select-font-${size}\\)`));
      expect(block).toMatch(new RegExp(`border-radius:\\s*var\\(--pa-select-radius-${size}\\)`));
    }
  });

  it('wires the focus-visible rule to --pa-select-focus-border only (no box-shadow ring)', () => {
    const css = readSelectComponentCss();
    const focusBlock = css.match(/\.pa-select__trigger:focus-visible\s*\{([^}]*)\}/);
    expect(focusBlock).not.toBeNull();
    expect(focusBlock![1]).toMatch(/border-color:\s*var\(--pa-select-focus-border\)/);
    expect(focusBlock![1]).not.toMatch(/box-shadow/);
  });
});
