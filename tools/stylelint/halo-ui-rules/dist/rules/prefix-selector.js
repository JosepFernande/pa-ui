/**
 * Returns true if the given node lives inside an @keyframes at-rule.
 */
function isInsideKeyframes(node) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parent = node.parent;
    while (parent) {
        if (parent.type === 'atrule' && parent.name === 'keyframes') {
            return true;
        }
        parent = parent.parent;
    }
    return false;
}
/**
 * Checks whether a token looks like a simple selector that should have a ha- prefix.
 * Skips pseudo-classes, pseudo-elements, attributes, combinators, and universal selectors.
 */
function isSimpleSelector(token) {
    // Combinators
    if (token === '>' || token === '+' || token === '~' || token === '/' || token === '*')
        return false;
    // Pseudo-classes and pseudo-elements
    if (token.startsWith(':') || token.startsWith('::'))
        return false;
    // Attribute selectors
    if (token.startsWith('['))
        return false;
    return true;
}
/**
 * PostCSS plugin function for stylelint rule `halo-ui/prefix-selector`.
 *
 * Enforces that every CSS selector starts with one of the configured prefixes
 * (default `['ha-']`, matching `.<prefix>` or `<prefix>` forms).
 * `:host` and `:host(...)` selectors are exempt.
 *
 * Report-only — no auto-fix.
 */
export function ruleFunction(root, result, secondary) {
    const prefixes = secondary?.prefixes?.length ? secondary.prefixes : ['ha-'];
    const expectedLabel = prefixes.map((p) => `".${p}" or "${p}"`).join(' or ');
    root.walkRules((node) => {
        // Skip rules inside @keyframes (to, from, percentage selectors)
        if (isInsideKeyframes(node))
            return;
        const rawSelector = node.selector;
        if (!rawSelector)
            return;
        // Split by comma first, then by whitespace to get individual selector tokens
        const commaGroups = rawSelector.split(',');
        for (const group of commaGroups) {
            const tokens = group.trim().split(/\s+/).filter(Boolean);
            for (const token of tokens) {
                // Skip non-selector tokens
                if (!isSimpleSelector(token))
                    continue;
                // Exempt :host and :host(...) (already handled by isSimpleSelector starting with `:` but be explicit)
                if (token.startsWith(':host'))
                    continue;
                // Check that the selector token starts with one of the configured prefixes
                const matches = prefixes.some((p) => token.startsWith(`.${p}`) || token.startsWith(p));
                if (!matches) {
                    result.warn(`Unexpected selector "${token}" — must start with ${expectedLabel}. (halo-ui/prefix-selector)`, { node, word: token });
                }
            }
        }
    });
}
