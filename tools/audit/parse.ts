/**
 * Pure CSS/TS parsing helpers for the halo-ui audit script (`index.ts`).
 * Split out of `index.ts` so they can be unit-tested without importing (and
 * running) the CLI script, which uses `import.meta.url` — real ESM syntax
 * that collides with ts-jest's CommonJS transform's ambient `__filename`.
 */

/** The halo-ui brand selector/token prefix (issue #139 — migrated from the previous brand's prefix). */
export const SELECTOR_PREFIX = 'ha-';

/** Extract ha- prefixed selectors from CSS content (class selectors and element selectors). */
export function parseSelectors(cssContent: string): string[] {
  const selectors = new Set<string>();

  // Match class selectors: .ha-xxx
  const classRe = new RegExp(`\\.${SELECTOR_PREFIX}[\\w-]+`, 'g');
  for (const m of cssContent.matchAll(classRe)) {
    selectors.add(m[0]);
  }

  // Match element selectors: ha-xxx (not inside url() or var())
  // For simplicity, match standalone ha-xxx patterns not preceded by . or var(
  const elemRe = new RegExp(`(?:^|[\\s,{>+~])${SELECTOR_PREFIX}[\\w-]+`, 'gm');
  for (const m of cssContent.matchAll(elemRe)) {
    const name = m[0].trim();
    selectors.add(name);
  }

  return Array.from(selectors).sort();
}

/** Extract design tokens (var(--ha-*)) from CSS content. */
export function parseTokens(cssContent: string): string[] {
  const tokens = new Set<string>();
  // Match var(--ha-xxx) or var(--ha-xxx, fallback)
  const re = new RegExp(`var\\((--${SELECTOR_PREFIX}[\\w-]+)`, 'g');
  for (const m of cssContent.matchAll(re)) {
    tokens.add(m[1]);
  }
  return Array.from(tokens).sort();
}

/** Extract the selector from a @Component decorator. */
export function getComponentSelector(tsContent: string): string | null {
  const selMatch = tsContent.match(/selector\s*:\s*['"]([^'"]+)['"]/);
  return selMatch ? selMatch[1] : null;
}
