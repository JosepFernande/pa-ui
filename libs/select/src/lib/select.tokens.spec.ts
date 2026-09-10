import { HA_COMPONENT_TOKEN_DEFAULTS } from '@halolib-ui/core';
import { HA_SELECT_TOKENS } from './select.tokens';

const FLAT_SELECT_TOKENS: Record<string, string> = Object.fromEntries(
  Object.values(HA_SELECT_TOKENS).flatMap((group) => Object.entries(group)),
);

describe('Select Tokens', () => {
  it('should export HA_SELECT_TOKENS with CSS variable name strings', () => {
    expect(HA_SELECT_TOKENS).toBeDefined();
    expect(HA_SELECT_TOKENS.trigger.bg).toBe('--ha-select-bg');
    expect(HA_SELECT_TOKENS.panel.panelBg).toBe('--ha-select-panel-bg');
    expect(HA_SELECT_TOKENS.option.optionHoverBg).toBe('--ha-select-option-hover-bg');
  });

  it('should include the exact 32 trigger token keys', () => {
    const keys = Object.keys(HA_SELECT_TOKENS.trigger);
    const required = [
      'bg',
      'color',
      'border',
      'placeholderColor',
      'fontFamily',
      'fontWeight',
      'lineHeight',
      'gap',
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
      'disabledBg',
      'disabledColor',
      'disabledOpacity',
      'readonlyBg',
      'readonlyBorder',
      'transitionDuration',
      'transitionEasing',
    ];

    for (const key of required) {
      expect(keys).toContain(key);
    }
    expect(keys).toHaveLength(required.length);
    expect(keys).toHaveLength(32);
  });

  it('should include the exact 7 panel token keys', () => {
    const keys = Object.keys(HA_SELECT_TOKENS.panel);
    const required = [
      'panelBg',
      'panelBorder',
      'panelRadius',
      'panelShadow',
      'panelMaxHeight',
      'panelPaddingY',
      'panelOffset',
    ];

    for (const key of required) {
      expect(keys).toContain(key);
    }
    expect(keys).toHaveLength(required.length);
    expect(keys).toHaveLength(7);
  });

  it('should include the exact 14 option token keys', () => {
    const keys = Object.keys(HA_SELECT_TOKENS.option);
    const required = [
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
    expect(keys).toHaveLength(14);
  });

  it('should include the exact 53 token keys from the design spec (trigger + panel + option)', () => {
    const keys = Object.keys(FLAT_SELECT_TOKENS);
    expect(keys).toHaveLength(53);
  });

  it('should have all values prefixed with --ha-select-', () => {
    const values = Object.values(FLAT_SELECT_TOKENS);
    for (const value of values) {
      expect(value).toMatch(/^--ha-select-/);
    }
  });

  it('every HA_SELECT_TOKENS value MUST be a key of HA_COMPONENT_TOKEN_DEFAULTS (foundation provides a default for every select token)', () => {
    const defaultsKeys = Object.keys(HA_COMPONENT_TOKEN_DEFAULTS);
    for (const cssVarName of Object.values(FLAT_SELECT_TOKENS)) {
      expect(defaultsKeys).toContain(cssVarName);
    }
  });
});
