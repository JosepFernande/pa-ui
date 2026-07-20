export { PaUiComponent } from './lib/pa-ui/pa-ui.component';

export { providePaTheme } from './lib/theme/theme-provider';
export { PaThemeService } from './lib/theme/theme.service';
export { DEFAULT_THEME } from './lib/theme/theme.tokens';
export type {
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
