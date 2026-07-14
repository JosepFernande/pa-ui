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
export function ruleFunction(root, result) {
    root.walkRules((node) => {
        const selector = node.selector;
        if (!selector)
            return;
        // 1. Check for ::ng-deep in the selector
        if (selector.includes('::ng-deep')) {
            result.warn(`"::ng-deep" is banned. Use component CSS custom properties (tokens) for style overrides. (pa-ui/no-ng-deep-host-context)`, { node, word: '::ng-deep' });
            return; // Don't report multiple times on the same rule
        }
        // 2. Check for :host-context usage
        if (selector.includes(':host-context')) {
            // Walk declarations inside this rule
            let hasNonTokenDecl = false;
            node.walkDecls((decl) => {
                // Custom properties (--*) are always allowed inside :host-context
                if (decl.prop.startsWith('--'))
                    return;
                // Non-custom-property declaration found
                hasNonTokenDecl = true;
            });
            if (hasNonTokenDecl) {
                result.warn(`":host-context()" is only allowed for CSS custom property (token) overrides. Found non-"----" declarations. (pa-ui/no-ng-deep-host-context)`, { node, word: ':host-context' });
            }
        }
    });
}
