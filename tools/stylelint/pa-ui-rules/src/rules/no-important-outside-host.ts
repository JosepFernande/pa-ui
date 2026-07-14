import type { Declaration, Root, Result } from 'postcss';

/**
 * Walks up the PostCSS tree from a declaration to find if any ancestor
 * rule's selector starts with ":host".
 */
function isInsideHostScope(decl: Declaration): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parent: any = decl.parent;
  while (parent) {
    if (parent.type === 'rule') {
      const selector = (parent as { selector?: string }).selector || '';
      if (selector.includes(':host')) {
        return true;
      }
    }
    parent = parent.parent;
  }
  return false;
}

/**
 * PostCSS plugin function for stylelint rule `pa-ui/no-important-outside-host`.
 *
 * `!important` is only allowed inside `:host` or `:host(...)` scopes.
 * Any `!important` outside these scopes is reported.
 *
 * Report-only — no auto-fix.
 */
export function ruleFunction(root: Root, result: Result): void {
  root.walkDecls((node: Declaration) => {
    // Check if the declaration uses !important
    if (!node.important) return;

    // Check if inside :host scope
    if (!isInsideHostScope(node)) {
      result.warn(
        `"!important" is only allowed inside ":host" scope. Move this declaration inside ":host { ... }". (pa-ui/no-important-outside-host)`,
        { node, word: '!important' },
      );
    }
  });
}
