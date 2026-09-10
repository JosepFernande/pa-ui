import { HA_BUTTON_DIMENSIONS, HA_COMPONENT_TOKEN_DEFAULTS } from '@halolib-ui/angular/core';
import { HA_BUTTON_TOKENS } from './button.tokens';

const FLAT_BUTTON_TOKENS: Record<string, string> = Object.fromEntries(
  Object.values(HA_BUTTON_TOKENS).flatMap((group) => Object.entries(group)),
);

describe('Button Tokens', () => {
  it('should export HA_BUTTON_TOKENS with CSS variable name strings', () => {
    expect(HA_BUTTON_TOKENS).toBeDefined();
    expect(HA_BUTTON_TOKENS.surface.bg).toBe('--ha-button-bg');
    expect(HA_BUTTON_TOKENS.surface.color).toBe('--ha-button-color');
    expect(HA_BUTTON_TOKENS.surface.border).toBe('--ha-button-border');
    expect(HA_BUTTON_TOKENS.surface.radius).toBe('--ha-button-radius');
  });

  it('should include all required token keys from the design spec', () => {
    const keys = Object.keys(FLAT_BUTTON_TOKENS);
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
      'radiusSm',
      'radiusMd',
      'radiusLg',
    ];

    for (const key of required) {
      expect(keys).toContain(key);
    }
    expect(keys).toHaveLength(required.length);
  });

  it('should have all values prefixed with --ha-button-', () => {
    const values = Object.values(FLAT_BUTTON_TOKENS);
    for (const value of values) {
      expect(value).toMatch(/^--ha-button-/);
    }
  });

  it('should add minWidthSm/Md/Lg mapped to --ha-button-min-width-{size} (additive, Phase 3)', () => {
    expect(HA_BUTTON_TOKENS.sizing.minWidthSm).toBe('--ha-button-min-width-sm');
    expect(HA_BUTTON_TOKENS.sizing.minWidthMd).toBe('--ha-button-min-width-md');
    expect(HA_BUTTON_TOKENS.sizing.minWidthLg).toBe('--ha-button-min-width-lg');
  });

  it('should add gapSm/Md/Lg mapped to --ha-button-gap-{size} (additive, Phase 3)', () => {
    expect(HA_BUTTON_TOKENS.sizing.gapSm).toBe('--ha-button-gap-sm');
    expect(HA_BUTTON_TOKENS.sizing.gapMd).toBe('--ha-button-gap-md');
    expect(HA_BUTTON_TOKENS.sizing.gapLg).toBe('--ha-button-gap-lg');
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
      expect(FLAT_BUTTON_TOKENS).toHaveProperty(key);
    }
  });

  it('should add radiusSm/Md/Lg mapped to --ha-button-radius-{size} (additive)', () => {
    expect(HA_BUTTON_TOKENS.sizing.radiusSm).toBe('--ha-button-radius-sm');
    expect(HA_BUTTON_TOKENS.sizing.radiusMd).toBe('--ha-button-radius-md');
    expect(HA_BUTTON_TOKENS.sizing.radiusLg).toBe('--ha-button-radius-lg');
  });

  it('should resolve the default radius per size instead of being hardcoded to a single value (Bug: radius not split per size like minHeight/paddingX/gap)', () => {
    const resolvedRadiusSm = HA_COMPONENT_TOKEN_DEFAULTS[HA_BUTTON_TOKENS.sizing.radiusSm];
    const resolvedRadiusMd = HA_COMPONENT_TOKEN_DEFAULTS[HA_BUTTON_TOKENS.sizing.radiusMd];
    const resolvedRadiusLg = HA_COMPONENT_TOKEN_DEFAULTS[HA_BUTTON_TOKENS.sizing.radiusLg];

    expect(resolvedRadiusSm).toBe(HA_BUTTON_DIMENSIONS.sm.radius);
    expect(resolvedRadiusMd).toBe(HA_BUTTON_DIMENSIONS.md.radius);
    expect(resolvedRadiusLg).toBe(HA_BUTTON_DIMENSIONS.lg.radius);
    expect(resolvedRadiusSm).not.toBe(resolvedRadiusMd);
    expect(resolvedRadiusMd).not.toBe(resolvedRadiusLg);
  });

  it('every HA_BUTTON_TOKENS value MUST be a key of HA_COMPONENT_TOKEN_DEFAULTS (foundation provides a default for every button token)', () => {
    const defaultsKeys = Object.keys(HA_COMPONENT_TOKEN_DEFAULTS);
    for (const cssVarName of Object.values(FLAT_BUTTON_TOKENS)) {
      expect(defaultsKeys).toContain(cssVarName);
    }
  });
});
