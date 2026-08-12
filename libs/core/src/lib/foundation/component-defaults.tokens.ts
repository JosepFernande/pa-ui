/**
 * Component-level token DEFAULTS shipped in `theme.css` — the values that
 * make `var(--pa-*-*)` resolve to something real out of the box
 * (Requirement: consumer imports foundation CSS, zero authored tokens).
 * Every value is a CSS-valid string: either a literal, or a `var(--x)`
 * reference into the foundation (unprefixed) or semantic (`--pa-*`) color
 * layer — component defaults are the one place foundation refs are used
 * directly, mirroring the Data Flow diagram in `design.md`.
 *
 * Scope note: both `--pa-button-*` and `--pa-input-*` defaults are populated
 * here. The `--pa-input-*` defaults were previously deferred until a real
 * Input template shipped — that deferral ends with the `PaInput` component
 * (`libs/input/src/lib/input.component.css`). ALL Input dimensions
 * (`padding-*`, `min-height-*`) come from `PA_INPUT_PROVISIONAL_DIMENSIONS`
 * — assistant-authored, pending design validation (no Figma source exists
 * for Input), unlike Button whose `md` row is Figma-confirmed.
 */
import {
  PA_BUTTON_FIGMA_DIMENSIONS,
  PA_BUTTON_PROVISIONAL_DIMENSIONS,
} from './button-dimensions.tokens';
import { PA_INPUT_PROVISIONAL_DIMENSIONS } from './input-dimensions.tokens';

/**
 * Every `--pa-button-*` custom property currently referenced by
 * `libs/button/src/lib/button.component.css`, plus the forward-looking
 * per-size `min-width`/`gap` pair that `button.tokens.ts` will name in
 * Phase 3 (additive; unused until Phase 3 wires the CSS rule that consumes
 * them — declaring the default now costs nothing and needs no follow-up
 * edit to this file).
 */
const PA_BUTTON_TOKEN_DEFAULTS: Readonly<Record<string, string>> = {
  '--pa-button-bg': 'var(--pa-primary)',
  '--pa-button-color': 'var(--pa-primary-contrast)',
  '--pa-button-border': '1px solid var(--pa-primary)',
  '--pa-button-radius': PA_BUTTON_FIGMA_DIMENSIONS.md.radius,
  '--pa-button-gap': `var(--gap-sm)`,
  '--pa-button-font-family': 'var(--font-family)',
  '--pa-button-font-weight': 'var(--font-weight-semibold)',
  '--pa-button-line-height': 'var(--line-height-body)',

  '--pa-button-padding-sm': `0 ${PA_BUTTON_PROVISIONAL_DIMENSIONS.sm.paddingX}`,
  '--pa-button-padding-md': `0 ${PA_BUTTON_FIGMA_DIMENSIONS.md.paddingX}`,
  '--pa-button-padding-lg': `0 ${PA_BUTTON_PROVISIONAL_DIMENSIONS.lg.paddingX}`,

  '--pa-button-font-sm': 'var(--font-size-small-body)',
  '--pa-button-font-md': 'var(--font-size-body)',
  '--pa-button-font-lg': 'var(--font-size-body)',

  '--pa-button-min-height-sm': PA_BUTTON_PROVISIONAL_DIMENSIONS.sm.minHeight,
  '--pa-button-min-height-md': PA_BUTTON_FIGMA_DIMENSIONS.md.minHeight,
  '--pa-button-min-height-lg': PA_BUTTON_PROVISIONAL_DIMENSIONS.lg.minHeight,

  '--pa-button-min-width-sm': PA_BUTTON_PROVISIONAL_DIMENSIONS.sm.minWidth,
  '--pa-button-min-width-md': PA_BUTTON_FIGMA_DIMENSIONS.md.minWidth,
  '--pa-button-min-width-lg': PA_BUTTON_PROVISIONAL_DIMENSIONS.lg.minWidth,

  '--pa-button-gap-sm': PA_BUTTON_PROVISIONAL_DIMENSIONS.sm.gap,
  '--pa-button-gap-md': PA_BUTTON_FIGMA_DIMENSIONS.md.gap,
  '--pa-button-gap-lg': PA_BUTTON_PROVISIONAL_DIMENSIONS.lg.gap,

  '--pa-button-focus-ring': '0 0 0 3px var(--pa-primary-hover)',
  '--pa-button-hover-bg': 'var(--pa-primary-hover)',
  '--pa-button-active-bg': 'var(--pa-primary-active)',
  '--pa-button-disabled-bg': 'var(--neutral-200)',
  '--pa-button-disabled-color': 'var(--neutral-500)',
  '--pa-button-disabled-opacity': '0.6',
  '--pa-button-solid-color': 'var(--pa-primary-contrast)',
  '--pa-button-transition-duration': '150ms',
  '--pa-button-transition-easing': 'ease-in-out',
  '--pa-button-loading-color': 'var(--pa-primary-contrast)',
  '--pa-button-spinner-size': '1em',
  '--pa-button-spinner-border': '2px solid currentColor',
  '--pa-button-spinner-duration': '600ms',
  '--pa-button-sr-only-width': '1px',
  '--pa-button-sr-only-height': '1px',
  '--pa-button-sr-only-margin': '-1px',
};

