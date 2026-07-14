import type { Root, Result } from 'postcss';
/**
 * PostCSS plugin function for stylelint rule `pa-ui/no-important-outside-host`.
 *
 * `!important` is only allowed inside `:host` or `:host(...)` scopes.
 * Any `!important` outside these scopes is reported.
 *
 * Report-only — no auto-fix.
 */
export declare function ruleFunction(root: Root, result: Result): void;
