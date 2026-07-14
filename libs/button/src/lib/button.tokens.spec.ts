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
});
