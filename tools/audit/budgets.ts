/**
 * Single source of truth for halo-ui gzip bundle budgets, per entry point.
 *
 * Enforced by `./bundle-check.ts` in the CI `audit` job. The `Performance
 * Budgets` Notion page mirrors these values for human readers — update them
 * HERE first; the doc is a rendered snapshot, not authoritative (issue #61
 * acceptance criterion: avoid duplicating the budget numbers between the doc
 * and the script).
 *
 * Rewritten for the single-package consolidation (SDD change
 * consolidate-halo-ui-single-package, Phase 3 / PR3): the 5 old
 * `dist/libs/{core,button,input-text,select}/fesm2022/*.mjs` +
 * `dist/libs/halo-ui/index.mjs` paths no longer exist — Phase 2b deleted
 * those Nx projects, and the umbrella's old build was a hand-copied
 * `index.mjs`, not a real bundle. `libs/halo-ui` is now the only publishable
 * project, built by ng-packagr with secondary entry points; each entry point
 * (root + `core`/`button`/`input-text`/`select`) emits its own real FESM
 * bundle under `dist/libs/halo-ui/fesm2022/halolib-ui-angular[-<entry>].mjs`.
 *
 * Values are gzip sizes in BYTES. The `baselineBytes` field documents the
 * measured gzip size at consolidation time (source: a real
 * `nx build halo-ui --configuration=production` + `gzip -c <file> | wc -c`
 * on 2026-09-10), so future maintainers can see how much headroom each
 * threshold leaves. `core`'s and `select`'s baselines moved compared to the
 * pre-consolidation per-project budgets below because the built artifact
 * itself changed shape (ng-packagr entry-point bundling instead of a
 * standalone project build) — these are NOT the same numbers carried over,
 * they were re-measured against the real consolidated output.
 */
export interface PackageBudget {
  /** Human-readable label for this entry point (subpath of `@halolib-ui/angular`). */
  name: string;
  /**
   * Path to the built ESM bundle, relative to the repo root. ng-packagr
   * names each entry point's FESM bundle
   * `halolib-ui-angular[-<entry>].mjs` under the single
   * `dist/libs/halo-ui/fesm2022/` directory — verified against a real
   * production build, not assumed from the old per-project naming.
   */
  file: string;
  /** Maximum allowed gzip byte length — exceeding this fails CI (real regression territory). */
  maxGzipBytes: number;
  /**
   * Optional lower threshold — exceeding this prints a non-blocking ⚠️ instead
   * of failing CI. For entry points expected to grow with normal feature work
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
    name: '@halolib-ui/angular/core',
    file: 'dist/libs/halo-ui/fesm2022/halolib-ui-angular-core.mjs',
    // core carries the Foundation layer (palette + typography/spacing/icon
    // scales + a --ha-<component>-* default set per component), so it grows
    // with every new component by design — unlike button/input-text's thin
    // per-component footprint. maxGzipBytes stays a real regression guard;
    // warnGzipBytes flags that growth for review without failing CI on it.
    maxGzipBytes: 24 * KB,
    warnGzipBytes: 20 * KB,
    baselineBytes: 19744,
  },
  {
    name: '@halolib-ui/angular/button',
    file: 'dist/libs/halo-ui/fesm2022/halolib-ui-angular-button.mjs',
    maxGzipBytes: 5 * KB,
    baselineBytes: 3000,
  },
  {
    name: '@halolib-ui/angular/icon',
    file: 'dist/libs/halo-ui/fesm2022/halolib-ui-angular-icon.mjs',
    // Grows with every new icon added to HA_ICON_REGISTRY (each is its own
    // @lucide/angular component), unlike button/input-text/select's fixed
    // per-component footprint — same warn/max split as core.
    maxGzipBytes: 8 * KB,
    warnGzipBytes: 4 * KB,
    baselineBytes: 2507,
  },
  {
    name: '@halolib-ui/angular/input-text',
    file: 'dist/libs/halo-ui/fesm2022/halolib-ui-angular-input-text.mjs',
    maxGzipBytes: 6 * KB,
    baselineBytes: 4253,
  },
  {
    name: '@halolib-ui/angular/select',
    file: 'dist/libs/halo-ui/fesm2022/halolib-ui-angular-select.mjs',
    maxGzipBytes: 12 * KB,
    baselineBytes: 8860,
  },
  {
    name: '@halolib-ui/angular',
    file: 'dist/libs/halo-ui/fesm2022/halolib-ui-angular.mjs',
    // Root entry point is a pure re-export barrel (`export * from
    // '@halolib-ui/angular/<entry>'` — see libs/halo-ui/src/index.ts): no
    // own source, so it stays tiny regardless of how much the entry points
    // it re-exports grow.
    maxGzipBytes: 1 * KB,
    baselineBytes: 183,
  },
];
