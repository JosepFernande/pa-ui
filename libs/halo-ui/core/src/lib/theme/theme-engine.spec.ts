import { DEFAULT_THEME, type HaColorValue, type HaThemeOptions } from './theme.tokens';
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
    it('returns DEFAULT_THEME exactly when semantic is undefined', () => {
      const result = mergeTheme(undefined, undefined);
      expect(result).toEqual(DEFAULT_THEME);
    });

    it('does not emit a console.warn', () => {
      mergeTheme(undefined, undefined);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('returns a fresh copy, never the DEFAULT_THEME reference — mutating the result must not corrupt the shared singleton', () => {
      const result = mergeTheme(undefined, undefined);
      result.colors['success'] = 'mutated';
      expect(DEFAULT_THEME.colors['success']).toBe('#8fbf21');
    });
  });

  describe('extendDefaults true (default) merges over defaults', () => {
    it('overrides the given key and keeps the other 4 defaults when options is undefined', () => {
      const semantic: Record<string, HaColorValue> = { primary: '#f00' };
      const result = mergeTheme(semantic, undefined);
      expect(result.colors['primary']).toBe('#f00');
      expect(result.colors['success']).toBe(DEFAULT_THEME.colors['success']);
      expect(result.colors['danger']).toBe(DEFAULT_THEME.colors['danger']);
      expect(result.colors['warning']).toBe(DEFAULT_THEME.colors['warning']);
      expect(result.colors['neutral']).toBe(DEFAULT_THEME.colors['neutral']);
    });

    it('overrides the given key and keeps the other 4 defaults when extendDefaults is explicitly true', () => {
      const semantic: Record<string, HaColorValue> = { danger: '#123456' };
      const options: HaThemeOptions = { extendDefaults: true };
      const result = mergeTheme(semantic, options);
      expect(result.colors['danger']).toBe('#123456');
      expect(result.colors['primary']).toBe(DEFAULT_THEME.colors['primary']);
      expect(result.colors['success']).toBe(DEFAULT_THEME.colors['success']);
      expect(result.colors['warning']).toBe(DEFAULT_THEME.colors['warning']);
      expect(result.colors['neutral']).toBe(DEFAULT_THEME.colors['neutral']);
    });

    it('does not emit a console.warn', () => {
      mergeTheme({ primary: '#f00' }, undefined);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('Task 1.6 — includes a custom "brand" color alongside every entry of the new full DEFAULT_THEME roster', () => {
      const semantic: Record<string, HaColorValue> = { brand: '#ec4899' };
      const result = mergeTheme(semantic, undefined);
      expect(result.colors['brand']).toBe('#ec4899');
      for (const key of Object.keys(DEFAULT_THEME.colors)) {
        expect(result.colors[key]).toEqual(DEFAULT_THEME.colors[key]);
      }
    });
  });

  describe('open color dictionary', () => {
    it('includes a custom key alongside the 5 defaults with extendDefaults true', () => {
      const semantic: Record<string, HaColorValue> = { brand: '#00f' };
      const result = mergeTheme(semantic, { extendDefaults: true });
      expect(result.colors['brand']).toBe('#00f');
      expect(result.colors['primary']).toBe(DEFAULT_THEME.colors['primary']);
      expect(result.colors['success']).toBe(DEFAULT_THEME.colors['success']);
      expect(result.colors['danger']).toBe(DEFAULT_THEME.colors['danger']);
      expect(result.colors['warning']).toBe(DEFAULT_THEME.colors['warning']);
      expect(result.colors['neutral']).toBe(DEFAULT_THEME.colors['neutral']);
    });

    it('does not validate keys against a closed enum', () => {
      const semantic: Record<string, HaColorValue> = { 'anything-goes': '#abcdef' };
      const result = mergeTheme(semantic, { extendDefaults: true });
      expect(result.colors['anything-goes']).toBe('#abcdef');
    });
  });

  describe('extendDefaults false with all 7 base colors given', () => {
    const fullBaseSemantic: Record<string, HaColorValue> = {
      primary: '#111111',
      success: '#333333',
      error: '#444444',
      warning: '#555555',
      alert: '#666666',
      info: '#777777',
      neutral: '#888888',
    };

    it('returns ONLY the given keys, with no defaults merged in', () => {
      const result = mergeTheme(fullBaseSemantic, { extendDefaults: false });
      expect(result.colors).toEqual(fullBaseSemantic);
    });

    it('does not emit a console.warn', () => {
      mergeTheme(fullBaseSemantic, { extendDefaults: false });
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });

  describe('extendDefaults false with missing base colors', () => {
    it('returns ONLY the given colors, without backfilling the missing base keys', () => {
      const semantic: Record<string, HaColorValue> = { primary: '#f00' };
      const result = mergeTheme(semantic, { extendDefaults: false });
      expect(result.colors).toEqual({ primary: '#f00' });
      expect(result.colors['success']).toBeUndefined();
      expect(result.colors['error']).toBeUndefined();
      expect(result.colors['warning']).toBeUndefined();
      expect(result.colors['alert']).toBeUndefined();
      expect(result.colors['info']).toBeUndefined();
      expect(result.colors['neutral']).toBeUndefined();
    });

    it('emits exactly one console.warn naming the missing base colors', () => {
      const semantic: Record<string, HaColorValue> = { primary: '#f00' };
      mergeTheme(semantic, { extendDefaults: false });
      expect(warnSpy).toHaveBeenCalledTimes(1);
      const [message] = warnSpy.mock.calls[0] as [string];
      expect(message).toEqual(expect.stringContaining('success'));
      expect(message).toEqual(expect.stringContaining('error'));
      expect(message).toEqual(expect.stringContaining('warning'));
      expect(message).toEqual(expect.stringContaining('alert'));
      expect(message).toEqual(expect.stringContaining('info'));
      expect(message).toEqual(expect.stringContaining('neutral'));
      expect(message).not.toEqual(expect.stringContaining('primary,'));
    });

    it('does not throw', () => {
      const semantic: Record<string, HaColorValue> = {};
      expect(() => mergeTheme(semantic, { extendDefaults: false })).not.toThrow();
    });

    it('emits console.warn even when semantic is an empty object, naming all 7 base keys', () => {
      const semantic: Record<string, HaColorValue> = {};
      mergeTheme(semantic, { extendDefaults: false });
      expect(warnSpy).toHaveBeenCalledTimes(1);
      const [message] = warnSpy.mock.calls[0] as [string];
      expect(message).toEqual(expect.stringContaining('primary'));
      expect(message).toEqual(expect.stringContaining('success'));
      expect(message).toEqual(expect.stringContaining('error'));
      expect(message).toEqual(expect.stringContaining('warning'));
      expect(message).toEqual(expect.stringContaining('alert'));
      expect(message).toEqual(expect.stringContaining('info'));
      expect(message).toEqual(expect.stringContaining('neutral'));
    });

    it('does NOT require the deprecated "danger" alias key (D3 — deprecated aliases are deliberately not required)', () => {
      const semantic: Record<string, HaColorValue> = {
        primary: '#111111',
        success: '#333333',
        error: '#444444',
        warning: '#555555',
        alert: '#666666',
        info: '#777777',
        neutral: '#888888',
      };
      mergeTheme(semantic, { extendDefaults: false });
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });

  describe('custom defaults parameter', () => {
    it('uses the provided defaults instead of DEFAULT_THEME when semantic is undefined', () => {
      const customDefaults = { colors: { primary: '#custom' } };
      const result = mergeTheme(undefined, undefined, customDefaults);
      expect(result).toEqual(customDefaults);
    });
  });
});
