import type { Root, Result } from 'postcss';
/**
 * PostCSS plugin function for stylelint rule `pa-ui/pa-prefix-selector`.
 *
 * Enforces that every CSS selector starts with `.pa-` or `pa-`.
 * `:host` and `:host(...)` selectors are exempt.
 *
 * Report-only — no auto-fix.
 */
export declare function ruleFunction(root: Root, result: Result): void;
