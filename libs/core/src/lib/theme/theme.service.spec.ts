import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DEFAULT_THEME, PA_THEME_TOKEN } from './theme.tokens';
import type { PaThemeConfig, PaThemeOptions } from './theme.tokens';
import { providePaTheme } from './theme-provider';
import { PaThemeService } from './theme.service';

describe('PaThemeService', () => {
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

  describe('service boundary — read-only surface (Requirement: Service Boundary)', () => {
    it('does not expose applyTheme, overrideColor, or reset on the instance', () => {
      const service = configureTestBed();
      expect((service as unknown as Record<string, unknown>)['applyTheme']).toBeUndefined();
      expect((service as unknown as Record<string, unknown>)['overrideColor']).toBeUndefined();
      expect((service as unknown as Record<string, unknown>)['reset']).toBeUndefined();
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
