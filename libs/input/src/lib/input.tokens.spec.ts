import { PA_COMPONENT_TOKEN_DEFAULTS } from '@pa-ui/core';
import { PA_INPUT_TOKENS } from './input.tokens';

describe('Input Tokens', () => {
  it('should export PA_INPUT_TOKENS with CSS variable name strings', () => {
    expect(PA_INPUT_TOKENS).toBeDefined();
    expect(PA_INPUT_TOKENS.bg).toBe('--pa-input-bg');
    expect(PA_INPUT_TOKENS.color).toBe('--pa-input-color');
    expect(PA_INPUT_TOKENS.border).toBe('--pa-input-border');
    expect(PA_INPUT_TOKENS.radiusSm).toBe('--pa-input-radius-sm');
    expect(PA_INPUT_TOKENS.radiusMd).toBe('--pa-input-radius-md');
    expect(PA_INPUT_TOKENS.radiusLg).toBe('--pa-input-radius-lg');
  });

  it('should include all required token keys from the design spec', () => {
    const keys = Object.keys(PA_INPUT_TOKENS);
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

  it('should have all values prefixed with --pa-input-', () => {
    const values = Object.values(PA_INPUT_TOKENS);
    for (const value of values) {
      expect(value).toMatch(/^--pa-input-/);
    }
  });

  it('every PA_INPUT_TOKENS value MUST be a key of PA_COMPONENT_TOKEN_DEFAULTS (foundation provides a default for every input token)', () => {
    const defaultsKeys = Object.keys(PA_COMPONENT_TOKEN_DEFAULTS);
    for (const cssVarName of Object.values(PA_INPUT_TOKENS)) {
      expect(defaultsKeys).toContain(cssVarName);
    }
  });
});
