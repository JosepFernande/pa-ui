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
const DEFAULT_COLOR_KEYS = ['primary', 'success', 'danger', 'warning', 'neutral'] as const;

describe('theme.tokens', () => {
  describe('DEFAULT_THEME', () => {
    it('exposes exactly the 5 required base color keys', () => {
      const keys = Object.keys(DEFAULT_THEME.colors);
      expect(keys.sort()).toEqual([...DEFAULT_COLOR_KEYS].sort());
    });

    it.each(DEFAULT_COLOR_KEYS)('has a valid hex color value for "%s"', (key) => {
      expect(DEFAULT_THEME.colors[key]).toMatch(HEX_COLOR);
    });

    it('is a literal object matching a stable snapshot shape', () => {
      expect(DEFAULT_THEME).toEqual({
        colors: {
          primary: DEFAULT_THEME.colors['primary'],
          success: DEFAULT_THEME.colors['success'],
          danger: DEFAULT_THEME.colors['danger'],
          warning: DEFAULT_THEME.colors['warning'],
          neutral: DEFAULT_THEME.colors['neutral'],
        },
      });
    });

    it('is frozen so importing it from the public API cannot corrupt the shared singleton', () => {
      expect(Object.isFrozen(DEFAULT_THEME)).toBe(true);
      expect(Object.isFrozen(DEFAULT_THEME.colors)).toBe(true);
      expect(() => {
        'use strict';
        (DEFAULT_THEME.colors as Record<string, string>)['primary'] = 'mutated';
      }).toThrow();
      expect(DEFAULT_THEME.colors['primary']).toBe('#2563eb');
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
