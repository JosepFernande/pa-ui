import { Injectable, Signal, inject, signal } from '@angular/core';
import { PA_THEME_TOKEN } from './theme.tokens';
import type { ResolvedTheme } from './theme.tokens';

/**
 * Thin, read-only reader of the theme snapshot registered by
 * `providePaTheme()` (Requirement: Service Boundary — Sync Snapshot Only).
 *
 * Exposes ONLY a synchronous signal of the current resolved theme and a
 * convenience `getColor()` getter. It intentionally does NOT expose
 * `applyTheme`, `overrideColor`, `reset`, or any runtime mutation API —
 * that surface is reserved for issue #48 and MUST NOT be added here.
 */
@Injectable({ providedIn: 'root' })
export class PaThemeService {
  private readonly snapshot = inject(PA_THEME_TOKEN);

  /** Readonly signal of the current resolved theme snapshot. */
  readonly theme: Signal<ResolvedTheme> = signal(this.snapshot).asReadonly();

  /**
   * Convenience synchronous getter for a single color by key. Returns
   * `undefined` for unknown keys instead of throwing.
   */
  getColor(name: string): string | undefined {
    return this.theme().colors[name];
  }
}
