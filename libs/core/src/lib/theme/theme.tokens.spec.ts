import { InjectionToken } from '@angular/core';
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

/**
 * Full DEFAULT_THEME roster (decision/halo-ui-default-theme-color-naming),
 * updated by the single-brand-scale breaking change: the literal
 * `dark-blue`/`light-blue`/`dark-green`/`light-green` brand hues and the
 * `secondary` token are removed entirely (no alias kept). `danger` is a
 * deprecated twin alias of `error`, asserted separately below — it is
 * intentionally excluded from this "first-class roster" list.
 */
const FLAT_SEMANTIC_COLOR_KEYS = [
  'success',
  'error',
  'warning',
  'alert',
  'info',
  'neutral',
] as const;
const VARIANT_COLOR_KEYS = ['primary'] as const;
const ALL_FIRST_CLASS_KEYS = [...VARIANT_COLOR_KEYS, ...FLAT_SEMANTIC_COLOR_KEYS] as const;

const EXPECTED_ROSTER = {
  primary: { base: '#4f46e5', hover: '#4338ca' },
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
    it('exposes exactly the first-class roster keys (primary + flat semantics + neutral) plus the deprecated `danger` alias', () => {
      const keys = Object.keys(DEFAULT_THEME.colors);
      expect(keys.sort()).toEqual([...ALL_FIRST_CLASS_KEYS, 'danger'].sort());
    });

    it('does not expose the removed literal brand hues or the removed `secondary` token', () => {
      const keys = Object.keys(DEFAULT_THEME.colors);
      expect(keys).not.toContain('dark-blue');
      expect(keys).not.toContain('light-blue');
      expect(keys).not.toContain('dark-green');
      expect(keys).not.toContain('light-green');
      expect(keys).not.toContain('secondary');
    });

    it.each(FLAT_SEMANTIC_COLOR_KEYS)('has a valid hex color value for "%s"', (key) => {
      expect(DEFAULT_THEME.colors[key]).toMatch(HEX_COLOR);
    });

    it.each(VARIANT_COLOR_KEYS)(
      'has an explicit { base, hover } variant object for "%s", not a plain string',
      (key) => {
        const entry = DEFAULT_THEME.colors[key] as HaColorVariants;
        expect(typeof entry).toBe('object');
        expect(entry.base).toMatch(HEX_COLOR);
        expect(entry.hover).toMatch(HEX_COLOR);
      },
    );

    it('matches the exact roster from decision/halo-ui-default-theme-color-naming', () => {
      expect(DEFAULT_THEME).toEqual({ colors: EXPECTED_ROSTER });
    });

    it('primary uses the explicit hover convention (primary-600 base / primary-700 hover), not auto-derivation', () => {
      const primary = DEFAULT_THEME.colors['primary'] as HaColorVariants;
      expect(primary.base).toBe('#4f46e5');
      expect(primary.hover).toBe('#4338ca');
    });

    it('is frozen so importing it from the public API cannot corrupt the shared singleton', () => {
      expect(Object.isFrozen(DEFAULT_THEME)).toBe(true);
      expect(Object.isFrozen(DEFAULT_THEME.colors)).toBe(true);
      expect(() => {
        'use strict';
        (DEFAULT_THEME.colors as Record<string, string>)['success'] = 'mutated';
      }).toThrow();
      expect(DEFAULT_THEME.colors['success']).toBe('#8fbf21');
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