/**
 * Every `--pa-input-*` custom property referenced by
 * `libs/input/src/lib/input.component.css`. Values mirror the Button
 * defaults where the semantics match (font/transition/disabled) and use
 * foundation + semantic references otherwise. Dimension values (padding,
 * min-height) come from `PA_INPUT_PROVISIONAL_DIMENSIONS`.
 */
const PA_INPUT_TOKEN_DEFAULTS: Readonly<Record<string, string>> = {
  '--pa-input-bg': 'var(--neutral-50)',
  '--pa-input-color': 'var(--neutral-900)',
  '--pa-input-border': '1px solid var(--neutral-700)',
  '--pa-input-font-family': 'var(--font-family)',
  '--pa-input-font-weight': 'var(--font-weight-regular)',
  '--pa-input-line-height': 'var(--line-height-body)',

  '--pa-input-padding-sm': `0 ${PA_INPUT_PROVISIONAL_DIMENSIONS.sm.paddingX}`,
  '--pa-input-padding-md': `0 ${PA_INPUT_PROVISIONAL_DIMENSIONS.md.paddingX}`,
  '--pa-input-padding-lg': `0 ${PA_INPUT_PROVISIONAL_DIMENSIONS.lg.paddingX}`,

  '--pa-input-font-sm': 'var(--font-size-small-body)',
  '--pa-input-font-md': 'var(--font-size-body)',
  '--pa-input-font-lg': 'var(--font-size-body)',

  '--pa-input-min-height-sm': PA_INPUT_PROVISIONAL_DIMENSIONS.sm.minHeight,
  '--pa-input-min-height-md': PA_INPUT_PROVISIONAL_DIMENSIONS.md.minHeight,
  '--pa-input-min-height-lg': PA_INPUT_PROVISIONAL_DIMENSIONS.lg.minHeight,

  '--pa-input-radius-sm': PA_INPUT_PROVISIONAL_DIMENSIONS.sm.radius,
  '--pa-input-radius-md': PA_INPUT_PROVISIONAL_DIMENSIONS.md.radius,
  '--pa-input-radius-lg': PA_INPUT_PROVISIONAL_DIMENSIONS.lg.radius,

  '--pa-input-focus-border': 'var(--pa-primary)',
  '--pa-input-error-border': 'var(--pa-error)',
  '--pa-input-error-color': 'var(--pa-error)',
  '--pa-input-error-icon-color': 'var(--pa-error)',
  '--pa-input-disabled-bg': 'var(--neutral-200)',
  '--pa-input-disabled-color': 'var(--neutral-500)',
  '--pa-input-disabled-opacity': '0.6',
  '--pa-input-readonly-bg': 'var(--neutral-50)',
  '--pa-input-readonly-border': '1px solid var(--neutral-200)',
  '--pa-input-hint-color': 'var(--neutral-500)',
  '--pa-input-hint-font-size': 'var(--font-size-caption)',
  '--pa-input-label-color': 'var(--neutral-700)',
  '--pa-input-label-font-size': 'var(--font-size-small-body)',
  '--pa-input-label-font-weight': 'var(--font-weight-semibold)',
  '--pa-input-transition-duration': '150ms',
  '--pa-input-transition-easing': 'ease-in-out',
  '--pa-input-placeholder-color': 'var(--neutral-500)',
};

/**
 * Every `--pa-select-*` custom property named by `PA_SELECT_TOKENS`
 * (`libs/select/src/lib/select.tokens.ts`). Trigger `padding*`/`min-height*`/
 * `radius*` reuse `PA_INPUT_PROVISIONAL_DIMENSIONS` verbatim (a select
 * trigger MUST match input field metrics exactly; a copied table would
 * drift). Panel/option defaults are literals or foundation/semantic
 * references — none of them are sourced from `PA_INPUT_PROVISIONAL_DIMENSIONS`,
 * so none of them carry the provisional marker in `theme.css`.
 * `--pa-select-panel-shadow` has no foundation shadow token to reference —
 * it ships as a literal (precedent: `--pa-button-focus-ring`), flagged for
 * designer validation in `design.md`'s Open Questions.
 * `--pa-select-panel-max-height` and `--pa-select-option-min-height` are
 * likewise structural literals with no matching foundation scale entry —
 * same class as `--pa-button-spinner-size`/`--pa-button-sr-only-width`
 * above, which ship as fixed literals for the same reason. Both are v1
 * defaults, flagged for designer validation alongside the panel shadow.
 */
