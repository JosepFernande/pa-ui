import { PA_COMPONENT_TOKEN_DEFAULTS } from '@pa-ui/core';
import { PA_SELECT_TOKENS } from './select.tokens';

describe('Select Tokens', () => {
  it('should export PA_SELECT_TOKENS with CSS variable name strings', () => {
    expect(PA_SELECT_TOKENS).toBeDefined();
    expect(PA_SELECT_TOKENS.bg).toBe('--pa-select-bg');
    expect(PA_SELECT_TOKENS.panelBg).toBe('--pa-select-panel-bg');
    expect(PA_SELECT_TOKENS.optionHoverBg).toBe('--pa-select-option-hover-bg');
  });

  it('should include the exact 51 token keys from the design spec', () => {
    const keys = Object.keys(PA_SELECT_TOKENS);
    const required = [
      // Trigger (30)
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
      'placeholderColor',
      'focusBorder',
      'errorBorder',
      'errorColor',
      'disabledBg',
      'disabledColor',
      'disabledOpacity',
      'readonlyBg',
      'readonlyBorder',
      'transitionDuration',
      'transitionEasing',
      'gap',
      // Panel (7)
      'panelBg',
      'panelBorder',
      'panelRadius',
      'panelShadow',
      'panelMaxHeight',
      'panelPaddingY',
      'panelOffset',
      // Option (14)
      'optionColor',
      'optionBg',
      'optionPaddingX',
      'optionPaddingY',
      'optionMinHeight',
      'optionFontSize',
      'optionHoverBg',
      'optionActiveBg',
      'optionActiveColor',
      'optionSelectedBg',
      'optionSelectedColor',
      'optionSelectedFontWeight',
      'optionDisabledColor',
      'optionDisabledOpacity',
    ];

    for (const key of required) {
      expect(keys).toContain(key);
    }
    expect(keys).toHaveLength(required.length);
    expect(keys).toHaveLength(51);
  });

  it('should have all values prefixed with --pa-select-', () => {
    const values = Object.values(PA_SELECT_TOKENS);
    for (const value of values) {
      expect(value).toMatch(/^--pa-select-/);
    }
  });

  it('every PA_SELECT_TOKENS value MUST be a key of PA_COMPONENT_TOKEN_DEFAULTS (foundation provides a default for every select token)', () => {
    const defaultsKeys = Object.keys(PA_COMPONENT_TOKEN_DEFAULTS);
    for (const cssVarName of Object.values(PA_SELECT_TOKENS)) {
      expect(defaultsKeys).toContain(cssVarName);
    }
  });
});
