import type { Root, Result } from 'postcss';
/**
 * PostCSS plugin function for stylelint rule `halo-ui/prefix-selector`.
 *
 * Enforces that every CSS selector starts with one of the configured prefixes
 * (default `['ha-']`, matching `.<prefix>` or `<prefix>` forms).
 * `:host` and `:host(...)` selectors are exempt.
 *
 * Report-only — no auto-fix.
 */
export declare function ruleFunction(root: Root, result: Result, secondary?: {
    prefixes?: string[];
}): void;
