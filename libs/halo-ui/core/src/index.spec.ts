import * as coreApi from './index';
import type {
  HaColorValue,
  HaColorVariants,
  HaTheme,
  HaThemeOptions,
  ResolvedTheme,
} from './index';

describe('core entry barrel — theme engine surface (Issue #46)', () => {
  it('exports provideHaTheme as a function', () => {
    expect(typeof coreApi.provideHaTheme).toBe('function');
  });

  it('exports HaThemeService as a class', () => {
    expect(typeof coreApi.HaThemeService).toBe('function');
  });

  it("exports DEFAULT_THEME with only the brand-anchor `primary` color — every other semantic color lives in the consuming page's own provider", () => {
    expect(coreApi.DEFAULT_THEME.colors).toEqual({
      primary: expect.any(String),
    });
  });

  it('exports HaTheme, HaThemeOptions, and ResolvedTheme as usable types', () => {
    const theme: HaTheme = { semantic: { primary: '#000' } };
    const options: HaThemeOptions = { extendDefaults: false };
    const resolved: ResolvedTheme = coreApi.DEFAULT_THEME;
    expect(theme.semantic?.['primary']).toBe('#000');
    expect(options.extendDefaults).toBe(false);
    expect(resolved.colors['primary']).toBeDefined();
  });

  it('exports HaColorVariants and HaColorValue as usable types for object-shaped bootstrap colors', () => {
    const variants: HaColorVariants = { base: '#16709e', hover: '#0a4f6b' };
    const theme: HaTheme = { semantic: { primary: variants, brand: '#00ff00' } };
    const asString: HaColorValue = '#16709e';
    const asVariants: HaColorValue = variants;

    expect((theme.semantic?.['primary'] as HaColorVariants).base).toBe('#16709e');
    expect(asString).toBe('#16709e');
    expect((asVariants as HaColorVariants).base).toBe('#16709e');
  });

  it('does NOT export mergeTheme, HA_THEME_TOKEN, or HA_THEME_STATE_KEY (internal surface)', () => {
    expect((coreApi as unknown as Record<string, unknown>)['mergeTheme']).toBeUndefined();
    expect((coreApi as unknown as Record<string, unknown>)['HA_THEME_TOKEN']).toBeUndefined();
    expect((coreApi as unknown as Record<string, unknown>)['HA_THEME_STATE_KEY']).toBeUndefined();
  });
});

describe('core entry barrel — focus management surface (Issue #118)', () => {
  it('exports withFocusMonitor as a function', () => {
    expect(typeof coreApi.withFocusMonitor).toBe('function');
  });
});

describe('core entry barrel — HSL derivation surface (Issue #47, Task 3.2)', () => {
  it('exports every color-math conversion function', () => {
    expect(typeof coreApi.hexToRgb).toBe('function');
    expect(typeof coreApi.rgbToHsl).toBe('function');
    expect(typeof coreApi.hslToRgb).toBe('function');
    expect(typeof coreApi.hexToHsl).toBe('function');
    expect(typeof coreApi.hslToHex).toBe('function');
    expect(typeof coreApi.relativeLuminance).toBe('function');
  });

  it('exports every color-derivation function', () => {
    expect(typeof coreApi.normalizeColorName).toBe('function');
    expect(typeof coreApi.adjustLightness).toBe('function');
    expect(typeof coreApi.getContrastColor).toBe('function');
    expect(typeof coreApi.deriveTokens).toBe('function');
  });

  it('exports usable HSL, RGB, and ThemeCssVariables types end to end', () => {
    const rgb: import('./index').RGB = coreApi.hexToRgb('#3366ff');
    const hsl: import('./index').HSL = coreApi.rgbToHsl(rgb);
    const vars: import('./index').ThemeCssVariables = coreApi.deriveTokens({
      colors: { primary: '#3366ff' },
    });

    expect(hsl.h).toBeGreaterThanOrEqual(0);
    expect(vars['--ha-color-primary']).toBe('#3366ff');
  });
});

describe('core entry barrel — theme runtime surface (Issue #48, Phase 5)', () => {
  it('exports toSemanticCssVariables as a function, importable with zero @angular/* required to call it', () => {
    expect(typeof coreApi.toSemanticCssVariables).toBe('function');
    expect(coreApi.toSemanticCssVariables({ '--ha-color-primary': '#2563eb' })).toEqual({
      '--ha-primary': '#2563eb',
    });
  });
});

