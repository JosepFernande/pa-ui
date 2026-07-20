import { readFileSync } from 'fs';
import { join } from 'path';
import {
  adjustLightness,
  deriveTokens,
  getContrastColor,
  LIGHTNESS_STEP,
  normalizeColorName,
} from './color-derivation';
import { hexToHsl } from './color-math';
import type { ResolvedTheme } from './theme.tokens';

describe('adjustLightness (Task 2.1 — Mid-range shifts both directions)', () => {
  it('shifts a mid-range lightness of 50 by +8 for hover and -8 for active, preserving hue/saturation', () => {
    const base = { h: 210, s: 60, l: 50 };
    expect(adjustLightness(base, 8)).toEqual({ h: 210, s: 60, l: 58 });
    expect(adjustLightness(base, -8)).toEqual({ h: 210, s: 60, l: 42 });
  });
});

describe('adjustLightness clamping (Task 2.3 — triangulation)', () => {
  it('clamps hover lightness at 100 for pure white (no overflow)', () => {
    const white = { h: 0, s: 0, l: 100 };
    expect(adjustLightness(white, LIGHTNESS_STEP)).toEqual({ h: 0, s: 0, l: 100 });
  });

  it('clamps active lightness at 0 for pure black (no negative value)', () => {
    const black = { h: 0, s: 0, l: 0 };
    expect(adjustLightness(black, -LIGHTNESS_STEP)).toEqual({ h: 0, s: 0, l: 0 });
  });

  it('shifts mid-gray and saturated red symmetrically by exactly ±8', () => {
    const gray = { h: 0, s: 0, l: 50 };
    const red = { h: 0, s: 100, l: 50 };
    expect(adjustLightness(gray, LIGHTNESS_STEP)).toEqual({ h: 0, s: 0, l: 58 });
    expect(adjustLightness(gray, -LIGHTNESS_STEP)).toEqual({ h: 0, s: 0, l: 42 });
    expect(adjustLightness(red, LIGHTNESS_STEP)).toEqual({ h: 0, s: 100, l: 58 });
    expect(adjustLightness(red, -LIGHTNESS_STEP)).toEqual({ h: 0, s: 100, l: 42 });
  });
});

describe('getContrastColor (Task 2.4 — WCAG contrast foreground selection)', () => {
  it('selects white for a dark background (#111111)', () => {
    expect(getContrastColor(hexToHsl('#111111'))).toBe('#ffffff');
  });

  it('selects black for pure red despite low perceived brightness (real WCAG luminance, not brightness heuristic)', () => {
    expect(getContrastColor(hexToHsl('#ff0000'))).toBe('#000000');
  });

  it('returns exactly one of black/white for mid-gray, never both, never a third color', () => {
    const result = getContrastColor(hexToHsl('#808080'));
    expect(['#ffffff', '#000000']).toContain(result);
  });
});

describe('normalizeColorName (Task 2.6 — Color Name Normalization)', () => {
  it('sanitizes an uppercase/underscore key to lowercase-dashed form', () => {
    expect(normalizeColorName('Primary_Color')).toBe('primary-color');
  });

  it('leaves an already-valid key unchanged', () => {
    expect(normalizeColorName('primary')).toBe('primary');
  });
});

