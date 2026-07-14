import type { Root, Result } from 'postcss';
/**
 * PostCSS plugin function for stylelint rules `pa-ui/no-ng-deep-host-context`.
 *
 * Reports:
 * 1. Any use of `::ng-deep` — permanently banned.
 * 2. `:host-context(...)` used for anything other than CSS custom property
 *    (token) overrides. Inside a `:host-context` block, ONLY `--*` custom
 *    property declarations are allowed.
 *
 * Report-only — no auto-fix.
 */
export declare function ruleFunction(root: Root, result: Result): void;
