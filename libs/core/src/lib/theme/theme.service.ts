import { DOCUMENT, isPlatformServer } from '@angular/common';
import { Injectable, PLATFORM_ID, Signal, inject, signal } from '@angular/core';
import { deriveTokens } from './color-derivation';
import { toSemanticCssVariables } from './semantic-tokens';
import { mergeTheme } from './theme-engine';
import { PA_THEME_TOKEN } from './theme.tokens';
import type { ResolvedTheme } from './theme.tokens';

/**
 * Runtime theme mutation surface built on top of the bootstrap snapshot
 * registered by `providePaTheme()` (Requirement: Runtime Mutation Surface
 * Supersedes Read-Only Boundary). Exposes `applyTheme`, `overrideColor`,
 * `reset`, and `getResolvedTheme` in addition to the existing readonly
 * `theme` signal and `getColor()` getter.
 *
 * Every mutation follows one pipeline: `mergeTheme` -> writable `theme`
 * signal update (always, including on the server) -> SSR-guarded
 * `writeToDom` (`deriveTokens` -> `toSemanticCssVariables` -> `setProperty`).
 * Reactive change notification is the existing `theme` signal — zero new
 * RxJS. Fail-soft malformed hex handling is fully inherited from
 * `deriveTokens`'s own warn+skip contract; no extra try/catch here.
 */
@Injectable({ providedIn: 'root' })
export class PaThemeService {
  /**
   * The bootstrap-time snapshot from `PA_THEME_TOKEN`, cached at
   * construction so `reset()` restores it without re-injecting mid-lifecycle
   * (the token value is frozen/immutable post-bootstrap). Declared before
   * `_theme` because `_theme`'s initializer reads `this.initialSnapshot` —
   * class fields initialize in declaration order.
   */
  private readonly initialSnapshot = inject(PA_THEME_TOKEN);

  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

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
    const next = mergeTheme({ colors: overrides }, undefined, this._theme());
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
   * `undefined` for unknown keys instead of throwing.
   */
  getColor(name: string): string | undefined {
    return this.theme().colors[name];
  }

  /**
   * Runs the semantic-only DOM write adapter for `theme` (Requirement:
   * Semantic-Only DOM Write Adapter). Skipped entirely on the server
   * (Requirement: SSR-Safe DOM Writes) — mirrors `providePaTheme`'s guard.
   */
  private writeToDom(theme: ResolvedTheme): void {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    const vars = toSemanticCssVariables(deriveTokens(theme));
    const root = this.document.documentElement;
    for (const [prop, value] of Object.entries(vars)) {
      root.style.setProperty(prop, value);
    }
  }
}
