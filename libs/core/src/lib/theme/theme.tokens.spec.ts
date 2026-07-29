import { InjectionToken } from '@angular/core';
import {
  DEFAULT_THEME,
  PA_THEME_TOKEN,
  PA_THEME_STATE_KEY,
  type PaColorValue,
  type PaColorVariants,
  type PaThemeConfig,
  type PaThemeOptions,
  type ResolvedTheme,
} from './theme.tokens';

const HEX_COLOR = /^#[0-9a-fA-F]{3,8}$/;

/**
 * Full DEFAULT_THEME roster (decision/pa-ui-default-theme-color-naming):
 * literal brand hues + semantic primary/secondary aliases (explicit inverted
 * hover) + the 1:1 semantic set + `neutral`. `danger` is a deprecated twin
 * alias of `error`, asserted separately below — it is intentionally excluded
 * from this "first-class roster" list.
 */
const LITERAL_COLOR_KEYS = ['dark-blue', 'light-blue', 'dark-green', 'light-green'] as const;
const FLAT_SEMANTIC_COLOR_KEYS = [
  'success',
  'error',
  'warning',
  'alert',
  'info',
  'neutral',
] as const;
const VARIANT_COLOR_KEYS = ['primary', 'secondary'] as const;
const ALL_FIRST_CLASS_KEYS = [
  ...LITERAL_COLOR_KEYS,
  ...VARIANT_COLOR_KEYS,
  ...FLAT_SEMANTIC_COLOR_KEYS,
] as const;

const EXPECTED_ROSTER = {
  'dark-blue': '#0a4f6b',
  'light-blue': '#16709e',
  'dark-green': '#507802',
  'light-green': '#8fbf21',
  primary: { base: '#16709e', hover: '#0a4f6b' },
  secondary: { base: '#8fbf21', hover: '#507802' },
  success: '#8fbf21',
  error: '#d71608',
  danger: '#d71608',
  warning: '#ed9613',
  alert: '#f8e115',
  info: '#16a3c3',
  neutral: '#4c4c4c',
} as const;

