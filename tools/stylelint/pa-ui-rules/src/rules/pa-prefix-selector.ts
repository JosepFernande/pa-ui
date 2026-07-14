import type { AtRule, Root, Result, Rule as PostCSSRule } from 'postcss';

/**
 * Returns true if the given node lives inside an @keyframes at-rule.
 */
function isInsideKeyframes(node: PostCSSRule): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parent: any = node.parent;
  while (parent) {
    if (parent.type === 'atrule' && (parent as AtRule).name === 'keyframes') {
      return true;
    }
    parent = parent.parent;
  }
  return false;
}

/**
 * Checks whether a token looks like a simple selector that should have a pa- prefix.
 * Skips pseudo-classes, pseudo-elements, attributes, combinators, and universal selectors.
 */
function isSimpleSelector(token: string): boolean {
  // Combinators
  if (token === '>' || token === '+' || token === '~' || token === '/' || token === '*') return false;
  // Pseudo-classes and pseudo-elements
  if (token.startsWith(':') || token.startsWith('::')) return false;
  // Attribute selectors
  if (token.startsWith('[')) return false;
  return true;
}

/**
 * PostCSS plugin function for stylelint rule `pa-ui/pa-prefix-selector`.
 *
 * Enforces that every CSS selector starts with `.pa-` or `pa-`.
 * `:host` and `:host(...)` selectors are exempt.
 *
 * Report-only — no auto-fix.
 */
export function ruleFunction(root: Root, result: Result): void {
  root.walkRules((node) => {
    // Skip rules inside @keyframes (to, from, percentage selectors)
    if (isInsideKeyframes(node)) return;

    const rawSelector = node.selector;
    if (!rawSelector) return;

    // Split by comma first, then by whitespace to get individual selector tokens
    const commaGroups = rawSelector.split(',');
    for (const group of commaGroups) {
      const tokens = group.trim().split(/\s+/).filter(Boolean);

      for (const token of tokens) {
        // Skip non-selector tokens
        if (!isSimpleSelector(token)) continue;

        // Exempt :host and :host(...) (already handled by isSimpleSelector starting with `:` but be explicit)
        if (token.startsWith(':host')) continue;

        // Check that the selector token starts with .pa- or pa-
        if (!token.startsWith('.pa-') && !token.startsWith('pa-')) {
          result.warn(
            `Unexpected selector "${token}" — must start with ".pa-" or "pa-". (pa-ui/pa-prefix-selector)`,
            { node, word: token },
          );
        }
      }
    }
  });
}
