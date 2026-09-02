import * as fs from 'node:fs';
import * as path from 'node:path';

/** Reads the actual shipped Foundation stylesheet — the same artifact a real
 * consumer app imports once (`@halo-ui/core/theme.css`). Resolved from
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
 * declared as a literal under `:root` (e.g. `--ha-select-radius-md`) IS
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

  it('declares the key --ha-select-* defaults a consumer gets from @halo-ui/core/theme.css, reachable through the legacy --pa-* alias (#139)', () => {
    const rootStyle = getComputedStyle(document.documentElement);

    const entries: Array<[legacy: string, value: string]> = [
      ['--pa-select-bg', 'var(--neutral-50)'],
      ['--pa-select-focus-border', 'var(--ha-primary)'],
      ['--pa-select-focus-ring', '2px solid var(--ha-primary-hover)'],
      ['--pa-select-focus-ring-offset', '5px'],
      ['--pa-select-error-border', 'var(--ha-error)'],
      ['--pa-select-error-color', 'var(--ha-error)'],
      ['--pa-select-radius-sm', '6px'],
      ['--pa-select-radius-md', '4px'],
      ['--pa-select-radius-lg', '8px'],
      ['--pa-select-panel-radius', 'var(--radius-sm)'],
    ];

    for (const [legacyKey, value] of entries) {
      const haKey = '--ha-' + legacyKey.slice('--pa-'.length);
      expect(rootStyle.getPropertyValue(legacyKey).trim()).toBe(value);
      expect(rootStyle.getPropertyValue(haKey).trim()).toBe(`var(${legacyKey})`);
    }
  });

  it('marks ALL select dimension declarations (padding sm/md/lg + min-height sm/md/lg + radius sm/md/lg) as provisional', () => {
    const css = readFoundationThemeCss();
    for (const key of [
      '--ha-select-padding-sm',
      '--ha-select-padding-md',
      '--ha-select-padding-lg',
      '--ha-select-min-height-sm',
      '--ha-select-min-height-md',
      '--ha-select-min-height-lg',
      '--ha-select-radius-sm',
      '--ha-select-radius-md',
      '--ha-select-radius-lg',
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
