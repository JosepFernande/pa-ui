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
 * every `minHeight`/`paddingX`/`radius` value below is ASSISTANT-AUTHORED
 * PLACEHOLDERS, explicitly requested by the user pending designer validation.
 * They are NOT Figma-confirmed; NO Figma source exists for Input.
 * `sm.minHeight` (33px) and the per-size `radius` values are explicit
 * user-provided values, not an 8px-step derivation like the rest of the scale
 * (`md.radius`/`lg.radius` happen to coincide with the foundation
 * `--radius-sm`/`--radius-md` steps, but are declared as literals here, not
 * `var()` references, since `sm.radius` has no foundation match).
 *
 * `foundation-css.spec.ts` asserts `theme.css` marks every declaration
 * sourced from this object as provisional — including `md`, because unlike
 * Button, no size is confirmed for Input.
 */
export const PA_INPUT_PROVISIONAL_DIMENSIONS = {
  sm: {
    minHeight: '33px',
    paddingX: '12px',
    radius: '6px',
  },
  md: {
    minHeight: '48px',
    paddingX: '16px',
    radius: '4px',
  },
  lg: {
    minHeight: '56px',
    paddingX: '20px',
    radius: '8px',
  },
} as const;
