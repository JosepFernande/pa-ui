import * as publicApi from './public-api';
import type {
  HaColorValue,
  HaColorVariants,
  HaThemeConfig,
  HaThemeOptions,
  ResolvedTheme,
} from './public-api';

describe('public-api — theme engine surface (Issue #46)', () => {
  it('exports provideHaTheme as a function', () => {
    expect(typeof publicApi.provideHaTheme).toBe('function');
  });

  it('exports HaThemeService as a class', () => {
    expect(typeof publicApi.HaThemeService).toBe('function');
  });

  it('exports DEFAULT_THEME with the full color roster (literals + primary/secondary variants + semantic set + deprecated danger alias)', () => {
    expect(publicApi.DEFAULT_THEME.colors).toEqual({
      'dark-blue': expect.any(String),
      'light-blue': expect.any(String),
      'dark-green': expect.any(String),
      'light-green': expect.any(String),
      primary: { base: expect.any(String), hover: expect.any(String) },
      secondary: { base: expect.any(String), hover: expect.any(String) },
      success: expect.any(String),
      error: expect.any(String),
      danger: expect.any(String),
      warning: expect.any(String),
      alert: expect.any(String),
      info: expect.any(String),
      neutral: expect.any(String),
    });
  });

  it('exports HaThemeConfig, HaThemeOptions, and ResolvedTheme as usable types', () => {
    const config: HaThemeConfig = { colors: { primary: '#000' } };
    const options: HaThemeOptions = { extendDefaults: false };
    const resolved: ResolvedTheme = publicApi.DEFAULT_THEME;
    expect(config.colors['primary']).toBe('#000');
    expect(options.extendDefaults).toBe(false);
    expect(resolved.colors['primary']).toBeDefined();
  });

  it('exports HaColorVariants and HaColorValue as usable types for object-shaped bootstrap colors', () => {
    const variants: HaColorVariants = { base: '#16709e', hover: '#0a4f6b' };
    const config: HaThemeConfig = { colors: { primary: variants, brand: '#00ff00' } };
    const asString: HaColorValue = '#16709e';
    const asVariants: HaColorValue = variants;

    expect((config.colors['primary'] as HaColorVariants).base).toBe('#16709e');
    expect(asString).toBe('#16709e');
    expect((asVariants as HaColorVariants).base).toBe('#16709e');
  });

  it('does NOT export mergeTheme, HA_THEME_TOKEN, or HA_THEME_STATE_KEY (internal surface)', () => {
    expect((publicApi as unknown as Record<string, unknown>)['mergeTheme']).toBeUndefined();
    expect((publicApi as unknown as Record<string, unknown>)['HA_THEME_TOKEN']).toBeUndefined();
    expect((publicApi as unknown as Record<string, unknown>)['HA_THEME_STATE_KEY']).toBeUndefined();
  });
});

describe('public-api — focus management surface (Issue #118)', () => {
  it('exports withFocusMonitor as a function', () => {
    expect(typeof publicApi.withFocusMonitor).toBe('function');
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
    expect(vars['--ha-color-primary']).toBe('#3366ff');
  });
});

describe('public-api — theme runtime surface (Issue #48, Phase 5)', () => {
  it('exports toSemanticCssVariables as a function, importable with zero @angular/* required to call it', () => {
    expect(typeof publicApi.toSemanticCssVariables).toBe('function');
    expect(publicApi.toSemanticCssVariables({ '--ha-color-primary': '#2563eb' })).toEqual({
      '--ha-primary': '#2563eb',
    });
  });
});

describe('public-api — Foundation surface (default-theme, Phase 2)', () => {
  it('exports HA_COLOR_SCALE_STEPS and HA_SIZE_STEPS as usable arrays', () => {
    expect(publicApi.HA_COLOR_SCALE_STEPS).toEqual([
      25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900,
    ]);
    expect(publicApi.HA_SIZE_STEPS).toEqual(['xs', 'sm', 'md', 'lg', 'xl']);
  });

  it('exports HA_FOUNDATION_PALETTE with all 4 brand families at full 11-step completeness', () => {
    const families = ['dark-blue', 'light-blue', 'dark-green', 'light-green'] as const;
    for (const family of families) {
      expect(
        Object.keys(publicApi.HA_FOUNDATION_PALETTE[family]).sort((a, b) => Number(a) - Number(b)),
      ).toEqual(['25', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900']);
    }
    expect(publicApi.HA_FOUNDATION_PALETTE['dark-blue'][500]).toBe('#0a4f6b');
  });

  it('exports HA_SPACING_SCALE, HA_GAP_SCALE, HA_RADIUS_SCALE, HA_ICON_SIZE_SCALE with all 5 size steps', () => {
    for (const scale of [
      publicApi.HA_SPACING_SCALE,
      publicApi.HA_GAP_SCALE,
      publicApi.HA_RADIUS_SCALE,
      publicApi.HA_ICON_SIZE_SCALE,
    ]) {
      expect(Object.keys(scale).sort()).toEqual(['lg', 'md', 'sm', 'xl', 'xs']);
    }
    expect(publicApi.HA_ICON_SIZE_SCALE.md).toBe('24px');
  });

  it('exports HA_TYPOGRAPHY_SCALE with the 7 confirmed roles and HA_FONT_WEIGHT_SCALE with 3 weights', () => {
    expect(Object.keys(publicApi.HA_TYPOGRAPHY_SCALE).sort()).toEqual(
      ['body', 'caption', 'h1', 'h2', 'h3', 'h4', 'small-body'].sort(),
    );
    expect(publicApi.HA_TYPOGRAPHY_SCALE['h1'].fontSize).toBe('2rem');
    expect(publicApi.HA_FONT_WEIGHT_SCALE).toEqual({
      regular: '400',
      semibold: '600',
      bold: '700',
    });
  });

  it('exports HA_FONT_FAMILY as a string containing Montserrat', () => {
    expect(publicApi.HA_FONT_FAMILY).toContain('Montserrat');
  });

  it('exports HA_BUTTON_FIGMA_DIMENSIONS (md) and HA_BUTTON_PROVISIONAL_DIMENSIONS (sm/lg)', () => {
    expect(publicApi.HA_BUTTON_FIGMA_DIMENSIONS.md.minWidth).toBe('224px');
    expect(publicApi.HA_BUTTON_PROVISIONAL_DIMENSIONS.sm.minWidth).toBe('200px');
    expect(publicApi.HA_BUTTON_PROVISIONAL_DIMENSIONS.lg.minWidth).toBe('280px');
  });

  it('exports HA_COMPONENT_TOKEN_DEFAULTS with every --ha-button-* default', () => {
    expect(publicApi.HA_COMPONENT_TOKEN_DEFAULTS['--ha-button-bg']).toBe('var(--ha-primary)');
    expect(Object.keys(publicApi.HA_COMPONENT_TOKEN_DEFAULTS).length).toBeGreaterThan(20);
  });

  it('does NOT export toFoundationCssVariables (Requirement: Foundation Emitted as Static CSS — no runtime path)', () => {
    expect(
      (publicApi as unknown as Record<string, unknown>)['toFoundationCssVariables'],
    ).toBeUndefined();
  });
});
