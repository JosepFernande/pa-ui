import * as publicApi from './public-api';
import type {
  PaColorValue,
  PaColorVariants,
  PaThemeConfig,
  PaThemeOptions,
  ResolvedTheme,
} from './public-api';

describe('public-api — theme engine surface (Issue #46)', () => {
  it('exports providePaTheme as a function', () => {
    expect(typeof publicApi.providePaTheme).toBe('function');
  });

  it('exports PaThemeService as a class', () => {
    expect(typeof publicApi.PaThemeService).toBe('function');
  });

  it('exports DEFAULT_THEME with the 5 default color keys', () => {
    expect(publicApi.DEFAULT_THEME.colors).toEqual({
      primary: expect.any(String),
      success: expect.any(String),
      danger: expect.any(String),
      warning: expect.any(String),
      neutral: expect.any(String),
    });
  });

  it('exports PaThemeConfig, PaThemeOptions, and ResolvedTheme as usable types', () => {
    const config: PaThemeConfig = { colors: { primary: '#000' } };
    const options: PaThemeOptions = { extendDefaults: false };
    const resolved: ResolvedTheme = publicApi.DEFAULT_THEME;
    expect(config.colors['primary']).toBe('#000');
    expect(options.extendDefaults).toBe(false);
    expect(resolved.colors['primary']).toBeDefined();
  });

  it('exports PaColorVariants and PaColorValue as usable types for object-shaped bootstrap colors', () => {
    const variants: PaColorVariants = { base: '#16709e', hover: '#0a4f6b' };
    const config: PaThemeConfig = { colors: { primary: variants, brand: '#00ff00' } };
    const asString: PaColorValue = '#16709e';
    const asVariants: PaColorValue = variants;

    expect((config.colors['primary'] as PaColorVariants).base).toBe('#16709e');
    expect(asString).toBe('#16709e');
    expect((asVariants as PaColorVariants).base).toBe('#16709e');
  });

  it('does NOT export mergeTheme, PA_THEME_TOKEN, or PA_THEME_STATE_KEY (internal surface)', () => {
    expect((publicApi as unknown as Record<string, unknown>)['mergeTheme']).toBeUndefined();
    expect((publicApi as unknown as Record<string, unknown>)['PA_THEME_TOKEN']).toBeUndefined();
    expect((publicApi as unknown as Record<string, unknown>)['PA_THEME_STATE_KEY']).toBeUndefined();
  });

  it('still exports PaUiComponent (existing entry-point export)', () => {
    expect(typeof publicApi.PaUiComponent).toBe('function');
  });
});

describe('public-api — HSL derivation surface (Issue #47, Task 3.2)', () => {
  it('exports every color-math conversion function', () => {
    expect(typeof publicApi.hexToRgb).toBe('function');
    expect(typeof publicApi.rgbToHsl).toBe('function');
    expect(typeof publicApi.hslToRgb).toBe('function');
    expect(typeof publicApi.hexToHsl).toBe('function');
    expect(typeof publicApi.hslToHex).toBe('function');
    expect(typeof publicApi.relativeLuminance).toBe('function');
  });

  it('exports every color-derivation function', () => {
    expect(typeof publicApi.normalizeColorName).toBe('function');
    expect(typeof publicApi.adjustLightness).toBe('function');
    expect(typeof publicApi.getContrastColor).toBe('function');
    expect(typeof publicApi.deriveTokens).toBe('function');
  });

  it('exports usable HSL, RGB, and ThemeCssVariables types end to end', () => {
    const rgb: import('./public-api').RGB = publicApi.hexToRgb('#3366ff');
    const hsl: import('./public-api').HSL = publicApi.rgbToHsl(rgb);
    const vars: import('./public-api').ThemeCssVariables = publicApi.deriveTokens({
      colors: { primary: '#3366ff' },
    });

    expect(hsl.h).toBeGreaterThanOrEqual(0);
    expect(vars['--pa-color-primary']).toBe('#3366ff');
  });
});

describe('public-api — theme runtime surface (Issue #48, Phase 5)', () => {
  it('exports toSemanticCssVariables as a function, importable with zero @angular/* required to call it', () => {
    expect(typeof publicApi.toSemanticCssVariables).toBe('function');
    expect(publicApi.toSemanticCssVariables({ '--pa-color-primary': '#2563eb' })).toEqual({
      '--pa-primary': '#2563eb',
    });
  });
});
