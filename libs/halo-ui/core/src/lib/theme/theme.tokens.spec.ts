import { InjectionToken } from '@angular/core';
import { HA_PRIMARY_ANCHOR } from '../foundation/foundation.tokens';
import {
  DEFAULT_THEME,
  HA_THEME_TOKEN,
  HA_THEME_STATE_KEY,
  type HaColorValue,
  type HaColorVariants,
  type HaTheme,
  type HaThemeOptions,
  type ResolvedTheme,
} from './theme.tokens';

const HEX_COLOR = /^#[0-9a-fA-F]{3,8}$/;

describe('theme.tokens', () => {
  describe('DEFAULT_THEME', () => {
    it("exposes exactly the brand-anchor `primary` key — every other semantic color lives in the consuming page's own provider, not the shared theme", () => {
      const keys = Object.keys(DEFAULT_THEME.colors);
      expect(keys).toEqual(['primary']);
    });

    it('primary is a plain hex string resolved from HA_PRIMARY_ANCHOR, not an object-shaped variant', () => {
      expect(DEFAULT_THEME.colors['primary']).toBe(HA_PRIMARY_ANCHOR);
      expect(DEFAULT_THEME.colors['primary']).toMatch(HEX_COLOR);
    });

    it('is frozen so importing it from the public API cannot corrupt the shared singleton', () => {
      expect(Object.isFrozen(DEFAULT_THEME)).toBe(true);
      expect(Object.isFrozen(DEFAULT_THEME.colors)).toBe(true);
      expect(() => {
        'use strict';
        (DEFAULT_THEME.colors as Record<string, string>)['primary'] = 'mutated';
      }).toThrow();
      expect(DEFAULT_THEME.colors['primary']).toBe(HA_PRIMARY_ANCHOR);
    });
  });

  describe('HA_THEME_TOKEN', () => {
    it('is an Angular InjectionToken instance', () => {
      expect(HA_THEME_TOKEN).toBeInstanceOf(InjectionToken);
    });

    it('has a descriptive token name', () => {
      expect(HA_THEME_TOKEN.toString()).toContain('ha-theme');
    });
  });

  describe('HA_THEME_STATE_KEY', () => {
    it('is created from the "ha-theme" key string', () => {
      expect(HA_THEME_STATE_KEY as unknown as string).toBe('ha-theme');
    });
  });

  describe('type contracts', () => {
    it('HaTheme.semantic accepts an open colors dictionary', () => {
      const theme: HaTheme = { semantic: { primary: '#111111', brand: '#00ff00' } };
      expect(theme.semantic?.['brand']).toBe('#00ff00');
    });

    it('HaThemeOptions makes extendDefaults an optional boolean', () => {
      const withOption: HaThemeOptions = { extendDefaults: false };
      const withoutOption: HaThemeOptions = {};
      expect(withOption.extendDefaults).toBe(false);
      expect(withoutOption.extendDefaults).toBeUndefined();
    });

    it('ResolvedTheme shape matches DEFAULT_THEME', () => {
      const resolved: ResolvedTheme = DEFAULT_THEME;
      expect(resolved.colors['primary']).toBe(DEFAULT_THEME.colors['primary']);
    });

    it('HaTheme.semantic accepts an object-shaped color entry (HaColorVariants) alongside plain strings', () => {
      const theme: HaTheme = {
        semantic: {
          primary: { base: '#16709e', hover: '#0a4f6b' },
          brand: '#00ff00',
        },
      };
      const primary = theme.semantic?.['primary'] as HaColorVariants;
      expect(primary.base).toBe('#16709e');
      expect(primary.hover).toBe('#0a4f6b');
      expect(theme.semantic?.['brand']).toBe('#00ff00');
    });

    it('ResolvedTheme accepts an object-shaped color entry and DEFAULT_THEME stays assignable', () => {
      const resolvedWithObject: ResolvedTheme = {
        colors: { primary: { base: '#16709e' } },
      };
      expect((resolvedWithObject.colors['primary'] as HaColorVariants).base).toBe('#16709e');

      const resolved: ResolvedTheme = DEFAULT_THEME;
      expect(resolved.colors['primary']).toBe(DEFAULT_THEME.colors['primary']);
    });

    it('HaColorValue is a union of string and HaColorVariants', () => {
      const asString: HaColorValue = '#16709e';
      const asObject: HaColorValue = { base: '#16709e', active: '#0a4f6b' };
      expect(asString).toBe('#16709e');
      expect((asObject as HaColorVariants).base).toBe('#16709e');
    });
  });
});
