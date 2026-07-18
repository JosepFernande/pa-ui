import { PLATFORM_ID, TransferState } from '@angular/core';
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
      configureTestBed('server');
      const transferState = TestBed.inject(TransferState);
      const setSpy = jest.spyOn(transferState, 'set');
      const theme = TestBed.inject(PA_THEME_TOKEN);
      expect(setSpy).toHaveBeenCalledWith(PA_THEME_STATE_KEY, theme);
      expect(theme).toEqual(DEFAULT_THEME);
    });
  });

  describe('SSR-safe computation — browser reads transferred snapshot', () => {
    it('reads the seeded TransferState snapshot without recomputing via mergeTheme', () => {
      configureTestBed('browser');
      const transferState = TestBed.inject(TransferState);
      const seeded: ResolvedTheme = { colors: { primary: '#seeded' } };
      transferState.set(PA_THEME_STATE_KEY, seeded);
      mergeThemeMock.mockClear();
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

    it('returns a fresh fallback snapshot, never the shared DEFAULT_THEME reference', () => {
      mergeThemeMock.mockImplementation(() => {
        throw new Error('boom');
      });
      configureTestBed('server');
      const theme = TestBed.inject(PA_THEME_TOKEN);
      theme.colors['primary'] = 'mutated';
      expect(DEFAULT_THEME.colors['primary']).toBe('#2563eb');
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
});
