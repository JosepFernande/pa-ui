/**
 * Single source of truth for pa-ui per-package gzip bundle budgets.
 *
 * Enforced by `./bundle-check.ts` in the CI `audit` job. The `Performance
 * Budgets` Notion page mirrors these values for human readers — update them
 * HERE first; the doc is a rendered snapshot, not authoritative (issue #61
 * acceptance criterion: avoid duplicating the budget numbers between the doc
 * and the script).
 *
 * Values are gzip sizes in BYTES. The `baselineBytes` field documents the
 * measured gzip size at the time the budget was set (source: `gzip -c <file> |
 * wc -c`), so future maintainers can see how much headroom each threshold
 * leaves. The budgets below are enforced regression thresholds the current
 * build satisfies — distinct from the per-category design targets in the
 * Notion doc (e.g. core's design target is 4 KB, but the measured build is
 * ~6.7 KB, so the enforced budget is 8 KB; slimming core back toward 4 KB is
 * tracked as follow-up work).
 */
export interface PackageBudget {
  /** npm package name (matches the `name` field in the lib's dist package.json). */
  name: string;
  /**
   * Path to the built ESM bundle, relative to the repo root.
   * ng-packagr emits per-lib FESM bundles at `dist/libs/<lib>/fesm2022/<name>.mjs`;
   * the umbrella `@pa-ui/angular` barrel ships only `dist/libs/pa-ui/index.mjs`.
   */
  file: string;
  /** Maximum allowed gzip byte length. */
  maxGzipBytes: number;
  /** Measured gzip baseline (bytes) the budget was calibrated against. */
  baselineBytes: number;
}

const KB = 1024;

export const PACKAGE_BUDGETS: readonly PackageBudget[] = [
  {
    name: '@pa-ui/core',
    file: 'dist/libs/core/fesm2022/pa-ui-core.mjs',
    maxGzipBytes: 8 * KB,
    baselineBytes: 6743,
  },
  {
    name: '@pa-ui/button',
    file: 'dist/libs/button/fesm2022/pa-ui-button.mjs',
    maxGzipBytes: 4 * KB,
    baselineBytes: 2821,
  },
  {
    name: '@pa-ui/input',
    file: 'dist/libs/input/fesm2022/pa-ui-input.mjs',
    maxGzipBytes: 5 * KB,
    baselineBytes: 499,
  },
  {
    name: '@pa-ui/angular',
    file: 'dist/libs/pa-ui/index.mjs',
    maxGzipBytes: 1 * KB,
    baselineBytes: 68,
  },
];