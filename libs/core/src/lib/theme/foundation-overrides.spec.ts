import { readFileSync } from 'fs';
import { join } from 'path';
import { HA_DEFAULT_THEME } from './default-theme';
import { toFoundationCssVariables } from './foundation-overrides';

describe('toFoundationCssVariables', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('returns the full default Foundation var map for undefined input (nothing overridden)', () => {
    const result = toFoundationCssVariables(undefined);
    expect(result['--primary-600']).toBe(HA_DEFAULT_THEME.foundation.palette['primary']![600]);
    expect(result['--spacing-md']).toBe(HA_DEFAULT_THEME.foundation.spacing.md);
    expect(result['--font-family']).toBe(HA_DEFAULT_THEME.foundation.fontFamily);
    expect(Object.keys(result).length).toBeGreaterThan(50);
  });

  it('returns the same full default map for an empty input object', () => {
    expect(toFoundationCssVariables({})).toEqual(toFoundationCssVariables(undefined));
  });

  it('overrides ONE palette step while every other step keeps its default value', () => {
    const result = toFoundationCssVariables({
      palette: { primary: { 600: '#00897b' } },
    });
    expect(result['--primary-600']).toBe('#00897b');
    expect(result['--primary-700']).toBe(HA_DEFAULT_THEME.foundation.palette['primary']![700]);
  });

  it('allows an entirely new palette family, not just existing ones, without dropping existing families', () => {
    const result = toFoundationCssVariables({
      palette: { brand: { 500: '#123456' } },
    });
    expect(result['--brand-500']).toBe('#123456');
    expect(result['--primary-600']).toBe(HA_DEFAULT_THEME.foundation.palette['primary']![600]);
  });

  it('overrides spacing/gap/radius/iconSize steps while every other step keeps its default', () => {
    const result = toFoundationCssVariables({
      spacing: { md: '20px' },
      gap: { sm: '6px' },
      radius: { lg: '18px' },
      iconSize: { xl: '48px' },
    });
    expect(result['--spacing-md']).toBe('20px');
    expect(result['--spacing-sm']).toBe(HA_DEFAULT_THEME.foundation.spacing.sm);
    expect(result['--gap-sm']).toBe('6px');
    expect(result['--radius-lg']).toBe('18px');
    expect(result['--icon-size-xl']).toBe('48px');
  });

  it('overrides ONE font weight while every other weight keeps its default', () => {
    const result = toFoundationCssVariables({ fontWeight: { bold: '800' } });
    expect(result['--font-weight-bold']).toBe('800');
    expect(result['--font-weight-regular']).toBe(HA_DEFAULT_THEME.foundation.fontWeight.regular);
  });

  it('overrides "--font-family" for a fontFamily override', () => {
    const result = toFoundationCssVariables({ fontFamily: "'Inter', sans-serif" });
    expect(result['--font-family']).toBe("'Inter', sans-serif");
    expect(result['--ha-font-family']).toBe('var(--font-family)');
  });

  it('overrides ONE typography role field while the rest of that role and every other role keep their defaults', () => {
    const result = toFoundationCssVariables({
      typography: { h1: { fontSize: '2.5rem' } },
    });
    expect(result['--font-size-h1']).toBe('2.5rem');
    expect(result['--font-weight-h1']).toBe(
      HA_DEFAULT_THEME.foundation.typography['h1'].fontWeight,
    );
    expect(result['--font-size-body']).toBe(
      HA_DEFAULT_THEME.foundation.typography['body'].fontSize,
    );
  });

  it('allows an entirely new typography role, also emitting its --ha-* passthrough alias', () => {
    const result = toFoundationCssVariables({
      typography: { overline: { fontSize: '0.625rem', fontWeight: '600', lineHeight: '1' } },
    });
    expect(result['--font-size-overline']).toBe('0.625rem');
    expect(result['--ha-font-size-overline']).toBe('var(--font-size-overline)');
  });

  it('combines multiple groups in one call, each overriding independently', () => {
    const result = toFoundationCssVariables({
      palette: { primary: { 600: '#00897b' } },
      spacing: { md: '20px' },
    });
    expect(result['--primary-600']).toBe('#00897b');
    expect(result['--spacing-md']).toBe('20px');
  });

  it('always emits the semantic non-color passthrough aliases regardless of override', () => {
    const result = toFoundationCssVariables({ spacing: { md: '20px' } });
    expect(result['--ha-spacing-md']).toBe('var(--spacing-md)');
    expect(result['--ha-spacing-lg']).toBe('var(--spacing-lg)');
  });

  it('is fail-soft: a non-object palette entry is skipped with a warning, never thrown, falling back to defaults', () => {
    const input = { palette: { primary: 'not-an-object' } } as unknown as Parameters<
      typeof toFoundationCssVariables
    >[0];
    let result: ReturnType<typeof toFoundationCssVariables> | undefined;
    expect(() => {
      result = toFoundationCssVariables(input);
    }).not.toThrow();
    expect(result!['--primary-600']).toBe(HA_DEFAULT_THEME.foundation.palette['primary']![600]);
    expect(warnSpy).toHaveBeenCalled();
  });

  it('is fail-soft: a non-string leaf value is silently skipped, falling back to the default', () => {
    const input = { spacing: { md: 42 } } as unknown as Parameters<
      typeof toFoundationCssVariables
    >[0];
    expect(() => toFoundationCssVariables(input)).not.toThrow();
    expect(toFoundationCssVariables(input)['--spacing-md']).toBe(
      HA_DEFAULT_THEME.foundation.spacing.md,
    );
  });

  it('never imports color-derivation.ts (Foundation is never routed through the semantic color-math pipeline)', () => {
    const source = readFileSync(join(__dirname, 'foundation-overrides.ts'), 'utf-8');
    expect(source).not.toMatch(/from ['"].*color-derivation/);
  });

  it('has zero @angular/* import statements', () => {
    const source = readFileSync(join(__dirname, 'foundation-overrides.ts'), 'utf-8');
    const angularImportLines = source
      .split('\n')
      .filter((line) => /^\s*import\b/.test(line) && line.includes('@angular/'));
    expect(angularImportLines).toEqual([]);
  });
});
