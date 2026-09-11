/**
 * Canonical NAME-shape registry for the `--ha-select-*` design tokens. See
 * `component-token-shapes.ts` for why this lives under `theme/` instead of
 * inside `@halolib-ui/select` (module-boundary cycle avoidance) and instead
 * of under `foundation/` (the `no-raw-scale-in-theme-engine.spec.ts` path
 * check).
 */

/**
 * Shape of the `--ha-select-*` design tokens (53 keys), following the same
 * camelCase-key -> kebab-name convention and per-size suffix scheme as
 * `HaInputTextTokens`. Grouped by UI anatomy: trigger (32), panel (7), and
 * option (14).
 */
export interface HaSelectTokens {
  readonly trigger: {
    readonly bg: string;
    readonly color: string;
    readonly border: string;
    readonly placeholderColor: string;
    readonly fontFamily: string;
    readonly fontWeight: string;
    readonly lineHeight: string;
    readonly gap: string;
    readonly paddingSm: string;
    readonly paddingMd: string;
    readonly paddingLg: string;
    readonly fontSm: string;
    readonly fontMd: string;
    readonly fontLg: string;
    readonly minHeightSm: string;
    readonly minHeightMd: string;
    readonly minHeightLg: string;
    readonly radiusSm: string;
    readonly radiusMd: string;
    readonly radiusLg: string;
    readonly focusBorder: string;
    readonly focusRing: string;
    readonly focusRingOffset: string;
    readonly errorBorder: string;
    readonly errorColor: string;
    readonly disabledBg: string;
    readonly disabledColor: string;
    readonly disabledOpacity: string;
    readonly readonlyBg: string;
    readonly readonlyBorder: string;
    readonly transitionDuration: string;
    readonly transitionEasing: string;
  };

  readonly panel: {
    readonly panelBg: string;
    readonly panelBorder: string;
    readonly panelRadius: string;
    readonly panelShadow: string;
    readonly panelMaxHeight: string;
    readonly panelPaddingY: string;
    readonly panelOffset: string;
  };

  readonly option: {
    readonly optionColor: string;
    readonly optionBg: string;
    readonly optionPaddingX: string;
    readonly optionPaddingY: string;
    readonly optionMinHeight: string;
    readonly optionFontSize: string;
    readonly optionHoverBg: string;
    readonly optionActiveBg: string;
    readonly optionActiveColor: string;
    readonly optionSelectedBg: string;
    readonly optionSelectedColor: string;
    readonly optionSelectedFontWeight: string;
    readonly optionDisabledColor: string;
    readonly optionDisabledOpacity: string;
  };
}

export const HA_SELECT_TOKENS = {
  trigger: {
    bg: '--ha-select-bg',
    color: '--ha-select-color',
    border: '--ha-select-border',
    placeholderColor: '--ha-select-placeholder-color',
    fontFamily: '--ha-select-font-family',
    fontWeight: '--ha-select-font-weight',
    lineHeight: '--ha-select-line-height',
    gap: '--ha-select-gap',
    paddingSm: '--ha-select-padding-sm',
    paddingMd: '--ha-select-padding-md',
    paddingLg: '--ha-select-padding-lg',
    fontSm: '--ha-select-font-sm',
    fontMd: '--ha-select-font-md',
    fontLg: '--ha-select-font-lg',
    minHeightSm: '--ha-select-min-height-sm',
    minHeightMd: '--ha-select-min-height-md',
    minHeightLg: '--ha-select-min-height-lg',
    radiusSm: '--ha-select-radius-sm',
    radiusMd: '--ha-select-radius-md',
    radiusLg: '--ha-select-radius-lg',
    focusBorder: '--ha-select-focus-border',
    focusRing: '--ha-select-focus-ring',
    focusRingOffset: '--ha-select-focus-ring-offset',
    errorBorder: '--ha-select-error-border',
    errorColor: '--ha-select-error-color',
    disabledBg: '--ha-select-disabled-bg',
    disabledColor: '--ha-select-disabled-color',
    disabledOpacity: '--ha-select-disabled-opacity',
    readonlyBg: '--ha-select-readonly-bg',
    readonlyBorder: '--ha-select-readonly-border',
    transitionDuration: '--ha-select-transition-duration',
    transitionEasing: '--ha-select-transition-easing',
  },

  panel: {
    panelBg: '--ha-select-panel-bg',
    panelBorder: '--ha-select-panel-border',
    panelRadius: '--ha-select-panel-radius',
    panelShadow: '--ha-select-panel-shadow',
    panelMaxHeight: '--ha-select-panel-max-height',
    panelPaddingY: '--ha-select-panel-padding-y',
    panelOffset: '--ha-select-panel-offset',
  },

  option: {
    optionColor: '--ha-select-option-color',
    optionBg: '--ha-select-option-bg',
    optionPaddingX: '--ha-select-option-padding-x',
    optionPaddingY: '--ha-select-option-padding-y',
    optionMinHeight: '--ha-select-option-min-height',
    optionFontSize: '--ha-select-option-font-size',
    optionHoverBg: '--ha-select-option-hover-bg',
    optionActiveBg: '--ha-select-option-active-bg',
    optionActiveColor: '--ha-select-option-active-color',
    optionSelectedBg: '--ha-select-option-selected-bg',
    optionSelectedColor: '--ha-select-option-selected-color',
    optionSelectedFontWeight: '--ha-select-option-selected-font-weight',
    optionDisabledColor: '--ha-select-option-disabled-color',
    optionDisabledOpacity: '--ha-select-option-disabled-opacity',
  },
} as const satisfies HaSelectTokens;
