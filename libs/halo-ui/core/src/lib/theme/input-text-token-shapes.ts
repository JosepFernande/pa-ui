/**
 * Canonical NAME-shape registry for the `--ha-input-*` design tokens. See
 * `component-token-shapes.ts` for why this lives under `theme/` instead of
 * inside `@halolib-ui/input-text` (module-boundary cycle avoidance) and
 * instead of under `foundation/` (the `no-raw-scale-in-theme-engine.spec.ts`
 * path check).
 */

/**
 * Shape of the `--ha-input-*` design tokens. Every key maps to the CSS
 * custom property name that carries its value, grouped by semantic concern.
 */
export interface HaInputTextTokens {
  readonly surface: {
    readonly bg: string;
    readonly color: string;
    readonly border: string;
    readonly placeholderColor: string;
  };

  readonly typography: {
    readonly fontFamily: string;
    readonly fontWeight: string;
    readonly lineHeight: string;
  };

  readonly sizing: {
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
  };

  readonly focus: {
    readonly focusBorder: string;
    readonly focusRing: string;
    readonly focusRingOffset: string;
  };

  readonly error: {
    readonly errorBorder: string;
    readonly errorColor: string;
    readonly errorIconColor: string;
  };

  readonly disabled: {
    readonly disabledBg: string;
    readonly disabledColor: string;
    readonly disabledOpacity: string;
  };

  readonly readonly: {
    readonly readonlyBg: string;
    readonly readonlyBorder: string;
  };

  readonly hint: {
    readonly hintColor: string;
    readonly hintFontSize: string;
  };

  readonly label: {
    readonly labelColor: string;
    readonly labelFontSize: string;
    readonly labelFontWeight: string;
  };

  readonly transition: {
    readonly transitionDuration: string;
    readonly transitionEasing: string;
  };
}

export const HA_INPUT_TEXT_TOKENS = {
  surface: {
    bg: '--ha-input-bg',
    color: '--ha-input-color',
    border: '--ha-input-border',
    placeholderColor: '--ha-input-placeholder-color',
  },

  typography: {
    fontFamily: '--ha-input-font-family',
    fontWeight: '--ha-input-font-weight',
    lineHeight: '--ha-input-line-height',
  },

  sizing: {
    paddingSm: '--ha-input-padding-sm',
    paddingMd: '--ha-input-padding-md',
    paddingLg: '--ha-input-padding-lg',
    fontSm: '--ha-input-font-sm',
    fontMd: '--ha-input-font-md',
    fontLg: '--ha-input-font-lg',
    minHeightSm: '--ha-input-min-height-sm',
    minHeightMd: '--ha-input-min-height-md',
    minHeightLg: '--ha-input-min-height-lg',
    radiusSm: '--ha-input-radius-sm',
    radiusMd: '--ha-input-radius-md',
    radiusLg: '--ha-input-radius-lg',
  },

  focus: {
    focusBorder: '--ha-input-focus-border',
    focusRing: '--ha-input-focus-ring',
    focusRingOffset: '--ha-input-focus-ring-offset',
  },

  error: {
    errorBorder: '--ha-input-error-border',
    errorColor: '--ha-input-error-color',
    errorIconColor: '--ha-input-error-icon-color',
  },

  disabled: {
    disabledBg: '--ha-input-disabled-bg',
    disabledColor: '--ha-input-disabled-color',
    disabledOpacity: '--ha-input-disabled-opacity',
  },

  readonly: {
    readonlyBg: '--ha-input-readonly-bg',
    readonlyBorder: '--ha-input-readonly-border',
  },

  hint: {
    hintColor: '--ha-input-hint-color',
    hintFontSize: '--ha-input-hint-font-size',
  },

  label: {
    labelColor: '--ha-input-label-color',
    labelFontSize: '--ha-input-label-font-size',
    labelFontWeight: '--ha-input-label-font-weight',
  },

  transition: {
    transitionDuration: '--ha-input-transition-duration',
    transitionEasing: '--ha-input-transition-easing',
  },
} as const satisfies HaInputTextTokens;
