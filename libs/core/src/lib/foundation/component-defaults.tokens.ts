/**
 * Component-level token DEFAULTS shipped in `theme.css` — the values that
 * make `var(--pa-button-*)` resolve to something real out of the box
 * (Requirement: consumer imports foundation CSS, zero authored tokens).
 * Every value is a CSS-valid string: either a literal, or a `var(--x)`
 * reference into the foundation (unprefixed) or semantic (`--pa-*`) color
 * layer — component defaults are the one place foundation refs are used
 * directly, mirroring the Data Flow diagram in `design.md`.
 *
 * Scope note (deviation from a literal reading of D4's file table): only
 * `--pa-button-*` defaults are populated. `--pa-input-*` is deferred —
 * `libs/input/src/lib/` only declares `PA_INPUT_TOKENS` names; there is no
 * `input.component.css` consuming them yet (verified: no `.css` file under
 * `libs/input/src/lib/`), so there is no rendering surface to validate
 * invented Input defaults against. Populating ~30 Input CSS values with no
 * design source and no consumer would be speculative engineering; it is
 * intentionally left for whichever change actually ships an Input template.
 */
import {
  PA_BUTTON_FIGMA_DIMENSIONS,
  PA_BUTTON_PROVISIONAL_DIMENSIONS,
} from './button-dimensions.tokens';

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

export const PA_COMPONENT_TOKEN_DEFAULTS: Readonly<Record<string, string>> = {
  ...PA_BUTTON_TOKEN_DEFAULTS,
};
