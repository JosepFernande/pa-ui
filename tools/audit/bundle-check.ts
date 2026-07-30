/**
 * pa-ui bundle-size enforcement — fails CI when a published lib exceeds its
 * gzip budget.
 *
 * Reads the single source of truth from `./budgets.ts` (no duplicated numbers;
 * issue #61 acceptance criterion), measures the gzip size of each built ESM
 * bundle with `node:zlib` (no external deps), and exits 1 if any package is
 * over budget or its built file is missing.
 *
 * Requirements: a prior `npx nx run-many -t build` — the `dist/` tree must
 * exist. In CI the `audit` job downloads the `dist` artifact produced by the
 * `build` job before running this script. Mirrors the standalone-`tsx` pattern
 * of `./index.ts` (`node:fs` / `node:path` / `node:zlib`, a JSON report, a
 * `main()` that `console.*`s and `process.exit`s).
 *
 * Usage: npx tsx tools/audit/bundle-check.ts
 */
import { readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { PACKAGE_BUDGETS, type PackageBudget } from './budgets';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------

type BudgetStatus = 'pass' | 'warn' | 'fail' | 'missing';

interface BudgetResult {
  package: string;
  file: string;
  gzipBytes: number;
  maxGzipBytes: number;
  warnGzipBytes?: number;
  status: BudgetStatus;
  reason?: string;
}

interface BundleCheckReport {
  timestamp: string;
  results: BudgetResult[];
  status: 'pass' | 'fail';
}

// ----------------------------------------------------------------------
// Pure functions
// ----------------------------------------------------------------------

/** Measure the gzip byte length of the file at `filePath`. */
export function measureGzip(filePath: string): number {
  const content = readFileSync(filePath);
  return gzipSync(content).byteLength;
}

/** Resolve a budget's repo-relative `file` path against the workspace root. */
export function resolveBundlePath(budget: PackageBudget, repoRoot: string): string {
  return resolve(repoRoot, budget.file);
}

/** Evaluate a single budget against the built bundle on disk. */
export function checkBudget(budget: PackageBudget, repoRoot: string): BudgetResult {
  const filePath = resolveBundlePath(budget, repoRoot);
  try {
    statSync(filePath);
  } catch {
    return {
      package: budget.name,
      file: budget.file,
      gzipBytes: 0,
      maxGzipBytes: budget.maxGzipBytes,
      status: 'missing',
      reason: `built bundle not found: ${budget.file} (run \`npx nx run-many -t build\` first)`,
    };
  }

  const gzipBytes = measureGzip(filePath);
  const status: BudgetStatus =
    gzipBytes > budget.maxGzipBytes
      ? 'fail'
      : budget.warnGzipBytes !== undefined && gzipBytes > budget.warnGzipBytes
        ? 'warn'
        : 'pass';
  return {
    package: budget.name,
    file: budget.file,
    gzipBytes,
    maxGzipBytes: budget.maxGzipBytes,
    warnGzipBytes: budget.warnGzipBytes,
    status,
  };
}

/** Run the check across all budgeted packages. */
export function checkBudgets(repoRoot: string): BudgetResult[] {
  return PACKAGE_BUDGETS.map((budget) => checkBudget(budget, repoRoot));
}

/** Aggregate per-package results into a report. `warn` is non-blocking — only `fail`/`missing` fail the report. */
export function generateBundleReport(results: BudgetResult[]): BundleCheckReport {
  return {
    timestamp: new Date().toISOString(),
    results,
    status: results.some((r) => r.status === 'fail' || r.status === 'missing') ? 'fail' : 'pass',
  };
}

/** Human-readable line for a single result. */
export function formatResult(r: BudgetResult): string {
  if (r.status === 'missing') {
    return `❌ ${r.package}: ${r.reason}`;
  }
  if (r.status === 'warn') {
    const pct = Math.round((r.gzipBytes / r.maxGzipBytes) * 100);
    return `⚠️  ${r.package}: ${r.gzipBytes} B > warn threshold ${r.warnGzipBytes} B (${pct}% of ${r.maxGzipBytes} B hard budget) — ${r.file}`;
  }
  const pct = Math.round((r.gzipBytes / r.maxGzipBytes) * 100);
  const comparison = r.status === 'fail' ? '>' : '≤';
  const mark = r.status === 'fail' ? '❌' : '✅';
  return `${mark} ${r.package}: ${r.gzipBytes} B ${comparison} ${r.maxGzipBytes} B (${pct}%) — ${r.file}`;
}

// ----------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------

function main(): void {
  const repoRoot = resolve(__dirname, '../..');
  const results = checkBudgets(repoRoot);
  const report = generateBundleReport(results);

  writeFileSync(join(__dirname, 'bundle-report.json'), JSON.stringify(report, null, 2));

  for (const r of results) {
    const line = formatResult(r);
    if (r.status === 'pass') {
      console.log(line);
    } else if (r.status === 'warn') {
      console.warn(line);
    } else {
      console.error(line);
    }
  }

  const failed = results.filter((r) => r.status === 'fail' || r.status === 'missing').length;
  const warned = results.filter((r) => r.status === 'warn').length;
  if (report.status === 'pass') {
    console.log(
      warned > 0
        ? `✅ bundle-check complete — all ${results.length} package(s) within hard budget (${warned} warning(s), see above)`
        : `✅ bundle-check complete — all ${results.length} package(s) within budget`,
    );
  } else {
    console.error(`❌ bundle-check failed — ${failed} package(s) over budget or missing`);
  }
  console.log(`Report written to ${join(__dirname, 'bundle-report.json')}`);

  process.exit(report.status === 'pass' ? 0 : 1);
}

main();
