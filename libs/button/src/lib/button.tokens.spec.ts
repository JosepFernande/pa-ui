import { PA_COMPONENT_TOKEN_DEFAULTS } from '@pa-ui/core';
import { PA_BUTTON_TOKENS } from './button.tokens';

describe('Button Tokens', () => {
  it('should export PA_BUTTON_TOKENS with CSS variable name strings', () => {
    expect(PA_BUTTON_TOKENS).toBeDefined();
    expect(PA_BUTTON_TOKENS.bg).toBe('--pa-button-bg');
    expect(PA_BUTTON_TOKENS.color).toBe('--pa-button-color');
    expect(PA_BUTTON_TOKENS.border).toBe('--pa-button-border');
    expect(PA_BUTTON_TOKENS.radius).toBe('--pa-button-radius');
  });

  it('should include all required token keys from the design spec', () => {
    const keys = Object.keys(PA_BUTTON_TOKENS);
    const required = [
      'bg',
      'color',
      'border',
      'radius',
      'gap',
      'fontFamily',
      'fontWeight',
      'lineHeight',
      'paddingSm',
      'paddingMd',
      'paddingLg',
      'fontSm',
      'fontMd',
      'fontLg',
      'minHeightSm',
      'minHeightMd',
      'minHeightLg',
      'focusRing',
      'hoverBg',
      'activeBg',
      'disabledBg',
      'disabledColor',
      'disabledOpacity',
      'solidColor',
      'transitionDuration',
      'transitionEasing',
      'loadingColor',
      'spinnerSize',
      'spinnerBorder',
      'spinnerDuration',
      'srOnlyWidth',
      'srOnlyHeight',
      'srOnlyMargin',
      'minWidthSm',
      'minWidthMd',
      'minWidthLg',
      'gapSm',
      'gapMd',
      'gapLg',
    ];

    for (const key of required) {
      expect(keys).toContain(key);
    }
    expect(keys).toHaveLength(required.length);
  });

  it('should have all values prefixed with --pa-button-', () => {
    const values = Object.values(PA_BUTTON_TOKENS);
    for (const value of values) {
      expect(value).toMatch(/^--pa-button-/);
    }
  });

  it('should add minWidthSm/Md/Lg mapped to --pa-button-min-width-{size} (additive, Phase 3)', () => {
    expect(PA_BUTTON_TOKENS.minWidthSm).toBe('--pa-button-min-width-sm');
    expect(PA_BUTTON_TOKENS.minWidthMd).toBe('--pa-button-min-width-md');
    expect(PA_BUTTON_TOKENS.minWidthLg).toBe('--pa-button-min-width-lg');
  });

  it('should add gapSm/Md/Lg mapped to --pa-button-gap-{size} (additive, Phase 3)', () => {
    expect(PA_BUTTON_TOKENS.gapSm).toBe('--pa-button-gap-sm');
    expect(PA_BUTTON_TOKENS.gapMd).toBe('--pa-button-gap-md');
    expect(PA_BUTTON_TOKENS.gapLg).toBe('--pa-button-gap-lg');
  });

  it('should not remove or rename any existing token (purely additive extension)', () => {
    const existing = [
      'bg',
      'color',
      'border',
      'radius',
      'gap',
      'paddingSm',
      'paddingMd',
      'paddingLg',
      'minHeightSm',
      'minHeightMd',
      'minHeightLg',
      'fontSm',
      'fontMd',
      'fontLg',
    ];
    for (const key of existing) {
      expect(PA_BUTTON_TOKENS).toHaveProperty(key);
    }
  });

  it('every PA_BUTTON_TOKENS value MUST be a key of PA_COMPONENT_TOKEN_DEFAULTS (foundation provides a default for every button token)', () => {
    const defaultsKeys = Object.keys(PA_COMPONENT_TOKEN_DEFAULTS);
    for (const cssVarName of Object.values(PA_BUTTON_TOKENS)) {
      expect(defaultsKeys).toContain(cssVarName);
    }
  });
});
