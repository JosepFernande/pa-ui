/**
 * Component-level token DEFAULTS shipped in `theme.css` — the values that
 * make `var(--ha-*-*)` resolve to something real out of the box
 * (Requirement: consumer imports foundation CSS, zero authored tokens).
 * Every value is a CSS-valid string: either a literal, or a `var(--x)`
 * reference into the foundation (unprefixed) or semantic (`--ha-*`) color
 * layer — component defaults are the one place foundation refs are used
 * directly, mirroring the Data Flow diagram in `design.md`.
 *
 * Scope note: both `--ha-button-*` and `--ha-input-*` defaults are populated
 * here. The `--ha-input-*` defaults were previously deferred until a real
 * Input template shipped — that deferral ends with the `HaInputText` component
 * (`libs/input-text/src/lib/input-text.component.css`). ALL Input dimensions
 * (`padding-*`, `min-height-*`) come from `HA_INPUT_PROVISIONAL_DIMENSIONS`
 * — assistant-authored, pending design validation (no Figma source exists
 * for Input), unlike Button whose `md` row is Figma-confirmed.
 */
import {
  HA_BUTTON_FIGMA_DIMENSIONS,
  HA_BUTTON_PROVISIONAL_DIMENSIONS,
} from './button-dimensions.tokens';
import { HA_INPUT_PROVISIONAL_DIMENSIONS } from './input-dimensions.tokens';

/**
 * Every `--ha-button-*` custom property referenced by
 * `libs/button/src/lib/button.component.css`, including the per-size
 * `min-width`/`gap` pair consumed by its `.ha-button--sm/md/lg` rules.
 */
const HA_BUTTON_TOKEN_DEFAULTS: Readonly<Record<string, string>> = {
  '--ha-button-bg': 'var(--ha-primary)',
  '--ha-button-color': 'var(--ha-primary-contrast)',
  '--ha-button-border': '1px solid var(--ha-primary)',
  '--ha-button-radius': HA_BUTTON_FIGMA_DIMENSIONS.md.radius,
  '--ha-button-gap': `var(--gap-sm)`,
  '--ha-button-font-family': 'var(--font-family)',
  '--ha-button-font-weight': 'var(--font-weight-semibold)',
  '--ha-button-line-height': 'var(--line-height-body)',

  '--ha-button-padding-sm': `0 ${HA_BUTTON_PROVISIONAL_DIMENSIONS.sm.paddingX}`,
  '--ha-button-padding-md': `0 ${HA_BUTTON_FIGMA_DIMENSIONS.md.paddingX}`,
  '--ha-button-padding-lg': `0 ${HA_BUTTON_PROVISIONAL_DIMENSIONS.lg.paddingX}`,

  '--ha-button-font-sm': 'var(--font-size-small-body)',
  '--ha-button-font-md': 'var(--font-size-body)',
  '--ha-button-font-lg': 'var(--font-size-body)',

  '--ha-button-min-height-sm': HA_BUTTON_PROVISIONAL_DIMENSIONS.sm.minHeight,
  '--ha-button-min-height-md': HA_BUTTON_FIGMA_DIMENSIONS.md.minHeight,
  '--ha-button-min-height-lg': HA_BUTTON_PROVISIONAL_DIMENSIONS.lg.minHeight,

  '--ha-button-min-width-sm': HA_BUTTON_PROVISIONAL_DIMENSIONS.sm.minWidth,
  '--ha-button-min-width-md': HA_BUTTON_FIGMA_DIMENSIONS.md.minWidth,
  '--ha-button-min-width-lg': HA_BUTTON_PROVISIONAL_DIMENSIONS.lg.minWidth,

  '--ha-button-gap-sm': HA_BUTTON_PROVISIONAL_DIMENSIONS.sm.gap,
  '--ha-button-gap-md': HA_BUTTON_FIGMA_DIMENSIONS.md.gap,
  '--ha-button-gap-lg': HA_BUTTON_PROVISIONAL_DIMENSIONS.lg.gap,

  '--ha-button-focus-ring': '2px solid var(--ha-primary-hover)',
  '--ha-button-focus-ring-offset': '5px',
  '--ha-button-hover-bg': 'var(--ha-primary-hover)',
  '--ha-button-active-bg': 'var(--ha-primary-active)',
  '--ha-button-disabled-bg': 'var(--neutral-200)',
  '--ha-button-disabled-color': 'var(--neutral-500)',
  '--ha-button-disabled-opacity': '0.6',
  '--ha-button-solid-color': 'var(--ha-primary-contrast)',
  '--ha-button-transition-duration': '150ms',
  '--ha-button-transition-easing': 'ease-in-out',
  '--ha-button-loading-color': 'var(--ha-primary-contrast)',
  '--ha-button-spinner-size': '1em',
  '--ha-button-spinner-border': '2px solid currentColor',
  '--ha-button-spinner-duration': '600ms',
  '--ha-button-sr-only-width': '1px',
  '--ha-button-sr-only-height': '1px',
  '--ha-button-sr-only-margin': '-1px',
};

