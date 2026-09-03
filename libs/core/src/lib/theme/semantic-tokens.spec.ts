import { readFileSync } from 'fs';
import { join } from 'path';
import { toSemanticCssVariables } from './semantic-tokens';
import type { ThemeCssVariables } from './theme.tokens';

describe('toSemanticCssVariables (Task 1.1 — Semantic-Only DOM Write Adapter)', () => {
  it('remaps a full deriveTokens-shaped single-color entry to the semantic layer with matching values', () => {
    const input: ThemeCssVariables = {
      '--ha-color-primary': '#2563eb',
      '--ha-color-primary-hover': '#3b74ee',
      '--ha-color-primary-active': '#1c52c4',
      '--ha-color-primary-contrast': '#ffffff',
    };

    const result = toSemanticCssVariables(input);

    expect(result).toEqual({
      '--ha-primary': '#2563eb',
      '--ha-primary-hover': '#3b74ee',
      '--ha-primary-active': '#1c52c4',
      '--ha-primary-contrast': '#ffffff',
    });
    expect(Object.keys(result).some((key) => key.startsWith('--ha-color-'))).toBe(false);
  });

  it('remaps two colors (8 keys) independently with no cross-contamination (Task 1.3)', () => {
    const input: ThemeCssVariables = {
      '--ha-color-primary': '#2563eb',
      '--ha-color-primary-hover': '#3b74ee',
      '--ha-color-primary-active': '#1c52c4',
      '--ha-color-primary-contrast': '#ffffff',
      '--ha-color-danger': '#dc2626',
      '--ha-color-danger-hover': '#e14b4b',
      '--ha-color-danger-active': '#b71f1f',
      '--ha-color-danger-contrast': '#ffffff',
    };

    const result = toSemanticCssVariables(input);

    expect(Object.keys(result)).toHaveLength(8);
    expect(result['--ha-primary']).toBe('#2563eb');
    expect(result['--ha-danger']).toBe('#dc2626');
    expect(result['--ha-primary']).not.toBe(result['--ha-danger']);
    expect(Object.keys(result).some((key) => key.startsWith('--ha-color-'))).toBe(false);
  });

  it('remaps a hyphenated color name without mis-splitting on internal hyphens (Task 1.4)', () => {
    const input: ThemeCssVariables = {
      '--ha-color-brand-alt': '#123456',
      '--ha-color-brand-alt-hover': '#234567',
    };

    const result = toSemanticCssVariables(input);

    expect(result).toEqual({
      '--ha-brand-alt': '#123456',
      '--ha-brand-alt-hover': '#234567',
    });
  });

  it('returns an empty object for empty input (Task 1.5)', () => {
    expect(toSemanticCssVariables({})).toEqual({});
  });

  it('passes through a key that does not start with --ha-color- unchanged (Task 1.6)', () => {
    const input: ThemeCssVariables = {
      '--some-other-var': '#000000',
      '--ha-color-primary': '#2563eb',
    };

    const result = toSemanticCssVariables(input);

    expect(result).toEqual({
      '--some-other-var': '#000000',
      '--ha-primary': '#2563eb',
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
    expect(() => toSemanticCssVariables({ '--ha-color-primary': '#2563eb' })).not.toThrow();
  });
});
