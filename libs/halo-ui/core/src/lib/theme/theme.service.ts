import { DOCUMENT } from '@angular/common';
import { Injectable, Signal, inject, signal } from '@angular/core';
import { deriveTokens } from './color-derivation';
import { toComponentCssVariables } from './component-overrides';
import { toFoundationCssVariables } from './foundation-overrides';
import { toSemanticCssVariables } from './semantic-tokens';
import { mergeTheme } from './theme-engine';
import { HA_THEME_OVERRIDES_TOKEN, HA_THEME_TOKEN } from './theme.tokens';
import type { ResolvedTheme, ThemeCssVariables } from './theme.tokens';

/**
 * Runtime theme mutation surface built on top of the bootstrap snapshot
 * registered by `provideHaTheme()` (Requirement: Runtime Mutation Surface
 * Supersedes Read-Only Boundary). Exposes `applyTheme`, `overrideColor`,
 * `reset`, and `getResolvedTheme` in addition to the existing readonly
 * `theme` signal and `getColor()` getter.
 *
 * Every mutation follows one pipeline: `mergeTheme` -> writable `theme`
 * signal update (always, including on the server) -> `writeToDom`
 * (`deriveTokens` -> `toSemanticCssVariables` -> `setProperty`, plus the
 * Foundation/Component full builders), now run on BOTH platforms — the
 * server is no longer skipped, closing the FOUC gap. Reactive change
 * notification is the existing `theme` signal — zero new RxJS. Fail-soft
 * malformed hex handling is fully inherited from `deriveTokens`'s own
 * warn+skip contract; no extra try/catch here.
 */
@Injectable({ providedIn: 'root' })
export class HaThemeService {
  /**
   * The bootstrap-time snapshot from `HA_THEME_TOKEN`, cached at
   * construction so `reset()` restores it without re-injecting mid-lifecycle
   * (the token value is frozen/immutable post-bootstrap). Declared before
   * `_theme` because `_theme`'s initializer reads `this.initialSnapshot` —
   * class fields initialize in declaration order.
   */
  private readonly initialSnapshot = inject(HA_THEME_TOKEN);

  /**
   * The Foundation/Component override layers registered by
   * `provideHaTheme()` (Requirement: consumer-provided overrides visibly
   * take effect on `document.documentElement`). Not part of the frozen
   * `ResolvedTheme`/`TransferState` snapshot — see
   * `HaThemeOverridesSnapshot`'s own doc comment for why.
   */
  private readonly themeOverrides = inject(HA_THEME_OVERRIDES_TOKEN, { optional: true });

  private readonly document = inject(DOCUMENT);

  private readonly _theme = signal<ResolvedTheme>(this.initialSnapshot);

  /** Readonly signal of the current resolved theme snapshot. */
  readonly theme: Signal<ResolvedTheme> = this._theme.asReadonly();

  constructor() {
    this.writeToDom(this.initialSnapshot);
  }

  /**
   * Merges `overrides` over the current resolved theme's colors (overrides
   * win on collision, same semantics as `mergeTheme`), re-derives tokens,
   * updates the `theme` signal, and runs the semantic DOM write adapter.
   * Never throws (Requirement: applyTheme Merges Overrides and Re-Derives).
   */
  applyTheme(overrides: Record<string, string>): void {
    const next = mergeTheme(overrides, undefined, this._theme());
    this._theme.set(next);
    this.writeToDom(next);
  }

  /**
   * Convenience wrapper for overriding a single color. Behaves identically
   * to `applyTheme({ [name]: hex })` (Requirement: overrideColor Convenience
   * Wrapper).
   */
  overrideColor(name: string, hex: string): void {
    this.applyTheme({ [name]: hex });
  }

  /**
   * Restores the `theme` signal and DOM vars to the bootstrap-time snapshot
   * (Requirement: reset Restores Bootstrap-Time Theme).
   */
  reset(): void {
    this._theme.set(this.initialSnapshot);
    this.writeToDom(this.initialSnapshot);
  }

  /**
   * Plain-method accessor for the current resolved theme snapshot, content-
   * equivalent to calling `theme()` (Requirement: getResolvedTheme Snapshot
   * Accessor).
   */
  getResolvedTheme(): ResolvedTheme {
    return this._theme();
  }

  /**
   * Convenience synchronous getter for a single color by key. Returns
   * `undefined` for unknown keys instead of throwing. Normalizes an
   * object-shaped entry to its `base` hex string — no accessor exposes
   * explicit variants (Requirement: getColor Returns Base Hex Only).
   */
  getColor(name: string): string | undefined {
    const value = this.theme().colors[name];
    return typeof value === 'object' && value !== null ? value.base : value;
  }

  /**
   * Runs all three DOM write adapters for `theme` (Requirement: Semantic-
   * Only DOM Write Adapter, extended to the Foundation/Component layers).
   * Runs on BOTH platforms — server included (Requirement: computed and
   * written on both server and client, closing the FOUC gap; the write
   * mechanism itself, `documentElement.style.setProperty` via Angular's
   * `DOCUMENT` token, is real and SSR-safe under `@angular/platform-server`,
   * it was only ever the early return below that skipped the server).
   *
   * Three independent pipelines, none of which cross into another:
   * 1. Semantic — `theme.colors` -> `deriveTokens` -> `toSemanticCssVariables`
   *    (unchanged mechanism, now fed `theme` re-merged from `HaTheme.semantic`).
   * 2. Foundation — `HaTheme.foundation` -> `toFoundationCssVariables`, the
   *    full builder that merges over `HA_DEFAULT_THEME.foundation` and emits
   *    the complete flattened var set every time (Requirement:
   *    `deriveTokens()` Never Processes Raw Scales — this NEVER calls
   *    `deriveTokens`/`color-derivation.ts`).
   * 3. Component — `HaTheme.components` -> `toComponentCssVariables`, same
   *    full-builder contract over `HA_DEFAULT_THEME.components` (same
   *    non-negotiable: never calls `deriveTokens`/`color-derivation.ts`).
   *
   * Foundation/Component overrides are closure-captured at bootstrap
   * (`this.themeOverrides`) and re-applied on every write — including after
   * `reset()` — so the DOM never drifts from the resolved `HaTheme` input.
   */
  private writeToDom(theme: ResolvedTheme): void {
    this.setProperties(toSemanticCssVariables(deriveTokens(theme)));
    this.setProperties(toFoundationCssVariables(this.themeOverrides?.foundation));
    this.setProperties(toComponentCssVariables(this.themeOverrides?.components));
  }

  /** Writes every entry of `vars` as an inline custom property on `documentElement`. */
  private setProperties(vars: ThemeCssVariables): void {
    const root = this.document.documentElement;
    for (const [prop, value] of Object.entries(vars)) {
      root.style.setProperty(prop, value);
    }
  }
}
