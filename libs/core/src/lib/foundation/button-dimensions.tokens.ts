/**
 * Button dimension source data (D5), split into a Figma-confirmed set and a
 * placeholder set — physically separate constants so a reader cannot
 * mistake one for the other (D5 point 1). Consumed by
 * `component-defaults.tokens.ts` to build the `--pa-button-*` defaults
 * shipped in `theme.css`.
 *
 * `height` is intentionally realized downstream as `min-height` (D6): a
 * fixed `height` would clip a wrapped/long/i18n label. This file stores the
 * raw "height" concept from Figma; the CSS property choice is made by the
 * consumer of these values.
 */

/**
 * Figma-confirmed `md` Button dimensions (`pa-ui-default-theme-design-values`).
 * `radius` (4px) is constant across all 3 sizes — also re-used verbatim by
 * `sm`/`lg` in `PA_BUTTON_PROVISIONAL_DIMENSIONS`.
 */
export const PA_BUTTON_FIGMA_DIMENSIONS = {
  md: {
    minHeight: '48px',
    minWidth: '224px',
    radius: '4px',
    paddingX: '16px',
    gap: '10px',
  },
} as const;

/**
 * @deprecated-style banner (D5 point 2): `minHeight`/`paddingX`/`gap` for
 * `sm` and `lg` are ASSISTANT-AUTHORED PLACEHOLDERS — a standard 8px
 * height-step / 4px padding-step / 2px gap-step progression around the
 * Figma-confirmed `md` row — explicitly requested by the user pending
 * designer validation (`pa-ui-default-theme-design-values`). They are NOT
 * Figma-confirmed.
 *
 * `minWidth` for `sm` (200px) and `lg` (280px) IS Figma-confirmed and is
 * intentionally NOT flagged placeholder, even though it lives in this same
 * object next to placeholder siblings — `foundation-css.spec.ts` asserts
 * `theme.css` marks only the placeholder-sourced declarations as
 * provisional, never `min-width`.
 */
export const PA_BUTTON_PROVISIONAL_DIMENSIONS = {
  sm: {
    minHeight: '40px',
    minWidth: '200px',
    radius: '4px',
    paddingX: '12px',
    gap: '8px',
  },
  lg: {
    minHeight: '56px',
    minWidth: '280px',
    radius: '4px',
    paddingX: '20px',
    gap: '12px',
  },
} as const;
