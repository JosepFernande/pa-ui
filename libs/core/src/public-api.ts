export { PaUiComponent } from './lib/pa-ui/pa-ui.component';

export { providePaTheme } from './lib/theme/theme-provider';
export { PaThemeService } from './lib/theme/theme.service';
export { DEFAULT_THEME } from './lib/theme/theme.tokens';
export type {
  PaColorValue,
  PaColorVariants,
  PaThemeConfig,
  PaThemeOptions,
  ResolvedTheme,
  ThemeCssVariables,
} from './lib/theme/theme.tokens';

export {
  hexToRgb,
  rgbToHsl,
  hslToRgb,
  hexToHsl,
  hslToHex,
  relativeLuminance,
} from './lib/theme/color-math';
export type { HSL, RGB } from './lib/theme/color-math';

export {
  normalizeColorName,
  adjustLightness,
  getContrastColor,
  deriveTokens,
} from './lib/theme/color-derivation';

export { toSemanticCssVariables } from './lib/theme/semantic-tokens';

export { PA_COLOR_SCALE_STEPS, PA_SIZE_STEPS } from './lib/foundation/foundation.types';
export type {
  PaColorScale,
  PaColorScaleStep,
  PaFontWeightScale,
  PaFoundationPalette,
  PaPartialColorScale,
  PaSizeScale,
  PaSizeStep,
  PaTypographyRole,
  PaTypographyScale,
} from './lib/foundation/foundation.types';

export {
  PA_FONT_FAMILY,
  PA_FONT_WEIGHT_SCALE,
  PA_FOUNDATION_PALETTE,
  PA_GAP_SCALE,
  PA_ICON_SIZE_SCALE,
  PA_RADIUS_SCALE,
  PA_SPACING_SCALE,
  PA_TYPOGRAPHY_SCALE,
} from './lib/foundation/foundation.tokens';

export {
  PA_BUTTON_FIGMA_DIMENSIONS,
  PA_BUTTON_PROVISIONAL_DIMENSIONS,
} from './lib/foundation/button-dimensions.tokens';

export { PA_COMPONENT_TOKEN_DEFAULTS } from './lib/foundation/component-defaults.tokens';

export { withFocusMonitor } from './lib/focus/with-focus-monitor';