/**
 * Every `--ha-input-*` custom property referenced by
 * `libs/input-text/src/lib/input-text.component.css`. Values mirror the Button
 * defaults where the semantics match (font/transition/disabled) and use
 * foundation + semantic references otherwise. Dimension values (padding,
 * min-height) come from `HA_INPUT_PROVISIONAL_DIMENSIONS`.
 */
const HA_INPUT_TOKEN_DEFAULTS: Readonly<Record<string, string>> = {
  '--ha-input-bg': 'var(--neutral-50)',
  '--ha-input-color': 'var(--neutral-900)',
  '--ha-input-border': '1px solid var(--neutral-700)',
  '--ha-input-font-family': 'var(--font-family)',
  '--ha-input-font-weight': 'var(--font-weight-regular)',
  '--ha-input-line-height': 'var(--line-height-body)',

  '--ha-input-padding-sm': `0 ${HA_INPUT_PROVISIONAL_DIMENSIONS.sm.paddingX}`,
  '--ha-input-padding-md': `0 ${HA_INPUT_PROVISIONAL_DIMENSIONS.md.paddingX}`,
  '--ha-input-padding-lg': `0 ${HA_INPUT_PROVISIONAL_DIMENSIONS.lg.paddingX}`,

  '--ha-input-font-sm': 'var(--font-size-small-body)',
  '--ha-input-font-md': 'var(--font-size-body)',
  '--ha-input-font-lg': 'var(--font-size-body)',

  '--ha-input-min-height-sm': HA_INPUT_PROVISIONAL_DIMENSIONS.sm.minHeight,
  '--ha-input-min-height-md': HA_INPUT_PROVISIONAL_DIMENSIONS.md.minHeight,
  '--ha-input-min-height-lg': HA_INPUT_PROVISIONAL_DIMENSIONS.lg.minHeight,

  '--ha-input-radius-sm': HA_INPUT_PROVISIONAL_DIMENSIONS.sm.radius,
  '--ha-input-radius-md': HA_INPUT_PROVISIONAL_DIMENSIONS.md.radius,
  '--ha-input-radius-lg': HA_INPUT_PROVISIONAL_DIMENSIONS.lg.radius,

  '--ha-input-focus-border': 'var(--ha-primary)',
  '--ha-input-focus-ring': '2px solid var(--ha-primary-hover)',
  '--ha-input-focus-ring-offset': '5px',
  '--ha-input-error-border': 'var(--ha-error)',
  '--ha-input-error-color': 'var(--ha-error)',
  '--ha-input-error-icon-color': 'var(--ha-error)',
  '--ha-input-disabled-bg': 'var(--neutral-200)',
  '--ha-input-disabled-color': 'var(--neutral-500)',
  '--ha-input-disabled-opacity': '0.6',
  '--ha-input-readonly-bg': 'var(--neutral-50)',
  '--ha-input-readonly-border': '1px solid var(--neutral-200)',
  '--ha-input-hint-color': 'var(--neutral-500)',
  '--ha-input-hint-font-size': 'var(--font-size-caption)',
  '--ha-input-label-color': 'var(--neutral-700)',
  '--ha-input-label-font-size': 'var(--font-size-small-body)',
  '--ha-input-label-font-weight': 'var(--font-weight-semibold)',
  '--ha-input-transition-duration': '150ms',
  '--ha-input-transition-easing': 'ease-in-out',
  '--ha-input-placeholder-color': 'var(--neutral-500)',
};

/**
 * Every `--ha-select-*` custom property named by `HA_SELECT_TOKENS`
 * (`libs/select/src/lib/select.tokens.ts`). Trigger `padding*`/`min-height*`/
 * `radius*` reuse `HA_INPUT_PROVISIONAL_DIMENSIONS` verbatim (a select
 * trigger MUST match input field metrics exactly; a copied table would
 * drift). Panel/option defaults are literals or foundation/semantic
 * references — none of them are sourced from `HA_INPUT_PROVISIONAL_DIMENSIONS`,
 * so none of them carry the provisional marker in `theme.css`.
 * `--ha-select-panel-shadow` has no foundation shadow token to reference —
 * it ships as a literal (precedent: `--ha-button-focus-ring`), flagged for
 * designer validation in `design.md`'s Open Questions.
 * `--ha-select-panel-max-height` and `--ha-select-option-min-height` are
 * likewise structural literals with no matching foundation scale entry —
 * same class as `--ha-button-spinner-size`/`--ha-button-sr-only-width`
 * above, which ship as fixed literals for the same reason. Both are v1
 * defaults, flagged for designer validation alongside the panel shadow.
 */
