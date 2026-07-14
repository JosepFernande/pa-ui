/**
 * pa-ui audit script — standalone tsx report generator.
 *
 * Walks libs/, collects:
 *  - pa-* selectors from CSS files
 *  - Design tokens consumed (var(--pa-*)) from CSS files
 *  - ViewEncapsulation.None compliance from component .ts files
 *
 * Output: report.json
 *
 * Usage: npx tsx tools/audit/index.ts
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------

interface ComponentData {
  path: string;
  selector: string;
  encapsulation: 'None' | 'missing' | 'wrong';
  tokens: string[];
}

interface AuditReport {
  timestamp: string;
  components: ComponentData[];
  selectors: string[];
  violations: Array<{ component: string; rule: string; message: string }>;
  status: 'pass' | 'fail';
}

// ----------------------------------------------------------------------
// Pure functions — CSS parsing
// ----------------------------------------------------------------------

/** Extract pa- prefixed selectors from CSS content (class selectors and element selectors). */
export function parseSelectors(cssContent: string): string[] {
  const selectors = new Set<string>();

  // Match class selectors: .pa-xxx
  const classRe = /\.pa-[\w-]+/g;
  for (const m of cssContent.matchAll(classRe)) {
    selectors.add(m[0]);
  }

  // Match element selectors: pa-xxx (not inside url() or var())
  // For simplicity, match standalone pa-xxx patterns not preceded by . or var(
  const elemRe = /(?:^|[\s,{>+~])pa-[\w-]+/gm;
  for (const m of cssContent.matchAll(elemRe)) {
    const name = m[0].trim();
    selectors.add(name);
  }

  return Array.from(selectors).sort();
}

/** Extract design tokens (var(--pa-*)) from CSS content. */
export function parseTokens(cssContent: string): string[] {
  const tokens = new Set<string>();
  // Match var(--pa-xxx) or var(--pa-xxx, fallback)
  const re = /var\((--pa-[\w-]+)/g;
  for (const m of cssContent.matchAll(re)) {
    tokens.add(m[1]);
  }
  return Array.from(tokens).sort();
}

// ----------------------------------------------------------------------
// Pure functions — TypeScript parsing
// ----------------------------------------------------------------------

/** Check if a TypeScript source has ViewEncapsulation.None in its @Component decorator. */
export function getEncapsulationStatus(tsContent: string): 'None' | 'missing' | 'wrong' {
  // Find @Component decorator block
  const compMatch = tsContent.match(/@Component\(\s*\{[\s\S]*?\}\)\s*\n\s*(?:export\s+)?class\b/);
  if (!compMatch) return 'missing';

  const block = compMatch[0];

  if (!/encapsulation\s*:\s*/g.test(block)) {
    return 'missing';
  }

  if (/encapsulation\s*:\s*ViewEncapsulation\.None\b/.test(block)) {
    return 'None';
  }

  return 'wrong';
}

/** Extract the selector from a @Component decorator. */
export function getComponentSelector(tsContent: string): string | null {
  const selMatch = tsContent.match(/selector\s*:\s*['"]([^'"]+)['"]/);
  return selMatch ? selMatch[1] : null;
}

// ----------------------------------------------------------------------
// File system operations (impure)
// ----------------------------------------------------------------------

/** Recursively walk a directory and collect component analysis data. */
export function walkLibs(basePath: string): ComponentData[] {
  const results: ComponentData[] = [];

  function walk(dir: string): void {
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      let stat: ReturnType<typeof statSync>;
      try {
        stat = statSync(fullPath);
      } catch {
        continue;
      }

      if (stat.isDirectory() && entry !== 'node_modules' && entry !== 'dist') {
        walk(fullPath);
      } else if (stat.isFile()) {
        const ext = extname(entry);

        // Match .component.ts files
        if (entry.endsWith('.component.ts') && !entry.endsWith('.spec.ts')) {
          const tsContent = readFileSync(fullPath, 'utf-8');
          const selector = getComponentSelector(tsContent);
          const encapsulation = getEncapsulationStatus(tsContent);
          // We also need to find the corresponding .css file for tokens
          const cssPath = fullPath.replace(/\.ts$/, '.css');
          let tokens: string[] = [];

          try {
            const cssContent = readFileSync(cssPath, 'utf-8');
            tokens = parseTokens(cssContent);
          } catch {
            // No CSS file for this component — that's fine
          }

          if (selector) {
            results.push({
              path: fullPath.replace(basePath, 'libs'),
              selector,
              encapsulation,
              tokens,
            });
          }
        }
      }
    }
  }

  walk(basePath);
  return results;
}

/** Generate the audit report from component data. */
export function generateReport(components: ComponentData[]): AuditReport {
  const selectors = [...new Set(components.map((c) => c.selector))].sort();
  const violations: AuditReport['violations'] = [];

  for (const comp of components) {
    if (comp.encapsulation !== 'None') {
      violations.push({
        component: comp.path,
        rule: 'require-view-encapsulation-none',
        message: `@Component lacks ViewEncapsulation.None (current: ${comp.encapsulation})`,
      });
    }
  }

  return {
    timestamp: new Date().toISOString(),
    components,
    selectors,
    violations,
    status: violations.length === 0 ? 'pass' : 'fail',
  };
}

// ----------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------

function main(): void {
  const libsPath = resolve(__dirname, '../../libs');
  const components = walkLibs(libsPath);
  const report = generateReport(components);

  const outPath = join(__dirname, 'report.json');
  writeFileSync(outPath, JSON.stringify(report, null, 2));

  console.log(
    `${report.status === 'pass' ? '✅' : '❌'} pa-ui audit complete — ${components.length} component(s), ${report.violations.length} violation(s)`,
  );
  console.log(`Report written to ${outPath}`);
}

main();
