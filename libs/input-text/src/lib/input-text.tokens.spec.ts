import { HA_COMPONENT_TOKEN_DEFAULTS } from '@halolib-ui/core';
import { HA_INPUT_TEXT_TOKENS } from './input-text.tokens';

const FLAT_INPUT_TEXT_TOKENS: Record<string, string> = Object.fromEntries(
  Object.values(HA_INPUT_TEXT_TOKENS).flatMap((group) => Object.entries(group)),
);

describe('Input Tokens', () => {
  it('should export HA_INPUT_TEXT_TOKENS with CSS variable name strings', () => {
    expect(HA_INPUT_TEXT_TOKENS).toBeDefined();
    expect(HA_INPUT_TEXT_TOKENS.surface.bg).toBe('--ha-input-bg');
    expect(HA_INPUT_TEXT_TOKENS.surface.color).toBe('--ha-input-color');
    expect(HA_INPUT_TEXT_TOKENS.surface.border).toBe('--ha-input-border');
    expect(HA_INPUT_TEXT_TOKENS.sizing.radiusSm).toBe('--ha-input-radius-sm');
    expect(HA_INPUT_TEXT_TOKENS.sizing.radiusMd).toBe('--ha-input-radius-md');
    expect(HA_INPUT_TEXT_TOKENS.sizing.radiusLg).toBe('--ha-input-radius-lg');
  });

  it('should include all required token keys from the design spec', () => {
    const keys = Object.keys(FLAT_INPUT_TEXT_TOKENS);
    const required = [
      'bg',
      'color',
      'border',
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
      'radiusSm',
      'radiusMd',
      'radiusLg',
      'focusBorder',
      'focusRing',
      'focusRingOffset',
      'errorBorder',
      'errorColor',
      'errorIconColor',
      'disabledBg',
      'disabledColor',
      'disabledOpacity',
      'readonlyBg',
      'readonlyBorder',
      'hintColor',
      'hintFontSize',
      'labelColor',
      'labelFontSize',
      'labelFontWeight',
      'transitionDuration',
      'transitionEasing',
      'placeholderColor',
    ];

    for (const key of required) {
      expect(keys).toContain(key);
    }
    expect(keys).toHaveLength(required.length);
  });

  it('should have all values prefixed with --ha-input-', () => {
    const values = Object.values(FLAT_INPUT_TEXT_TOKENS);
    for (const value of values) {
      expect(value).toMatch(/^--ha-input-/);
    }
  });

  it('every HA_INPUT_TEXT_TOKENS value MUST be a key of HA_COMPONENT_TOKEN_DEFAULTS (foundation provides a default for every input token)', () => {
    const defaultsKeys = Object.keys(HA_COMPONENT_TOKEN_DEFAULTS);
    for (const cssVarName of Object.values(FLAT_INPUT_TEXT_TOKENS)) {
      expect(defaultsKeys).toContain(cssVarName);
    }
  });
});
