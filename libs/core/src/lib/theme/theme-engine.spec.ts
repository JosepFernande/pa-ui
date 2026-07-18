import { DEFAULT_THEME, type PaThemeConfig, type PaThemeOptions } from './theme.tokens';
import { mergeTheme } from './theme-engine';

describe('mergeTheme', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  describe('no config provided', () => {
    it('returns DEFAULT_THEME exactly when config is undefined', () => {
      const result = mergeTheme(undefined, undefined);
      expect(result).toEqual(DEFAULT_THEME);
    });

    it('does not emit a console.warn', () => {
      mergeTheme(undefined, undefined);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('returns a fresh copy, never the DEFAULT_THEME reference — mutating the result must not corrupt the shared singleton', () => {
      const result = mergeTheme(undefined, undefined);
      result.colors['primary'] = 'mutated';
      expect(DEFAULT_THEME.colors['primary']).toBe('#2563eb');
    });
  });

  describe('extendDefaults true (default) merges over defaults', () => {
    it('overrides the given key and keeps the other 4 defaults when options is undefined', () => {
      const config: PaThemeConfig = { colors: { primary: '#f00' } };
      const result = mergeTheme(config, undefined);
      expect(result.colors['primary']).toBe('#f00');
      expect(result.colors['success']).toBe(DEFAULT_THEME.colors['success']);
      expect(result.colors['danger']).toBe(DEFAULT_THEME.colors['danger']);
      expect(result.colors['warning']).toBe(DEFAULT_THEME.colors['warning']);
      expect(result.colors['neutral']).toBe(DEFAULT_THEME.colors['neutral']);
    });

    it('overrides the given key and keeps the other 4 defaults when extendDefaults is explicitly true', () => {
      const config: PaThemeConfig = { colors: { danger: '#123456' } };
      const options: PaThemeOptions = { extendDefaults: true };
      const result = mergeTheme(config, options);
      expect(result.colors['danger']).toBe('#123456');
      expect(result.colors['primary']).toBe(DEFAULT_THEME.colors['primary']);
      expect(result.colors['success']).toBe(DEFAULT_THEME.colors['success']);
      expect(result.colors['warning']).toBe(DEFAULT_THEME.colors['warning']);
      expect(result.colors['neutral']).toBe(DEFAULT_THEME.colors['neutral']);
    });

    it('does not emit a console.warn', () => {
      mergeTheme({ colors: { primary: '#f00' } }, undefined);
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });

  describe('open color dictionary', () => {
    it('includes a custom key alongside the 5 defaults with extendDefaults true', () => {
      const config: PaThemeConfig = { colors: { brand: '#00f' } };
      const result = mergeTheme(config, { extendDefaults: true });
      expect(result.colors['brand']).toBe('#00f');
      expect(result.colors['primary']).toBe(DEFAULT_THEME.colors['primary']);
      expect(result.colors['success']).toBe(DEFAULT_THEME.colors['success']);
      expect(result.colors['danger']).toBe(DEFAULT_THEME.colors['danger']);
      expect(result.colors['warning']).toBe(DEFAULT_THEME.colors['warning']);
      expect(result.colors['neutral']).toBe(DEFAULT_THEME.colors['neutral']);
    });

    it('does not validate keys against a closed enum', () => {
      const config: PaThemeConfig = { colors: { 'anything-goes': '#abcdef' } };
      const result = mergeTheme(config, { extendDefaults: true });
      expect(result.colors['anything-goes']).toBe('#abcdef');
    });
  });

  describe('extendDefaults false with all 5 base colors given', () => {
    it('returns ONLY the given keys, with no defaults merged in', () => {
      const config: PaThemeConfig = {
        colors: {
          primary: '#111111',
          success: '#222222',
          danger: '#333333',
          warning: '#444444',
          neutral: '#555555',
        },
      };
      const result = mergeTheme(config, { extendDefaults: false });
      expect(result.colors).toEqual(config.colors);
    });

    it('does not emit a console.warn', () => {
      const config: PaThemeConfig = {
        colors: {
          primary: '#111111',
          success: '#222222',
          danger: '#333333',
          warning: '#444444',
          neutral: '#555555',
        },
      };
      mergeTheme(config, { extendDefaults: false });
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });

  describe('extendDefaults false with missing base colors', () => {
    it('returns ONLY the given colors, without backfilling the missing base keys', () => {
      const config: PaThemeConfig = { colors: { primary: '#f00' } };
      const result = mergeTheme(config, { extendDefaults: false });
      expect(result.colors).toEqual({ primary: '#f00' });
      expect(result.colors['success']).toBeUndefined();
      expect(result.colors['danger']).toBeUndefined();
      expect(result.colors['warning']).toBeUndefined();
      expect(result.colors['neutral']).toBeUndefined();
    });

    it('emits exactly one console.warn naming the missing base colors', () => {
      const config: PaThemeConfig = { colors: { primary: '#f00' } };
      mergeTheme(config, { extendDefaults: false });
      expect(warnSpy).toHaveBeenCalledTimes(1);
      const [message] = warnSpy.mock.calls[0] as [string];
      expect(message).toEqual(expect.stringContaining('success'));
      expect(message).toEqual(expect.stringContaining('danger'));
      expect(message).toEqual(expect.stringContaining('warning'));
      expect(message).toEqual(expect.stringContaining('neutral'));
      expect(message).not.toEqual(expect.stringContaining('primary'));
    });

    it('does not throw', () => {
      const config: PaThemeConfig = { colors: {} };
      expect(() => mergeTheme(config, { extendDefaults: false })).not.toThrow();
    });

    it('emits console.warn even when colors is an empty object, naming all 5 base keys', () => {
      const config: PaThemeConfig = { colors: {} };
      mergeTheme(config, { extendDefaults: false });
      expect(warnSpy).toHaveBeenCalledTimes(1);
      const [message] = warnSpy.mock.calls[0] as [string];
      expect(message).toEqual(expect.stringContaining('primary'));
      expect(message).toEqual(expect.stringContaining('success'));
      expect(message).toEqual(expect.stringContaining('danger'));
      expect(message).toEqual(expect.stringContaining('warning'));
      expect(message).toEqual(expect.stringContaining('neutral'));
    });
  });

  describe('custom defaults parameter', () => {
    it('uses the provided defaults instead of DEFAULT_THEME when config is undefined', () => {
      const customDefaults = { colors: { primary: '#custom' } };
      const result = mergeTheme(undefined, undefined, customDefaults);
      expect(result).toEqual(customDefaults);
    });
  });
});
