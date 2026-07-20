import { readFileSync } from 'fs';
import { join } from 'path';
import { toSemanticCssVariables } from './semantic-tokens';
import type { ThemeCssVariables } from './theme.tokens';

describe('toSemanticCssVariables (Task 1.1 — Semantic-Only DOM Write Adapter)', () => {
  it('remaps a full deriveTokens-shaped single-color entry to the semantic layer with matching values', () => {
    const input: ThemeCssVariables = {
      '--pa-color-primary': '#2563eb',
      '--pa-color-primary-hover': '#3b74ee',
      '--pa-color-primary-active': '#1c52c4',
      '--pa-color-primary-contrast': '#ffffff',
    };

    const result = toSemanticCssVariables(input);

    expect(result).toEqual({
      '--pa-primary': '#2563eb',
      '--pa-primary-hover': '#3b74ee',
      '--pa-primary-active': '#1c52c4',
      '--pa-primary-contrast': '#ffffff',
    });
    expect(Object.keys(result).some((key) => key.startsWith('--pa-color-'))).toBe(false);
  });

  it('remaps two colors (8 keys) independently with no cross-contamination (Task 1.3)', () => {
    const input: ThemeCssVariables = {
      '--pa-color-primary': '#2563eb',
      '--pa-color-primary-hover': '#3b74ee',
      '--pa-color-primary-active': '#1c52c4',
      '--pa-color-primary-contrast': '#ffffff',
      '--pa-color-danger': '#dc2626',
      '--pa-color-danger-hover': '#e14b4b',
      '--pa-color-danger-active': '#b71f1f',
      '--pa-color-danger-contrast': '#ffffff',
    };

    const result = toSemanticCssVariables(input);

    expect(Object.keys(result)).toHaveLength(8);
    expect(result['--pa-primary']).toBe('#2563eb');
    expect(result['--pa-danger']).toBe('#dc2626');
    expect(result['--pa-primary']).not.toBe(result['--pa-danger']);
    expect(Object.keys(result).some((key) => key.startsWith('--pa-color-'))).toBe(false);
  });

  it('remaps a hyphenated color name without mis-splitting on internal hyphens (Task 1.4)', () => {
    const input: ThemeCssVariables = {
      '--pa-color-brand-alt': '#123456',
      '--pa-color-brand-alt-hover': '#234567',
    };

    const result = toSemanticCssVariables(input);

    expect(result).toEqual({
      '--pa-brand-alt': '#123456',
      '--pa-brand-alt-hover': '#234567',
    });
  });

  it('returns an empty object for empty input (Task 1.5)', () => {
    expect(toSemanticCssVariables({})).toEqual({});
  });

  it('passes through a key that does not start with --pa-color- unchanged (Task 1.6)', () => {
    const input: ThemeCssVariables = {
      '--some-other-var': '#000000',
      '--pa-color-primary': '#2563eb',
    };

    const result = toSemanticCssVariables(input);

    expect(result).toEqual({
      '--some-other-var': '#000000',
      '--pa-primary': '#2563eb',
    });
  });
});

describe('No @angular/* imports, no TestBed (Task 1.7 — Requirement: Explicit Non-Requirements)', () => {
  it('has zero @angular/* import statements in semantic-tokens.ts source', () => {
    const source = readFileSync(join(__dirname, 'semantic-tokens.ts'), 'utf-8');
    const angularImportLines = source
      .split('\n')
      .filter((line) => /^\s*import\b/.test(line) && line.includes('@angular/'));

    expect(angularImportLines).toEqual([]);
  });

  it('calls toSemanticCssVariables without TestBed (no Angular test harness required)', () => {
    expect(() => toSemanticCssVariables({ '--pa-color-primary': '#2563eb' })).not.toThrow();
  });
});
