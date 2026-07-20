import { DOCUMENT } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DEFAULT_THEME, PA_THEME_TOKEN } from './theme.tokens';
import type { PaThemeConfig, PaThemeOptions } from './theme.tokens';
import { providePaTheme } from './theme-provider';
import { PaThemeService } from './theme.service';

describe('PaThemeService', () => {
  afterEach(() => {
    // `document.documentElement.style` is the same jsdom instance reused
    // across every test in this file; without restoring, `jest.spyOn`
    // returns the SAME already-spied mock instead of a fresh one, causing
    // call counts to accumulate across unrelated tests.
    jest.restoreAllMocks();
  });

  function configureTestBed(
    platform: 'server' | 'browser' = 'browser',
    config?: PaThemeConfig,
    options?: PaThemeOptions,
  ): PaThemeService {
    TestBed.configureTestingModule({
      providers: [providePaTheme(config, options), { provide: PLATFORM_ID, useValue: platform }],
    });
    return TestBed.inject(PaThemeService);
  }

  describe('reading the injected snapshot', () => {
    it('is providedIn root and resolves the injected PA_THEME_TOKEN snapshot synchronously', () => {
      const service = configureTestBed();
      const token = TestBed.inject(PA_THEME_TOKEN);
      expect(service.theme()).toEqual(token);
      expect(service.theme()).toEqual(DEFAULT_THEME);
    });

    it('exposes theme as a readonly Signal (callable, returns the current snapshot)', () => {
      const service = configureTestBed('browser', { colors: { primary: '#f00' } });
      expect(typeof service.theme).toBe('function');
      expect(service.theme().colors['primary']).toBe('#f00');
    });

    it('reflects the merged snapshot for a partial custom config', () => {
      const service = configureTestBed('browser', { colors: { primary: '#111' } });
      expect(service.theme().colors['primary']).toBe('#111');
      expect(service.theme().colors['success']).toBe(DEFAULT_THEME.colors['success']);
    });
  });

  describe('runtime mutation surface — method presence (Task 2.20, Req: Runtime Mutation Surface Supersedes Read-Only Boundary)', () => {
    it('exposes applyTheme, overrideColor, reset, and getResolvedTheme as defined functions on the instance', () => {
      const service = configureTestBed();
      expect(typeof service.applyTheme).toBe('function');
      expect(typeof service.overrideColor).toBe('function');
      expect(typeof service.reset).toBe('function');
      expect(typeof service.getResolvedTheme).toBe('function');
    });
  });

  describe('eager DOM write at construction (Task 2.3, closes design Open Question 1)', () => {
    it('writes the semantic vars for the injected snapshot at construction time, before any mutation method runs', () => {
      // Spy on the global document BEFORE any TestBed.inject(...) call.
      // providePaTheme() eagerly constructs PaThemeService via
      // provideEnvironmentInitializer() (Phase 3), so TestBed's environment
      // injector resolves the service on the FIRST inject() call of ANY
      // token in this environment — a spy created after that first call
      // (e.g. via TestBed.inject(DOCUMENT)) would already have missed it.
      const setPropertySpy = jest.spyOn(document.documentElement.style, 'setProperty');

      TestBed.configureTestingModule({
        providers: [
          providePaTheme({ colors: { primary: '#111111' } }),
          { provide: PLATFORM_ID, useValue: 'browser' },
        ],
      });

      TestBed.inject(PaThemeService);

      expect(setPropertySpy).toHaveBeenCalledWith('--pa-primary', '#111111');
    });
  });

  describe('applyTheme (Req: applyTheme Merges Overrides and Re-Derives)', () => {
    it('merges overrides over the current colors, preserves untouched colors, and writes the semantic DOM var for the changed color', () => {
      const service = configureTestBed('browser', {
        colors: { primary: '#2563eb', success: '#16a34a' },
      });
      const document = TestBed.inject(DOCUMENT);
      const setPropertySpy = jest.spyOn(document.documentElement.style, 'setProperty');

      service.applyTheme({ primary: '#000000' });

      expect(service.theme().colors['primary']).toBe('#000000');
      expect(service.theme().colors['success']).toBe('#16a34a');
      expect(setPropertySpy).toHaveBeenCalledWith('--pa-primary', '#000000');
    });

    it('never throws on an empty overrides object (Task 2.7 — smoke, delegates to mergeTheme never-throw contract)', () => {
      const service = configureTestBed('browser', { colors: { primary: '#2563eb' } });
      expect(() => service.applyTheme({})).not.toThrow();
    });
  });

  describe('overrideColor (Req: overrideColor Convenience Wrapper)', () => {
    it('behaves identically to applyTheme({ [name]: hex }) for a single key', () => {
      const service = configureTestBed('browser', {
        colors: { primary: '#2563eb', success: '#16a34a' },
      });
      const document = TestBed.inject(DOCUMENT);
      const setPropertySpy = jest.spyOn(document.documentElement.style, 'setProperty');

      service.overrideColor('primary', '#0f0f0f');

      expect(service.theme().colors['primary']).toBe('#0f0f0f');
      expect(service.theme().colors['success']).toBe('#16a34a');
      expect(setPropertySpy).toHaveBeenCalledWith('--pa-primary', '#0f0f0f');
    });
  });

  describe('reset (Req: reset Restores Bootstrap-Time Theme)', () => {
    it('restores the bootstrap snapshot from providePaTheme (not DEFAULT_THEME) in both the signal and the DOM after overrides', () => {
      const service = configureTestBed('browser', { colors: { primary: '#123456' } });
      const document = TestBed.inject(DOCUMENT);
      const setPropertySpy = jest.spyOn(document.documentElement.style, 'setProperty');

      service.applyTheme({ primary: '#abcabc' });
      service.reset();

      expect(service.theme().colors['primary']).toBe('#123456');
      expect(setPropertySpy).toHaveBeenCalledWith('--pa-primary', '#123456');
    });
  });

  describe('getResolvedTheme (Req: getResolvedTheme Snapshot Accessor)', () => {
    it('returns content identical to theme() after a mutation', () => {
      const service = configureTestBed('browser', { colors: { primary: '#2563eb' } });
      service.overrideColor('primary', '#fff000');
      expect(service.getResolvedTheme()).toEqual(service.theme());
    });
  });

  describe('reactive change notification via the existing theme signal (Req: Reactive Change Notification via Existing Signal)', () => {
    it('reflects each mutation through the theme signal with zero RxJS subscription anywhere in this test', () => {
      const service = configureTestBed('browser', { colors: { primary: '#2563eb' } });
      expect(service.theme().colors['primary']).toBe('#2563eb');
      service.overrideColor('primary', '#fff000');
      expect(service.theme().colors['primary']).toBe('#fff000');
    });
  });

  describe('SSR-safe DOM writes (Req: SSR-Safe DOM Writes)', () => {
    it('applyTheme updates the signal on the server without ever calling document.documentElement.style.setProperty', () => {
      const service = configureTestBed('server', { colors: { primary: '#2563eb' } });
      const document = TestBed.inject(DOCUMENT);
      const setPropertySpy = jest.spyOn(document.documentElement.style, 'setProperty');

      expect(() => service.applyTheme({ primary: '#000000' })).not.toThrow();

      expect(service.theme().colors['primary']).toBe('#000000');
      expect(setPropertySpy).not.toHaveBeenCalled();
    });

    it('overrideColor and reset also update the signal on the server without calling setProperty', () => {
      const service = configureTestBed('server', { colors: { primary: '#2563eb' } });
      const document = TestBed.inject(DOCUMENT);
      const setPropertySpy = jest.spyOn(document.documentElement.style, 'setProperty');

      service.overrideColor('primary', '#000000');
      expect(service.theme().colors['primary']).toBe('#000000');

      service.reset();
      expect(service.theme().colors['primary']).toBe('#2563eb');

      expect(setPropertySpy).not.toHaveBeenCalled();
    });
  });

  describe('fail-soft malformed color handling (Req: Fail-Soft Malformed Color Handling)', () => {
    it('warns for a malformed hex, skips its DOM write, but still writes valid colors and never throws', () => {
      const service = configureTestBed('browser', {
        colors: { primary: '#2563eb', success: '#16a34a' },
      });
      const document = TestBed.inject(DOCUMENT);
      const setPropertySpy = jest.spyOn(document.documentElement.style, 'setProperty');
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

      expect(() => service.applyTheme({ primary: 'not-a-color', success: '#0f0' })).not.toThrow();

      expect(warnSpy).toHaveBeenCalled();
      expect(setPropertySpy).not.toHaveBeenCalledWith('--pa-primary', expect.anything());
      expect(setPropertySpy).toHaveBeenCalledWith('--pa-success', '#0f0');

      warnSpy.mockRestore();
    });
  });

  describe('getColor convenience getter', () => {
    it('returns the color value for a known key synchronously', () => {
      const service = configureTestBed();
      expect(service.getColor('primary')).toBe(DEFAULT_THEME.colors['primary']);
    });

    it('returns undefined for an unknown color key without throwing', () => {
      const service = configureTestBed();
      expect(() => service.getColor('does-not-exist')).not.toThrow();
      expect(service.getColor('does-not-exist')).toBeUndefined();
    });
  });
});
