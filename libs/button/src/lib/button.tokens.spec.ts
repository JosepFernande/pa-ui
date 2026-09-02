import { HA_COMPONENT_TOKEN_DEFAULTS } from '@halo-ui/core';
import { HA_BUTTON_TOKENS } from './button.tokens';

describe('Button Tokens', () => {
  it('should export HA_BUTTON_TOKENS with CSS variable name strings', () => {
    expect(HA_BUTTON_TOKENS).toBeDefined();
    expect(HA_BUTTON_TOKENS.bg).toBe('--ha-button-bg');
    expect(HA_BUTTON_TOKENS.color).toBe('--ha-button-color');
    expect(HA_BUTTON_TOKENS.border).toBe('--ha-button-border');
    expect(HA_BUTTON_TOKENS.radius).toBe('--ha-button-radius');
  });

  it('should include all required token keys from the design spec', () => {
    const keys = Object.keys(HA_BUTTON_TOKENS);
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
      'focusRingOffset',
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

  it('should have all values prefixed with --ha-button-', () => {
    const values = Object.values(HA_BUTTON_TOKENS);
    for (const value of values) {
      expect(value).toMatch(/^--ha-button-/);
    }
  });

  it('should add minWidthSm/Md/Lg mapped to --ha-button-min-width-{size} (additive, Phase 3)', () => {
    expect(HA_BUTTON_TOKENS.minWidthSm).toBe('--ha-button-min-width-sm');
    expect(HA_BUTTON_TOKENS.minWidthMd).toBe('--ha-button-min-width-md');
    expect(HA_BUTTON_TOKENS.minWidthLg).toBe('--ha-button-min-width-lg');
  });

  it('should add gapSm/Md/Lg mapped to --ha-button-gap-{size} (additive, Phase 3)', () => {
    expect(HA_BUTTON_TOKENS.gapSm).toBe('--ha-button-gap-sm');
    expect(HA_BUTTON_TOKENS.gapMd).toBe('--ha-button-gap-md');
    expect(HA_BUTTON_TOKENS.gapLg).toBe('--ha-button-gap-lg');
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
      expect(HA_BUTTON_TOKENS).toHaveProperty(key);
    }
  });

  it('every HA_BUTTON_TOKENS value MUST be a key of HA_COMPONENT_TOKEN_DEFAULTS (foundation provides a default for every button token)', () => {
    const defaultsKeys = Object.keys(HA_COMPONENT_TOKEN_DEFAULTS);
    for (const cssVarName of Object.values(HA_BUTTON_TOKENS)) {
      expect(defaultsKeys).toContain(cssVarName);
    }
  });
});