const HA_SELECT_TOKEN_DEFAULTS: Readonly<Record<string, string>> = {
  '--ha-select-bg': 'var(--neutral-50)',
  '--ha-select-color': 'var(--neutral-900)',
  '--ha-select-border': '1px solid var(--neutral-700)',
  '--ha-select-font-family': 'var(--font-family)',
  '--ha-select-font-weight': 'var(--font-weight-regular)',
  '--ha-select-line-height': 'var(--line-height-body)',

  '--ha-select-padding-sm': `0 ${HA_INPUT_PROVISIONAL_DIMENSIONS.sm.paddingX}`,
  '--ha-select-padding-md': `0 ${HA_INPUT_PROVISIONAL_DIMENSIONS.md.paddingX}`,
  '--ha-select-padding-lg': `0 ${HA_INPUT_PROVISIONAL_DIMENSIONS.lg.paddingX}`,

  '--ha-select-font-sm': 'var(--font-size-small-body)',
  '--ha-select-font-md': 'var(--font-size-body)',
  '--ha-select-font-lg': 'var(--font-size-body)',

  '--ha-select-min-height-sm': HA_INPUT_PROVISIONAL_DIMENSIONS.sm.minHeight,
  '--ha-select-min-height-md': HA_INPUT_PROVISIONAL_DIMENSIONS.md.minHeight,
  '--ha-select-min-height-lg': HA_INPUT_PROVISIONAL_DIMENSIONS.lg.minHeight,

  '--ha-select-radius-sm': HA_INPUT_PROVISIONAL_DIMENSIONS.sm.radius,
  '--ha-select-radius-md': HA_INPUT_PROVISIONAL_DIMENSIONS.md.radius,
  '--ha-select-radius-lg': HA_INPUT_PROVISIONAL_DIMENSIONS.lg.radius,

  '--ha-select-placeholder-color': 'var(--neutral-500)',
  '--ha-select-focus-border': 'var(--ha-primary)',
  '--ha-select-focus-ring': '2px solid var(--ha-primary-hover)',
  '--ha-select-focus-ring-offset': '5px',
  '--ha-select-error-border': 'var(--ha-error)',
  '--ha-select-error-color': 'var(--ha-error)',
  '--ha-select-disabled-bg': 'var(--neutral-200)',
  '--ha-select-disabled-color': 'var(--neutral-500)',
  '--ha-select-disabled-opacity': '0.6',
  '--ha-select-readonly-bg': 'var(--neutral-50)',
  '--ha-select-readonly-border': '1px solid var(--neutral-200)',
  '--ha-select-transition-duration': '150ms',
  '--ha-select-transition-easing': 'ease-in-out',
  '--ha-select-gap': 'var(--gap-sm)',

  '--ha-select-panel-bg': 'var(--neutral-50)',
  '--ha-select-panel-border': '1px solid var(--neutral-200)',
  '--ha-select-panel-radius': 'var(--radius-sm)',
  '--ha-select-panel-shadow': '0 4px 12px rgba(0, 0, 0, 0.15)',
  '--ha-select-panel-max-height': '320px', // v1 literal, no foundation scale match (see file banner)
  '--ha-select-panel-padding-y': 'var(--gap-xs)',
  '--ha-select-panel-offset': 'var(--gap-xs)',

  '--ha-select-option-color': 'var(--neutral-900)',
  '--ha-select-option-bg': 'transparent',
  '--ha-select-option-padding-x': 'var(--spacing-md)',
  '--ha-select-option-padding-y': 'var(--spacing-sm)',
  '--ha-select-option-min-height': '40px', // v1 literal, no foundation scale match (see file banner)
  '--ha-select-option-font-size': 'var(--font-size-body)',
  '--ha-select-option-hover-bg': 'var(--neutral-200)',
  '--ha-select-option-active-bg': 'var(--neutral-200)',
  '--ha-select-option-active-color': 'var(--neutral-900)',
  '--ha-select-option-selected-bg': 'var(--ha-primary-hover)',
  '--ha-select-option-selected-color': 'var(--ha-primary-contrast)',
  '--ha-select-option-selected-font-weight': 'var(--font-weight-semibold)',
  '--ha-select-option-disabled-color': 'var(--neutral-500)',
  '--ha-select-option-disabled-opacity': '0.6',
};

export const HA_COMPONENT_TOKEN_DEFAULTS: Readonly<Record<string, string>> = {
  ...HA_BUTTON_TOKEN_DEFAULTS,
  ...HA_INPUT_TOKEN_DEFAULTS,
  ...HA_SELECT_TOKEN_DEFAULTS,
};