describe('core entry barrel — Foundation surface (default-theme, Phase 2)', () => {
  it('exports HA_COLOR_SCALE_STEPS and HA_SIZE_STEPS as usable arrays', () => {
    expect(coreApi.HA_COLOR_SCALE_STEPS).toEqual([50, 100, 200, 300, 400, 500, 600, 700, 800, 900]);
    expect(coreApi.HA_SIZE_STEPS).toEqual(['sm', 'md', 'lg']);
  });

  it('exports HA_FOUNDATION_PALETTE with the single "primary" brand family at full 10-step completeness', () => {
    expect(
      Object.keys(coreApi.HA_FOUNDATION_PALETTE['primary']).sort((a, b) => Number(a) - Number(b)),
    ).toEqual(['50', '100', '200', '300', '400', '500', '600', '700', '800', '900']);
    expect(coreApi.HA_FOUNDATION_PALETTE['primary'][600]).toBe('#6f5de8');
  });

  it('exports HA_SPACING_SCALE, HA_GAP_SCALE, HA_RADIUS_SCALE, HA_PADDING_X_SCALE, HA_ICON_SIZE_SCALE with all 3 size steps', () => {
    for (const scale of [
      coreApi.HA_SPACING_SCALE,
      coreApi.HA_GAP_SCALE,
      coreApi.HA_RADIUS_SCALE,
      coreApi.HA_PADDING_X_SCALE,
      coreApi.HA_ICON_SIZE_SCALE,
    ]) {
      expect(Object.keys(scale).sort()).toEqual(['lg', 'md', 'sm']);
    }
    expect(coreApi.HA_ICON_SIZE_SCALE.md).toBe('24px');
  });

  it('exports HA_TYPOGRAPHY_SCALE with the 7 confirmed roles and HA_FONT_WEIGHT_SCALE with 3 weights', () => {
    expect(Object.keys(coreApi.HA_TYPOGRAPHY_SCALE).sort()).toEqual(
      ['body', 'caption', 'h1', 'h2', 'h3', 'h4', 'small-body'].sort(),
    );
    expect(coreApi.HA_TYPOGRAPHY_SCALE['h1'].fontSize).toBe('2rem');
    expect(coreApi.HA_FONT_WEIGHT_SCALE).toEqual({
      regular: '400',
      semibold: '600',
      bold: '700',
    });
  });

  it('exports HA_FONT_FAMILY as a string containing Montserrat', () => {
    expect(coreApi.HA_FONT_FAMILY).toContain('Montserrat');
  });

  it('exports HA_BUTTON_DIMENSIONS (sm/md/lg)', () => {
    expect(coreApi.HA_BUTTON_DIMENSIONS.sm.minWidth).toBe('200px');
    expect(coreApi.HA_BUTTON_DIMENSIONS.md.minWidth).toBe('224px');
    expect(coreApi.HA_BUTTON_DIMENSIONS.lg.minWidth).toBe('280px');
  });

  it('exports HA_COMPONENT_TOKEN_DEFAULTS with every --ha-button-* default', () => {
    expect(coreApi.HA_COMPONENT_TOKEN_DEFAULTS['--ha-button-bg']).toBe('var(--ha-primary)');
    expect(Object.keys(coreApi.HA_COMPONENT_TOKEN_DEFAULTS).length).toBeGreaterThan(20);
  });

  it('does NOT export toFoundationCssVariables or toComponentCssVariables (Foundation/Component are now built by HaThemeService internally; these full builders are an internal implementation detail, not public API)', () => {
    expect(
      (coreApi as unknown as Record<string, unknown>)['toFoundationCssVariables'],
    ).toBeUndefined();
    expect(
      (coreApi as unknown as Record<string, unknown>)['toComponentCssVariables'],
    ).toBeUndefined();
  });
});

describe('core entry barrel — component token NAME registries (HaTheme.components support)', () => {
  it('exports HA_BUTTON_TOKENS/HA_INPUT_TEXT_TOKENS/HA_SELECT_TOKENS as usable CSS-variable-name registries', () => {
    expect(coreApi.HA_BUTTON_TOKENS.surface.bg).toBe('--ha-button-bg');
    expect(coreApi.HA_INPUT_TEXT_TOKENS.surface.bg).toBe('--ha-input-bg');
    expect(coreApi.HA_SELECT_TOKENS.option.optionSelectedBg).toBe('--ha-select-option-selected-bg');
  });

  it('exports HaButtonTokens/HaInputTextTokens/HaSelectTokens as usable types for HaTheme.components', () => {
    const theme: import('./index').HaTheme = {
      components: {
        button: { surface: { bg: 'var(--ha-primary)' } },
        inputText: { focus: { focusBorder: '#00897b' } },
        select: { option: { optionSelectedBg: 'var(--ha-accent)' } },
      },
    };
    expect(theme.components?.button?.surface?.bg).toBe('var(--ha-primary)');
    expect(theme.components?.inputText?.focus?.focusBorder).toBe('#00897b');
    expect(theme.components?.select?.option?.optionSelectedBg).toBe('var(--ha-accent)');
  });
});
