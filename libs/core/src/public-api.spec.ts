import * as publicApi from './public-api';
import type { PaThemeConfig, PaThemeOptions, ResolvedTheme } from './public-api';

describe('public-api — theme engine surface (Issue #46)', () => {
  it('exports providePaTheme as a function', () => {
    expect(typeof publicApi.providePaTheme).toBe('function');
  });

  it('exports PaThemeService as a class', () => {
    expect(typeof publicApi.PaThemeService).toBe('function');
  });

  it('exports DEFAULT_THEME with the 5 default color keys', () => {
    expect(publicApi.DEFAULT_THEME.colors).toEqual({
      primary: expect.any(String),
      success: expect.any(String),
      danger: expect.any(String),
      warning: expect.any(String),
      neutral: expect.any(String),
    });
  });

  it('exports PaThemeConfig, PaThemeOptions, and ResolvedTheme as usable types', () => {
    const config: PaThemeConfig = { colors: { primary: '#000' } };
    const options: PaThemeOptions = { extendDefaults: false };
    const resolved: ResolvedTheme = publicApi.DEFAULT_THEME;
    expect(config.colors['primary']).toBe('#000');
    expect(options.extendDefaults).toBe(false);
    expect(resolved.colors['primary']).toBeDefined();
  });

  it('does NOT export mergeTheme, PA_THEME_TOKEN, or PA_THEME_STATE_KEY (internal surface)', () => {
    expect((publicApi as unknown as Record<string, unknown>)['mergeTheme']).toBeUndefined();
    expect((publicApi as unknown as Record<string, unknown>)['PA_THEME_TOKEN']).toBeUndefined();
    expect((publicApi as unknown as Record<string, unknown>)['PA_THEME_STATE_KEY']).toBeUndefined();
  });

  it('still exports PaUiComponent (existing entry-point export)', () => {
    expect(typeof publicApi.PaUiComponent).toBe('function');
  });
});
