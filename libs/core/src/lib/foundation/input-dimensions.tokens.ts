/**
 * Input dimension source data. Unlike Button — which has a Figma-confirmed
 * `md` row (`PA_BUTTON_FIGMA_DIMENSIONS`) and placeholder `sm`/`lg` — NO
 * Figma source exists for Input anywhere in
 * `pa-ui-default-theme-design-values`, so ALL sizes are placeholders.
 * Consumed by `component-defaults.tokens.ts` to build the `--pa-input-*`
 * defaults shipped in `theme.css`.
 *
 * `minHeight` is intentionally realized downstream as `min-height` (D6): a
 * fixed `height` would clip wrapped/long content. This file stores the raw
 * "height" concept; the CSS property choice is made by the consumer.
 */

/**
 * @deprecated-style banner (mirror of D5 point 2, adapted for Input):
 * every `minHeight`/`paddingX` value below is ASSISTANT-AUTHORED PLACEHOLDERS —
 * a standard 8px height-step / 4px padding-step progression — explicitly
 * requested by the user pending designer validation. They are NOT
 * Figma-confirmed; NO Figma source exists for Input.
 *
 * `foundation-css.spec.ts` asserts `theme.css` marks every declaration
 * sourced from this object as provisional — including `md`, because unlike
 * Button, no size is confirmed for Input.
 */
export const PA_INPUT_PROVISIONAL_DIMENSIONS = {
  sm: {
    minHeight: '40px',
    paddingX: '12px',
  },
  md: {
    minHeight: '48px',
    paddingX: '16px',
  },
  lg: {
    minHeight: '56px',
    paddingX: '20px',
  },
} as const;
