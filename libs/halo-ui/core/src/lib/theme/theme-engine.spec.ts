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
      result.colors['primary'] = 'mutated';
      expect(DEFAULT_THEME.colors['primary']).not.toBe('mutated');
    });
  });

  describe('extendDefaults true (default) merges over defaults', () => {
    it('overrides the given key when options is undefined', () => {
      const semantic: Record<string, HaColorValue> = { primary: '#f00' };
      const result = mergeTheme(semantic, undefined);
      expect(result.colors['primary']).toBe('#f00');
    });

    it("overrides a custom key and keeps `primary`'s default when extendDefaults is explicitly true", () => {
      const semantic: Record<string, HaColorValue> = { brand: '#123456' };
      const options: HaThemeOptions = { extendDefaults: true };
      const result = mergeTheme(semantic, options);
      expect(result.colors['brand']).toBe('#123456');
      expect(result.colors['primary']).toBe(DEFAULT_THEME.colors['primary']);
    });

    it('does not emit a console.warn', () => {
      mergeTheme({ primary: '#f00' }, undefined);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('includes a custom "brand" color alongside every entry of the DEFAULT_THEME roster', () => {
      const semantic: Record<string, HaColorValue> = { brand: '#ec4899' };
      const result = mergeTheme(semantic, undefined);
      expect(result.colors['brand']).toBe('#ec4899');
      for (const key of Object.keys(DEFAULT_THEME.colors)) {
        expect(result.colors[key]).toEqual(DEFAULT_THEME.colors[key]);
      }
    });
  });

  describe('open color dictionary', () => {
    it('includes a custom key alongside the default with extendDefaults true', () => {
      const semantic: Record<string, HaColorValue> = { brand: '#00f' };
      const result = mergeTheme(semantic, { extendDefaults: true });
      expect(result.colors['brand']).toBe('#00f');
      expect(result.colors['primary']).toBe(DEFAULT_THEME.colors['primary']);
    });

    it('does not validate keys against a closed enum', () => {
      const semantic: Record<string, HaColorValue> = { 'anything-goes': '#abcdef' };
      const result = mergeTheme(semantic, { extendDefaults: true });
      expect(result.colors['anything-goes']).toBe('#abcdef');
    });
  });

  describe('extendDefaults false with the base color given', () => {
    const fullBaseSemantic: Record<string, HaColorValue> = {
      primary: '#111111',
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

  describe('extendDefaults false with the base color missing', () => {
    it('returns ONLY the given colors, without backfilling the missing base key', () => {
      const semantic: Record<string, HaColorValue> = { brand: '#f00' };
      const result = mergeTheme(semantic, { extendDefaults: false });
      expect(result.colors).toEqual({ brand: '#f00' });
      expect(result.colors['primary']).toBeUndefined();
    });

    it('emits exactly one console.warn naming the missing base color', () => {
      const semantic: Record<string, HaColorValue> = { brand: '#f00' };
      mergeTheme(semantic, { extendDefaults: false });
      expect(warnSpy).toHaveBeenCalledTimes(1);
      const [message] = warnSpy.mock.calls[0] as [string];
      expect(message).toEqual(expect.stringContaining('primary'));
    });

    it('does not throw', () => {
      const semantic: Record<string, HaColorValue> = {};
      expect(() => mergeTheme(semantic, { extendDefaults: false })).not.toThrow();
    });

    it('emits console.warn even when semantic is an empty object', () => {
      const semantic: Record<string, HaColorValue> = {};
      mergeTheme(semantic, { extendDefaults: false });
      expect(warnSpy).toHaveBeenCalledTimes(1);
      const [message] = warnSpy.mock.calls[0] as [string];
      expect(message).toEqual(expect.stringContaining('primary'));
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