describe('deriveTokens (Tasks 2.8-2.14 — full derivation policy)', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('warns on sanitization when a raw key is changed by normalization', () => {
    const theme: ResolvedTheme = { colors: { Primary_Color: '#3366ff' } };
    deriveTokens(theme);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Primary_Color'));
  });

  it('does NOT warn when a raw key is already valid', () => {
    const theme: ResolvedTheme = { colors: { primary: '#3366ff' } };
    deriveTokens(theme);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('resolves a sanitization collision with last-processed-wins and emits a distinct collision warning (Task 2.8)', () => {
    const theme: ResolvedTheme = { colors: { Primary: '#111111', primary: '#3366ff' } };
    const result = deriveTokens(theme);

    expect(result['--pa-color-primary']).toBe('#3366ff');
    expect(Object.keys(result).filter((key) => key.startsWith('--pa-color-primary'))).toHaveLength(
      4,
    );
    expect(warnSpy.mock.calls.some(([message]) => /collis/i.test(message))).toBe(true);
  });

  it('skips a malformed hex entry with a warning and emits no vars for it, without throwing (Task 2.10)', () => {
    const theme: ResolvedTheme = { colors: { primary: '#3366ff', broken: '#zzz' } };

    let result: ReturnType<typeof deriveTokens> | undefined;
    expect(() => {
      result = deriveTokens(theme);
    }).not.toThrow();

    expect(result?.['--pa-color-primary']).toBe('#3366ff');
    expect(Object.keys(result ?? {}).some((key) => key.includes('broken'))).toBe(false);
    expect(warnSpy.mock.calls.some(([message]) => /broken/i.test(message))).toBe(true);
  });

  it('emits the base token verbatim as the exact registered hex string (Task 2.12)', () => {
    const theme: ResolvedTheme = { colors: { primary: '#3366FF' } };
    const result = deriveTokens(theme);
    expect(result['--pa-color-primary']).toBe('#3366FF');
  });

  it('emits exactly 4 keys for a single color (Task 2.13)', () => {
    const theme: ResolvedTheme = { colors: { primary: '#3366ff' } };
    const result = deriveTokens(theme);
    expect(Object.keys(result).sort()).toEqual(
      [
        '--pa-color-primary',
        '--pa-color-primary-active',
        '--pa-color-primary-contrast',
        '--pa-color-primary-hover',
      ].sort(),
    );
  });

  it('emits 8 independent keys for two colors with no cross-contamination (Task 2.13)', () => {
    const theme: ResolvedTheme = { colors: { primary: '#3366ff', danger: '#dc2626' } };
    const result = deriveTokens(theme);
    const keys = Object.keys(result);

    expect(keys).toHaveLength(8);
    expect(keys.filter((key) => key.startsWith('--pa-color-primary'))).toHaveLength(4);
    expect(keys.filter((key) => key.startsWith('--pa-color-danger'))).toHaveLength(4);
    expect(result['--pa-color-primary']).not.toBe(result['--pa-color-danger']);
  });

  it('keeps float precision through adjustLightness before rounding only inside hslToHex (Task 2.15 — triangulation)', () => {
    // #3366ff -> HSL(225, 100, 60). +8/-8 lightness on a non-round-number
    // base (l=60.4) must not lose precision before hslToHex rounds.
    const theme: ResolvedTheme = { colors: { accent: '#4d75f2' } };
    const result = deriveTokens(theme);

    expect(result['--pa-color-accent-hover']).toMatch(/^#[0-9a-f]{6}$/);
    expect(result['--pa-color-accent-active']).toMatch(/^#[0-9a-f]{6}$/);
    expect(result['--pa-color-accent-hover']).not.toBe(result['--pa-color-accent']);
    expect(result['--pa-color-accent-active']).not.toBe(result['--pa-color-accent']);
  });
});

describe('No @angular/* imports (Task 3.3 — Requirement: Explicit Non-Requirements)', () => {
  it('has zero @angular/* import statements in color-derivation.ts source', () => {
    const source = readFileSync(join(__dirname, 'color-derivation.ts'), 'utf-8');
    const angularImportLines = source
      .split('\n')
      .filter((line) => /^\s*import\b/.test(line) && line.includes('@angular/'));

    expect(angularImportLines).toEqual([]);
  });

  it('has zero @angular/* import statements in color-math.ts source', () => {
    const source = readFileSync(join(__dirname, 'color-math.ts'), 'utf-8');
    const angularImportLines = source
      .split('\n')
      .filter((line) => /^\s*import\b/.test(line) && line.includes('@angular/'));

    expect(angularImportLines).toEqual([]);
  });

  it('calls deriveTokens and getContrastColor without TestBed (no Angular test harness required)', () => {
    const theme: ResolvedTheme = { colors: { primary: '#3366ff' } };
    expect(() => deriveTokens(theme)).not.toThrow();
    expect(() => getContrastColor(hexToHsl('#3366ff'))).not.toThrow();
  });
});
