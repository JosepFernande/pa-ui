import { HA_COMPONENT_TOKEN_DEFAULTS } from '@halolib-ui/core';
import { HA_SELECT_TOKENS } from './select.tokens';

describe('Select Tokens', () => {
  it('should export HA_SELECT_TOKENS with CSS variable name strings', () => {
    expect(HA_SELECT_TOKENS).toBeDefined();
    expect(HA_SELECT_TOKENS.bg).toBe('--ha-select-bg');
    expect(HA_SELECT_TOKENS.panelBg).toBe('--ha-select-panel-bg');
    expect(HA_SELECT_TOKENS.optionHoverBg).toBe('--ha-select-option-hover-bg');
  });

  it('should include the exact 53 token keys from the design spec', () => {
    const keys = Object.keys(HA_SELECT_TOKENS);
    const required = [
      // Trigger (32)
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
      'focusRing',
      'focusRingOffset',
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
    expect(keys).toHaveLength(53);
  });

  it('should have all values prefixed with --ha-select-', () => {
    const values = Object.values(HA_SELECT_TOKENS);
    for (const value of values) {
      expect(value).toMatch(/^--ha-select-/);
    }
  });

  it('every HA_SELECT_TOKENS value MUST be a key of HA_COMPONENT_TOKEN_DEFAULTS (foundation provides a default for every select token)', () => {
    const defaultsKeys = Object.keys(HA_COMPONENT_TOKEN_DEFAULTS);
    for (const cssVarName of Object.values(HA_SELECT_TOKENS)) {
      expect(defaultsKeys).toContain(cssVarName);
    }
  });
});
