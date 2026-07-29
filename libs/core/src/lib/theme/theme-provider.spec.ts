import { EnvironmentInjector, PLATFORM_ID, TransferState } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DEFAULT_THEME, PA_THEME_STATE_KEY, PA_THEME_TOKEN } from './theme.tokens';
import type { PaThemeConfig, PaThemeOptions, ResolvedTheme } from './theme.tokens';
import { mergeTheme } from './theme-engine';
import { providePaTheme } from './theme-provider';

jest.mock('./theme-engine');

const mergeThemeMock = mergeTheme as jest.MockedFunction<typeof mergeTheme>;

describe('providePaTheme', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    // Default every test to the REAL mergeTheme implementation. Individual
    // tests override this mock only when they need to assert forwarding
    // (spy on call args) or the fail-safe throw path.
    const actual = jest.requireActual<typeof import('./theme-engine')>('./theme-engine');
    mergeThemeMock.mockImplementation(actual.mergeTheme);
  });

  afterEach(() => {
    warnSpy.mockRestore();
    jest.clearAllMocks();
  });

  function configureTestBed(
    platform: 'server' | 'browser',
    config?: PaThemeConfig,
    options?: PaThemeOptions,
  ): void {
    TestBed.configureTestingModule({
      providers: [providePaTheme(config, options), { provide: PLATFORM_ID, useValue: platform }],
    });
  }

  describe('bootstrap registration — no config (browser)', () => {
    it('returns something usable as an EnvironmentProviders entry in TestBed', () => {
      expect(() => configureTestBed('browser')).not.toThrow();
    });

    it('provides PA_THEME_TOKEN via useFactory calling mergeTheme(undefined, undefined), equal to DEFAULT_THEME', () => {
      configureTestBed('browser');
      const theme = TestBed.inject(PA_THEME_TOKEN);
      expect(theme).toEqual(DEFAULT_THEME);
      expect(mergeThemeMock).toHaveBeenCalledWith(undefined, undefined);
    });

    it('freezes the provided snapshot so a consumer cannot mutate it in place', () => {
      configureTestBed('browser');
      const theme = TestBed.inject(PA_THEME_TOKEN);
      expect(Object.isFrozen(theme)).toBe(true);
      expect(Object.isFrozen(theme.colors)).toBe(true);
      expect(() => {
        'use strict';
        (theme.colors as Record<string, string>)['primary'] = 'mutated';
      }).toThrow();
    });
  });

  describe('partial config forwarding (browser, triangulation)', () => {
    it('forwards config and options to mergeTheme and exposes the merged snapshot on the token', () => {
      const config: PaThemeConfig = { colors: { primary: '#f00' } };
      const options: PaThemeOptions = { extendDefaults: true };
      configureTestBed('browser', config, options);
      const theme = TestBed.inject(PA_THEME_TOKEN);
      expect(mergeThemeMock).toHaveBeenCalledWith(config, options);
      expect(theme.colors['primary']).toBe('#f00');
      expect(theme.colors['success']).toBe(DEFAULT_THEME.colors['success']);
    });
  });

  describe('SSR-safe computation — server', () => {
    it('computes synchronously via isPlatformServer and persists the snapshot into TransferState', () => {
      // Spy on the prototype BEFORE any TestBed.inject(...) call. Since
      // providePaTheme() now eagerly constructs PaThemeService via
      // provideEnvironmentInitializer() (Phase 3), TestBed's environment
      // injector — and therefore PA_THEME_TOKEN's factory — resolves on the
      // FIRST inject() call of ANY token, not only when PA_THEME_TOKEN
      // itself is explicitly requested. Spying on an already-injected
      // instance would miss that first (real) call.
      const setSpy = jest.spyOn(TransferState.prototype, 'set');
      configureTestBed('server');
      const theme = TestBed.inject(PA_THEME_TOKEN);
      expect(setSpy).toHaveBeenCalledWith(PA_THEME_STATE_KEY, theme);
      expect(theme).toEqual(DEFAULT_THEME);
    });
  });

  describe('SSR-safe computation — browser reads transferred snapshot', () => {
    it('reads the seeded TransferState snapshot without recomputing via mergeTheme', () => {
      const seeded: ResolvedTheme = { colors: { primary: '#seeded' } };
      const seededTransferState = new TransferState();
      seededTransferState.set(PA_THEME_STATE_KEY, seeded);

      // Provide the pre-seeded TransferState directly rather than seeding it
      // after TestBed.inject(TransferState) — the eager environment
      // initializer (Phase 3) resolves PA_THEME_TOKEN on the first inject()
      // call in this environment, so seeding afterwards would be too late.
      TestBed.configureTestingModule({
        providers: [
          providePaTheme(),
          { provide: PLATFORM_ID, useValue: 'browser' },
          { provide: TransferState, useValue: seededTransferState },
        ],
      });

      const theme = TestBed.inject(PA_THEME_TOKEN);
      expect(theme).toEqual(seeded);
      expect(mergeThemeMock).not.toHaveBeenCalled();
    });
  });

  describe('SSR-safe computation — browser, TransferState absent', () => {
    it('falls back to a synchronous recompute via mergeTheme without error', () => {
      configureTestBed('browser');
      const theme = TestBed.inject(PA_THEME_TOKEN);
      expect(mergeThemeMock).toHaveBeenCalledWith(undefined, undefined);
      expect(theme).toEqual(DEFAULT_THEME);
    });
  });

  describe('fail-safe bootstrap', () => {
    it('catches errors thrown by mergeTheme, falls back to DEFAULT_THEME, warns exactly once, and does not throw', () => {
      mergeThemeMock.mockImplementation(() => {
        throw new Error('boom');
      });
      configureTestBed('browser', { colors: {} });

      let theme: ResolvedTheme | undefined;
      expect(() => {
        theme = TestBed.inject(PA_THEME_TOKEN);
      }).not.toThrow();

      expect(theme).toEqual(DEFAULT_THEME);
      expect(warnSpy).toHaveBeenCalledTimes(1);
    });

    it('returns a fresh, frozen fallback snapshot, never the shared DEFAULT_THEME reference', () => {
      mergeThemeMock.mockImplementation(() => {
        throw new Error('boom');
      });
      configureTestBed('server');
      const theme = TestBed.inject(PA_THEME_TOKEN);
      expect(Object.isFrozen(theme.colors)).toBe(true);
      expect(() => {
        'use strict';
        (theme.colors as Record<string, string>)['primary'] = 'mutated';
      }).toThrow();
      expect(DEFAULT_THEME.colors['success']).toBe('#8fbf21');
    });

    it('does not persist into TransferState when the server-side computation throws', () => {
      mergeThemeMock.mockImplementation(() => {
        throw new Error('boom');
      });
      configureTestBed('server');
      const transferState = TestBed.inject(TransferState);
      const setSpy = jest.spyOn(transferState, 'set');
      TestBed.inject(PA_THEME_TOKEN);
      expect(setSpy).not.toHaveBeenCalled();
    });

    it('surfaces the error passed to console.warn for debuggability', () => {
      const error = new Error('malformed config');
      mergeThemeMock.mockImplementation(() => {
        throw error;
      });
      configureTestBed('browser');
      TestBed.inject(PA_THEME_TOKEN);
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('providePaTheme'), error);
    });
  });

  describe('deep-freeze of object-shaped color entries (Phase 3)', () => {
    it('deep-freezes a nested object entry, and a strict-mode mutation of one of its variants throws (Task 3.1)', () => {
      const config: PaThemeConfig = {
        colors: { primary: { base: '#16709e', hover: '#0a4f6b' } },
      };
      configureTestBed('browser', config);
      const theme = TestBed.inject(PA_THEME_TOKEN);

      expect(Object.isFrozen(theme.colors['primary'])).toBe(true);
      expect(() => {
        'use strict';
        (theme.colors['primary'] as { hover: string }).hover = '#000000';
      }).toThrow();
      expect((theme.colors['primary'] as { hover: string }).hover).toBe('#0a4f6b');
    });

    it('freezes an independent copy of an object entry, so mutating the caller-owned config object afterward never affects the snapshot (Task 3.2)', () => {
      const primaryEntry = { base: '#16709e', hover: '#0a4f6b' };
      const config: PaThemeConfig = { colors: { primary: primaryEntry } };
      configureTestBed('browser', config);
      const theme = TestBed.inject(PA_THEME_TOKEN);

      // Mutate the caller's own object AFTER bootstrap.
      primaryEntry.hover = '#ffffff';

      expect((theme.colors['primary'] as { hover: string }).hover).toBe('#0a4f6b');
      expect(theme.colors['primary']).not.toBe(primaryEntry);
    });
  });

  describe('SSR TransferState round-trip for object-shaped entries (Phase 3, Req: SSR TransferState Round-Trip)', () => {
    it('an object-shaped entry seeded server-side survives TransferState and is deep-frozen after browser rehydration (Task 3.3)', () => {
      const seeded: ResolvedTheme = {
        colors: { primary: { base: '#16709e', hover: '#0a4f6b', active: '#1a80b3' } },
      };
      const seededTransferState = new TransferState();
      seededTransferState.set(PA_THEME_STATE_KEY, seeded);

      TestBed.configureTestingModule({
        providers: [
          providePaTheme(),
          { provide: PLATFORM_ID, useValue: 'browser' },
          { provide: TransferState, useValue: seededTransferState },
        ],
      });

      const theme = TestBed.inject(PA_THEME_TOKEN);

      expect(theme.colors['primary']).toEqual(seeded.colors['primary']);
      expect(Object.isFrozen(theme.colors['primary'])).toBe(true);
      expect(() => {
        'use strict';
        (theme.colors['primary'] as { hover: string }).hover = '#mutated';
      }).toThrow();
    });
  });

  describe('eager PaThemeService instantiation (Task 3.2, resolved decision #175 — deliberate extension of a closed file)', () => {
    afterEach(() => {
      // Same shared jsdom document across tests in this file — see the
      // identical note in theme.service.spec.ts.
      jest.restoreAllMocks();
    });

    it('constructs PaThemeService and runs its initial DOM write with zero explicit injection anywhere in the test', () => {
      // Spy on the global document BEFORE any TestBed.inject(...) call —
      // TestBed.inject(DOCUMENT) itself would be the first inject() call in
      // this environment and would already trigger PaThemeService's eager
      // construction (and its DOM write) via provideEnvironmentInitializer,
      // running before a spy attached afterward could observe it.
      const setPropertySpy = jest.spyOn(document.documentElement.style, 'setProperty');

      configureTestBed('browser', { colors: { primary: '#111111' } });

      // Force environment-injector construction WITHOUT ever calling
      // TestBed.inject(PaThemeService) explicitly.
      TestBed.inject(EnvironmentInjector);

      expect(setPropertySpy).toHaveBeenCalledWith('--pa-primary', '#111111');
    });

    it('also constructs the service on the server without any document access (Task 3.4 — triangulation)', () => {
      const setPropertySpy = jest.spyOn(document.documentElement.style, 'setProperty');

      configureTestBed('server', { colors: { primary: '#111111' } });

      expect(() => TestBed.inject(EnvironmentInjector)).not.toThrow();

      expect(setPropertySpy).not.toHaveBeenCalled();
    });
  });
});
