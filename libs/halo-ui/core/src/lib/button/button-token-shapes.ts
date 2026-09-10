/**
 * Canonical NAME-shape registry for the `--ha-button-*` design tokens. See
 * `component-token-shapes.ts` for why this lives under `theme/` instead of
 * inside `@halolib-ui/button` (module-boundary cycle avoidance) and instead
 * of under `foundation/` (the `no-raw-scale-in-theme-engine.spec.ts` path
 * check).
 */

/**
 * Shape of the `--ha-button-*` design tokens. Every key maps to the CSS
 * custom property name that carries its value, grouped by semantic concern.
 */
export interface HaButtonTokens {
  readonly surface: {
    readonly bg: string;
    readonly color: string;
    readonly border: string;
    readonly radius: string;
    readonly solidColor: string;
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
    readonly minWidthSm: string;
    readonly minWidthMd: string;
    readonly minWidthLg: string;
    readonly gapSm: string;
    readonly gapMd: string;
    readonly gapLg: string;
    readonly radiusSm: string;
    readonly radiusMd: string;
    readonly radiusLg: string;
  };

  readonly focus: {
    readonly focusRing: string;
    readonly focusRingOffset: string;
  };

  readonly states: {
    readonly hoverBg: string;
    readonly activeBg: string;
    readonly disabledBg: string;
    readonly disabledColor: string;
    readonly disabledOpacity: string;
  };

  readonly transition: {
    readonly transitionDuration: string;
    readonly transitionEasing: string;
  };

  readonly loading: {
    readonly loadingColor: string;
    readonly spinnerSize: string;
    readonly spinnerBorder: string;
    readonly spinnerDuration: string;
  };

  readonly accessibility: {
    /** Visually-hidden screen reader only. */
    readonly srOnlyWidth: string;
    readonly srOnlyHeight: string;
    readonly srOnlyMargin: string;
  };
}

export const HA_BUTTON_TOKENS = {
  surface: {
    bg: '--ha-button-bg',
    color: '--ha-button-color',
    border: '--ha-button-border',
    radius: '--ha-button-radius',
    solidColor: '--ha-button-solid-color',
  },

  typography: {
    fontFamily: '--ha-button-font-family',
    fontWeight: '--ha-button-font-weight',
    lineHeight: '--ha-button-line-height',
  },

  sizing: {
    paddingSm: '--ha-button-padding-sm',
    paddingMd: '--ha-button-padding-md',
    paddingLg: '--ha-button-padding-lg',
    fontSm: '--ha-button-font-sm',
    fontMd: '--ha-button-font-md',
    fontLg: '--ha-button-font-lg',
    minHeightSm: '--ha-button-min-height-sm',
    minHeightMd: '--ha-button-min-height-md',
    minHeightLg: '--ha-button-min-height-lg',
    minWidthSm: '--ha-button-min-width-sm',
    minWidthMd: '--ha-button-min-width-md',
    minWidthLg: '--ha-button-min-width-lg',
    gapSm: '--ha-button-gap-sm',
    gapMd: '--ha-button-gap-md',
    gapLg: '--ha-button-gap-lg',
    radiusSm: '--ha-button-radius-sm',
    radiusMd: '--ha-button-radius-md',
    radiusLg: '--ha-button-radius-lg',
  },

  focus: {
    focusRing: '--ha-button-focus-ring',
    focusRingOffset: '--ha-button-focus-ring-offset',
  },

  states: {
    hoverBg: '--ha-button-hover-bg',
    activeBg: '--ha-button-active-bg',
    disabledBg: '--ha-button-disabled-bg',
    disabledColor: '--ha-button-disabled-color',
    disabledOpacity: '--ha-button-disabled-opacity',
  },

  transition: {
    transitionDuration: '--ha-button-transition-duration',
    transitionEasing: '--ha-button-transition-easing',
  },

  loading: {
    loadingColor: '--ha-button-loading-color',
    spinnerSize: '--ha-button-spinner-size',
    spinnerBorder: '--ha-button-spinner-border',
    spinnerDuration: '--ha-button-spinner-duration',
  },

  accessibility: {
    srOnlyWidth: '--ha-button-sr-only-width',
    srOnlyHeight: '--ha-button-sr-only-height',
    srOnlyMargin: '--ha-button-sr-only-margin',
  },
} as const satisfies HaButtonTokens;