const PA_SELECT_TOKEN_DEFAULTS: Readonly<Record<string, string>> = {
  '--pa-select-bg': 'var(--neutral-50)',
  '--pa-select-color': 'var(--neutral-900)',
  '--pa-select-border': '1px solid var(--neutral-700)',
  '--pa-select-font-family': 'var(--font-family)',
  '--pa-select-font-weight': 'var(--font-weight-regular)',
  '--pa-select-line-height': 'var(--line-height-body)',

  '--pa-select-padding-sm': `0 ${PA_INPUT_PROVISIONAL_DIMENSIONS.sm.paddingX}`,
  '--pa-select-padding-md': `0 ${PA_INPUT_PROVISIONAL_DIMENSIONS.md.paddingX}`,
  '--pa-select-padding-lg': `0 ${PA_INPUT_PROVISIONAL_DIMENSIONS.lg.paddingX}`,

  '--pa-select-font-sm': 'var(--font-size-small-body)',
  '--pa-select-font-md': 'var(--font-size-body)',
  '--pa-select-font-lg': 'var(--font-size-body)',

  '--pa-select-min-height-sm': PA_INPUT_PROVISIONAL_DIMENSIONS.sm.minHeight,
  '--pa-select-min-height-md': PA_INPUT_PROVISIONAL_DIMENSIONS.md.minHeight,
  '--pa-select-min-height-lg': PA_INPUT_PROVISIONAL_DIMENSIONS.lg.minHeight,

  '--pa-select-radius-sm': PA_INPUT_PROVISIONAL_DIMENSIONS.sm.radius,
  '--pa-select-radius-md': PA_INPUT_PROVISIONAL_DIMENSIONS.md.radius,
  '--pa-select-radius-lg': PA_INPUT_PROVISIONAL_DIMENSIONS.lg.radius,

  '--pa-select-placeholder-color': 'var(--neutral-500)',
  '--pa-select-focus-border': 'var(--pa-primary)',
  '--pa-select-error-border': 'var(--pa-error)',
  '--pa-select-error-color': 'var(--pa-error)',
  '--pa-select-disabled-bg': 'var(--neutral-200)',
  '--pa-select-disabled-color': 'var(--neutral-500)',
  '--pa-select-disabled-opacity': '0.6',
  '--pa-select-readonly-bg': 'var(--neutral-50)',
  '--pa-select-readonly-border': '1px solid var(--neutral-200)',
  '--pa-select-transition-duration': '150ms',
  '--pa-select-transition-easing': 'ease-in-out',
  '--pa-select-gap': 'var(--gap-sm)',
  '--pa-select-icon-color': 'var(--neutral-700)',
  '--pa-select-icon-size': 'var(--icon-size-sm)',

  '--pa-select-panel-bg': 'var(--neutral-50)',
  '--pa-select-panel-border': '1px solid var(--neutral-200)',
  '--pa-select-panel-radius': 'var(--radius-sm)',
  '--pa-select-panel-shadow': '0 4px 12px rgba(0, 0, 0, 0.15)',
  '--pa-select-panel-max-height': '320px', // v1 literal, no foundation scale match (see file banner)
  '--pa-select-panel-padding-y': 'var(--gap-xs)',
  '--pa-select-panel-offset': 'var(--gap-xs)',

  '--pa-select-option-color': 'var(--neutral-900)',
  '--pa-select-option-bg': 'transparent',
  '--pa-select-option-padding-x': 'var(--spacing-md)',
  '--pa-select-option-padding-y': 'var(--spacing-sm)',
  '--pa-select-option-min-height': '40px', // v1 literal, no foundation scale match (see file banner)
  '--pa-select-option-font-size': 'var(--font-size-body)',
  '--pa-select-option-hover-bg': 'var(--neutral-200)',
  '--pa-select-option-active-bg': 'var(--neutral-200)',
  '--pa-select-option-active-color': 'var(--neutral-900)',
  '--pa-select-option-selected-bg': 'var(--pa-primary-hover)',
  '--pa-select-option-selected-color': 'var(--pa-primary-contrast)',
  '--pa-select-option-selected-font-weight': 'var(--font-weight-semibold)',
  '--pa-select-option-disabled-color': 'var(--neutral-500)',
  '--pa-select-option-disabled-opacity': '0.6',
};

export const PA_COMPONENT_TOKEN_DEFAULTS: Readonly<Record<string, string>> = {
  ...PA_BUTTON_TOKEN_DEFAULTS,
  ...PA_INPUT_TOKEN_DEFAULTS,
  ...PA_SELECT_TOKEN_DEFAULTS,
};
