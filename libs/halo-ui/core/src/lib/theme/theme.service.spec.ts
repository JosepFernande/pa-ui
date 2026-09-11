import { DOCUMENT } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DEFAULT_THEME, HA_THEME_TOKEN } from './theme.tokens';
import type { HaTheme, HaThemeOptions } from './theme.tokens';
import { provideHaTheme } from './theme-provider';
import { HaThemeService } from './theme.service';

describe('HaThemeService', () => {
  let originalDocumentElementStyle: string | null;

  beforeEach(() => {
    originalDocumentElementStyle = document.documentElement.getAttribute('style');
  });

  afterEach(() => {
    // `document.documentElement.style` is the same jsdom instance reused
    // across every test in this file; without restoring, `jest.spyOn`
    // returns the SAME already-spied mock instead of a fresh one, causing
    // call counts to accumulate across unrelated tests.
    jest.restoreAllMocks();

    if (originalDocumentElementStyle === null) {
      document.documentElement.removeAttribute('style');
    } else {
      document.documentElement.setAttribute('style', originalDocumentElementStyle);
    }
  });

  function configureTestBed(
    platform: 'server' | 'browser' = 'browser',
    theme?: HaTheme,
    options?: HaThemeOptions,
  ): HaThemeService {
    TestBed.configureTestingModule({
      providers: [provideHaTheme(theme, options), { provide: PLATFORM_ID, useValue: platform }],
    });
    return TestBed.inject(HaThemeService);
  }

  describe('reading the injected snapshot', () => {
    it('is providedIn root and resolves the injected HA_THEME_TOKEN snapshot synchronously', () => {
      const service = configureTestBed();
      const token = TestBed.inject(HA_THEME_TOKEN);
      expect(service.theme()).toEqual(token);
      expect(service.theme()).toEqual(DEFAULT_THEME);
    });

    it('exposes theme as a readonly Signal (callable, returns the current snapshot)', () => {
      const service = configureTestBed('browser', { semantic: { primary: '#f00' } });
      expect(typeof service.theme).toBe('function');
      expect(service.theme().colors['primary']).toBe('#f00');
    });

    it('reflects the merged snapshot for a partial custom config, keeping other custom keys untouched', () => {
      const service = configureTestBed('browser', { semantic: { primary: '#111', brand: '#00f' } });
      expect(service.theme().colors['primary']).toBe('#111');
      expect(service.theme().colors['brand']).toBe('#00f');
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
      // provideHaTheme() eagerly constructs HaThemeService via
      // provideEnvironmentInitializer() (Phase 3), so TestBed's environment
      // injector resolves the service on the FIRST inject() call of ANY
      // token in this environment — a spy created after that first call
      // (e.g. via TestBed.inject(DOCUMENT)) would already have missed it.
      const setPropertySpy = jest.spyOn(document.documentElement.style, 'setProperty');

      TestBed.configureTestingModule({
        providers: [
          provideHaTheme({ semantic: { primary: '#111111' } }),
          { provide: PLATFORM_ID, useValue: 'browser' },
        ],
      });

      TestBed.inject(HaThemeService);

      expect(setPropertySpy).toHaveBeenCalledWith('--ha-primary', '#111111');
    });

    it('propagates a custom error color to the signal and the --ha-error semantic var (REQ-4 transitive chain)', () => {
      // Mirror of the primary test above: `--ha-input-error-border`,
      // `--ha-input-error-color` and `--ha-input-error-icon-color` all
      // resolve to `var(--ha-error)` (asserted in theme-runtime
      // integration), so a custom error color reaching `--ha-error` in the
      // DOM is the jsdom-feasible proof of REQ-4.
      const setPropertySpy = jest.spyOn(document.documentElement.style, 'setProperty');

      const service = configureTestBed('browser', { semantic: { error: '#8b0000' } });

      expect(service.theme().colors['error']).toBe('#8b0000');
      expect(setPropertySpy).toHaveBeenCalledWith('--ha-error', '#8b0000');
    });
  });

  describe('applyTheme (Req: applyTheme Merges Overrides and Re-Derives)', () => {
    it('merges overrides over the current colors, preserves untouched colors, and writes the semantic DOM var for the changed color', () => {
      const service = configureTestBed('browser', {
        semantic: { primary: '#2563eb', success: '#16a34a' },
      });
      const document = TestBed.inject(DOCUMENT);
      const setPropertySpy = jest.spyOn(document.documentElement.style, 'setProperty');

      service.applyTheme({ primary: '#000000' });

      expect(service.theme().colors['primary']).toBe('#000000');
      expect(service.theme().colors['success']).toBe('#16a34a');
      expect(setPropertySpy).toHaveBeenCalledWith('--ha-primary', '#000000');
    });

    it('never throws on an empty overrides object (Task 2.7 — smoke, delegates to mergeTheme never-throw contract)', () => {
      const service = configureTestBed('browser', { semantic: { primary: '#2563eb' } });
      expect(() => service.applyTheme({})).not.toThrow();
    });
  });

  describe('overrideColor (Req: overrideColor Convenience Wrapper)', () => {
    it('behaves identically to applyTheme({ [name]: hex }) for a single key', () => {
      const service = configureTestBed('browser', {
        semantic: { primary: '#2563eb', success: '#16a34a' },
      });
      const document = TestBed.inject(DOCUMENT);
      const setPropertySpy = jest.spyOn(document.documentElement.style, 'setProperty');

      service.overrideColor('primary', '#0f0f0f');

      expect(service.theme().colors['primary']).toBe('#0f0f0f');
      expect(service.theme().colors['success']).toBe('#16a34a');
      expect(setPropertySpy).toHaveBeenCalledWith('--ha-primary', '#0f0f0f');
    });
  });

  describe('reset (Req: reset Restores Bootstrap-Time Theme)', () => {
    it('restores the bootstrap snapshot from provideHaTheme (not DEFAULT_THEME) in both the signal and the DOM after overrides', () => {
      const service = configureTestBed('browser', { semantic: { primary: '#123456' } });
      const document = TestBed.inject(DOCUMENT);
      const setPropertySpy = jest.spyOn(document.documentElement.style, 'setProperty');

      service.applyTheme({ primary: '#abcabc' });
      service.reset();

      expect(service.theme().colors['primary']).toBe('#123456');
      expect(setPropertySpy).toHaveBeenCalledWith('--ha-primary', '#123456');
    });
  });

  describe('getResolvedTheme (Req: getResolvedTheme Snapshot Accessor)', () => {
    it('returns content identical to theme() after a mutation', () => {
      const service = configureTestBed('browser', { semantic: { primary: '#2563eb' } });
      service.overrideColor('primary', '#fff000');
      expect(service.getResolvedTheme()).toEqual(service.theme());
    });
  });

  describe('reactive change notification via the existing theme signal (Req: Reactive Change Notification via Existing Signal)', () => {
    it('reflects each mutation through the theme signal with zero RxJS subscription anywhere in this test', () => {
      const service = configureTestBed('browser', { semantic: { primary: '#2563eb' } });
      expect(service.theme().colors['primary']).toBe('#2563eb');
      service.overrideColor('primary', '#fff000');
      expect(service.theme().colors['primary']).toBe('#fff000');
    });
  });

  describe('SSR DOM writes (Foundation is no longer skipped on SSR — closes the FOUC gap)', () => {
    it('applyTheme updates the signal on the server AND calls document.documentElement.style.setProperty', () => {
      const service = configureTestBed('server', { semantic: { primary: '#2563eb' } });
      const document = TestBed.inject(DOCUMENT);
      const setPropertySpy = jest.spyOn(document.documentElement.style, 'setProperty');

      expect(() => service.applyTheme({ primary: '#000000' })).not.toThrow();

      expect(service.theme().colors['primary']).toBe('#000000');
      expect(setPropertySpy).toHaveBeenCalledWith('--ha-primary', '#000000');
    });

    it('overrideColor and reset also update the signal on the server AND call setProperty', () => {
      const service = configureTestBed('server', { semantic: { primary: '#2563eb' } });
      const document = TestBed.inject(DOCUMENT);
      const setPropertySpy = jest.spyOn(document.documentElement.style, 'setProperty');

      service.overrideColor('primary', '#000000');
      expect(service.theme().colors['primary']).toBe('#000000');
      expect(setPropertySpy).toHaveBeenCalledWith('--ha-primary', '#000000');

      service.reset();
      expect(service.theme().colors['primary']).toBe('#2563eb');
      expect(setPropertySpy).toHaveBeenCalledWith('--ha-primary', '#2563eb');
    });
  });

  describe('fail-soft malformed color handling (Req: Fail-Soft Malformed Color Handling)', () => {
    it('warns for a malformed hex, skips its DOM write, but still writes valid colors and never throws', () => {
      const service = configureTestBed('browser', {
        semantic: { primary: '#2563eb', success: '#16a34a' },
      });
      const document = TestBed.inject(DOCUMENT);
      const setPropertySpy = jest.spyOn(document.documentElement.style, 'setProperty');
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

      expect(() => service.applyTheme({ primary: 'not-a-color', success: '#0f0' })).not.toThrow();

      expect(warnSpy).toHaveBeenCalled();
      expect(setPropertySpy).not.toHaveBeenCalledWith('--ha-primary', expect.anything());
      expect(setPropertySpy).toHaveBeenCalledWith('--ha-success', '#0f0');

      warnSpy.mockRestore();
    });
  });

  describe('getColor convenience getter', () => {
    it('returns the color value for a known key synchronously', () => {
      const service = configureTestBed();
      expect(service.getColor('primary')).toBe(DEFAULT_THEME.colors['primary']);
    });

    it('returns the default bootstrap `primary` plain hex string as-is (no object-shaped entry to normalize)', () => {
      const service = configureTestBed();
      expect(service.getColor('primary')).toBe(DEFAULT_THEME.colors['primary'] as string);
    });

    it('returns undefined for an unknown color key without throwing', () => {
      const service = configureTestBed();
      expect(() => service.getColor('does-not-exist')).not.toThrow();
      expect(service.getColor('does-not-exist')).toBeUndefined();
    });

    it('normalizes an object-shaped entry to its base hex string (Task 4.1, Req: getColor Returns Base Hex Only)', () => {
      const service = configureTestBed('browser', {
        semantic: { primary: { base: '#16709e', hover: '#0a4f6b' } },
      });
      expect(service.getColor('primary')).toBe('#16709e');
    });
  });

  describe('object-shaped bootstrap colors — runtime mutation drops explicit variants (Phase 4)', () => {
    it('overrideColor with a plain string over an object entry drops explicit variants and fully re-derives hover/active/contrast (Task 4.2)', () => {
      const service = configureTestBed('browser', {
        semantic: { primary: { base: '#16709e', hover: '#0a4f6b' } },
      });
      const document = TestBed.inject(DOCUMENT);
      const setPropertySpy = jest.spyOn(document.documentElement.style, 'setProperty');

      service.overrideColor('primary', '#334455');

      expect(service.theme().colors['primary']).toBe('#334455');
      // Fully re-derived hover must NOT equal the dropped explicit hover.
      expect(setPropertySpy).not.toHaveBeenCalledWith('--ha-primary-hover', '#0a4f6b');
      expect(setPropertySpy).toHaveBeenCalledWith('--ha-primary', '#334455');
    });

    it('applyTheme with a plain string over an object entry drops explicit variants for that color (Task 4.2)', () => {
      const service = configureTestBed('browser', {
        semantic: {
          primary: { base: '#16709e', hover: '#0a4f6b' },
          accent: { base: '#222222', hover: '#111111' },
        },
      });

      service.applyTheme({ primary: '#111111', accent: '#222222' });

      expect(service.theme().colors['primary']).toBe('#111111');
      expect(service.theme().colors['accent']).toBe('#222222');
    });

    it('reset() after an override restores the bootstrap object entry and its explicit hover verbatim (Task 4.3)', () => {
      const service = configureTestBed('browser', {
        semantic: { primary: { base: '#16709e', hover: '#0a4f6b' } },
      });
      const document = TestBed.inject(DOCUMENT);
      const setPropertySpy = jest.spyOn(document.documentElement.style, 'setProperty');

      service.overrideColor('primary', '#334455');
      service.reset();

      expect(service.theme().colors['primary']).toEqual({ base: '#16709e', hover: '#0a4f6b' });
      expect(setPropertySpy).toHaveBeenCalledWith('--ha-primary-hover', '#0a4f6b');
    });
  });
});