describe('theme.tokens', () => {
  describe('DEFAULT_THEME', () => {
    it('exposes exactly the first-class roster keys (literals + primary/secondary + flat semantics + neutral) plus the deprecated `danger` alias', () => {
      const keys = Object.keys(DEFAULT_THEME.colors);
      expect(keys.sort()).toEqual([...ALL_FIRST_CLASS_KEYS, 'danger'].sort());
    });

    it.each(LITERAL_COLOR_KEYS)('has a valid hex color value for literal "%s"', (key) => {
      expect(DEFAULT_THEME.colors[key]).toMatch(HEX_COLOR);
    });

    it.each(FLAT_SEMANTIC_COLOR_KEYS)('has a valid hex color value for "%s"', (key) => {
      expect(DEFAULT_THEME.colors[key]).toMatch(HEX_COLOR);
    });

    it.each(VARIANT_COLOR_KEYS)(
      'has an explicit { base, hover } variant object for "%s", not a plain string',
      (key) => {
        const entry = DEFAULT_THEME.colors[key] as PaColorVariants;
        expect(typeof entry).toBe('object');
        expect(entry.base).toMatch(HEX_COLOR);
        expect(entry.hover).toMatch(HEX_COLOR);
      },
    );

    it('matches the exact roster from decision/pa-ui-default-theme-color-naming', () => {
      expect(DEFAULT_THEME).toEqual({ colors: EXPECTED_ROSTER });
    });

    it('primary/secondary use the explicit inverted hover (light base / dark hover), not auto-derivation', () => {
      const primary = DEFAULT_THEME.colors['primary'] as PaColorVariants;
      const secondary = DEFAULT_THEME.colors['secondary'] as PaColorVariants;
      expect(primary.base).toBe(DEFAULT_THEME.colors['light-blue']);
      expect(primary.hover).toBe(DEFAULT_THEME.colors['dark-blue']);
      expect(secondary.base).toBe(DEFAULT_THEME.colors['light-green']);
      expect(secondary.hover).toBe(DEFAULT_THEME.colors['dark-green']);
    });

    it('is frozen so importing it from the public API cannot corrupt the shared singleton', () => {
      expect(Object.isFrozen(DEFAULT_THEME)).toBe(true);
      expect(Object.isFrozen(DEFAULT_THEME.colors)).toBe(true);
      expect(() => {
        'use strict';
        (DEFAULT_THEME.colors as Record<string, string>)['dark-blue'] = 'mutated';
      }).toThrow();
      expect(DEFAULT_THEME.colors['dark-blue']).toBe('#0a4f6b');
    });

    describe('`danger` deprecated alias (D3 — twin key, no resolution layer)', () => {
      it('resolves to the exact same hex value as `error`', () => {
        expect(DEFAULT_THEME.colors['danger']).toBe(DEFAULT_THEME.colors['error']);
        expect(DEFAULT_THEME.colors['danger']).toBe('#d71608');
      });

      it('is not part of the first-class roster (MUST NOT appear as a recommended option)', () => {
        expect(ALL_FIRST_CLASS_KEYS as readonly string[]).not.toContain('danger');
      });
    });
  });

  describe('PA_THEME_TOKEN', () => {
    it('is an Angular InjectionToken instance', () => {
      expect(PA_THEME_TOKEN).toBeInstanceOf(InjectionToken);
    });

    it('has a descriptive token name', () => {
      expect(PA_THEME_TOKEN.toString()).toContain('pa-theme');
    });
  });

  describe('PA_THEME_STATE_KEY', () => {
    it('is created from the "pa-theme" key string', () => {
      expect(PA_THEME_STATE_KEY as unknown as string).toBe('pa-theme');
    });
  });

  describe('type contracts', () => {
    it('PaThemeConfig accepts an open colors dictionary', () => {
      const config: PaThemeConfig = { colors: { primary: '#111111', brand: '#00ff00' } };
      expect(config.colors['brand']).toBe('#00ff00');
    });

    it('PaThemeOptions makes extendDefaults an optional boolean', () => {
      const withOption: PaThemeOptions = { extendDefaults: false };
      const withoutOption: PaThemeOptions = {};
      expect(withOption.extendDefaults).toBe(false);
      expect(withoutOption.extendDefaults).toBeUndefined();
    });

    it('ResolvedTheme shape matches DEFAULT_THEME', () => {
      const resolved: ResolvedTheme = DEFAULT_THEME;
      expect(resolved.colors['primary']).toBe(DEFAULT_THEME.colors['primary']);
    });

    it('PaThemeConfig accepts an object-shaped color entry (PaColorVariants) alongside plain strings', () => {
      const config: PaThemeConfig = {
        colors: {
          primary: { base: '#16709e', hover: '#0a4f6b' },
          brand: '#00ff00',
        },
      };
      const primary = config.colors['primary'] as PaColorVariants;
      expect(primary.base).toBe('#16709e');
      expect(primary.hover).toBe('#0a4f6b');
      expect(config.colors['brand']).toBe('#00ff00');
    });

    it('ResolvedTheme accepts an object-shaped color entry and DEFAULT_THEME stays assignable', () => {
      const resolvedWithObject: ResolvedTheme = {
        colors: { primary: { base: '#16709e' } },
      };
      expect((resolvedWithObject.colors['primary'] as PaColorVariants).base).toBe('#16709e');

      const resolved: ResolvedTheme = DEFAULT_THEME;
      expect(resolved.colors['primary']).toBe(DEFAULT_THEME.colors['primary']);
    });

    it('PaColorValue is a union of string and PaColorVariants', () => {
      const asString: PaColorValue = '#16709e';
      const asObject: PaColorValue = { base: '#16709e', active: '#0a4f6b' };
      expect(asString).toBe('#16709e');
      expect((asObject as PaColorVariants).base).toBe('#16709e');
    });
  });
});
