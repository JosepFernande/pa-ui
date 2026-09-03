/**
 * Single source of truth for halo-ui per-package gzip bundle budgets.
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
   * the umbrella `@halolib-ui/angular` barrel ships only `dist/libs/halo-ui/index.mjs`.
   */
  file: string;
  /** Maximum allowed gzip byte length — exceeding this fails CI (real regression territory). */
  maxGzipBytes: number;
  /**
   * Optional lower threshold — exceeding this prints a non-blocking ⚠️ instead
   * of failing CI. For packages expected to grow with normal feature work
   * (e.g. `core`, which gains a `--ha-<component>-*` default set per new
   * component), this surfaces growth for review without treating "the
   * library grew because we shipped more" as the same failure class as an
   * actual bundle regression.
   */
  warnGzipBytes?: number;
  /** Measured gzip baseline (bytes) the budget was calibrated against. */
  baselineBytes: number;
}

const KB = 1024;

export const PACKAGE_BUDGETS: readonly PackageBudget[] = [
  {
    name: '@halolib-ui/core',
    file: 'dist/libs/core/fesm2022/halo-ui-core.mjs',
    // core carries the Foundation layer (palette + typography/spacing/icon
    // scales + a --ha-<component>-* default set per component), so it grows
    // with every new component by design — unlike button/input-text's thin
    // per-component footprint. maxGzipBytes stays a real regression guard;
    // warnGzipBytes flags that growth for review without failing CI on it.
    maxGzipBytes: 16 * KB,
    warnGzipBytes: 8 * KB,
    baselineBytes: 12174,
  },
  {
    name: '@halolib-ui/button',
    file: 'dist/libs/button/fesm2022/halo-ui-button.mjs',
    maxGzipBytes: 4 * KB,
    baselineBytes: 2821,
  },
  {
    name: '@halolib-ui/input-text',
    file: 'dist/libs/input-text/fesm2022/halo-ui-input-text.mjs',
    maxGzipBytes: 5 * KB,
    baselineBytes: 499,
  },
  {
    name: '@halolib-ui/select',
    file: 'dist/libs/select/fesm2022/halo-ui-select.mjs',
    maxGzipBytes: 12 * KB,
    baselineBytes: 9060,
  },
  {
    name: '@halolib-ui/angular',
    file: 'dist/libs/halo-ui/index.mjs',
    maxGzipBytes: 1 * KB,
    baselineBytes: 68,
  },
];
