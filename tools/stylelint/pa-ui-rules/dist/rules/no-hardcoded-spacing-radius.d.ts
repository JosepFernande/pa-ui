import type { Root, Result } from 'postcss';
/**
 * PostCSS plugin function for stylelint rule `pa-ui/no-hardcoded-spacing-radius`.
 *
 * Reports hardcoded spacing (px, rem, em) in margin, padding, gap,
 * border-radius, width, and height properties.
 * Zero values are allowed. Token references via `var(--*)` are allowed.
 *
 * Report-only — no auto-fix.
 */
export declare function ruleFunction(root: Root, result: Result): void;
