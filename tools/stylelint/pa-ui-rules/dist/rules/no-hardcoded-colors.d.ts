import type { Root, Result } from 'postcss';
/**
 * PostCSS plugin function for stylelint rule `pa-ui/no-hardcoded-colors`.
 *
 * Reports hardcoded color values: hex, rgb/rgba, hsl/hsla, and named CSS colors.
 * Token references via `var(--*)` are allowed. `transparent` and `currentColor` are allowed.
 *
 * Report-only — no auto-fix.
 */
export declare function ruleFunction(root: Root, result: Result): void;
