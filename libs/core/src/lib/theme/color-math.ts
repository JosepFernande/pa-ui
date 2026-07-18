/**
 * Pure, framework-free color-space primitives: hex ↔ rgb ↔ hsl conversions
 * plus WCAG 2.1 relative luminance. Zero `@angular/*` imports and
 * `TestBed`-free (Requirement: Explicit Non-Requirements). Consumed by
 * `color-derivation.ts`.
 */

/** 0-255 integer channels. */
export interface RGB {
  r: number;
  g: number;
  b: number;
}

/** Hue 0-360, saturation/lightness 0-100 (float precision until `hslToHex`). */
export interface HSL {
  h: number;
  s: number;
  l: number;
}

const HEX_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/**
 * Parses a `#rgb` or `#rrggbb` hex color string into 0-255 RGB channels.
 * Throws on malformed input (Task 1.5) — `color-derivation.ts` catches this
 * to fail-soft skip malformed color entries.
 */
export function hexToRgb(hex: string): RGB {
  if (!HEX_PATTERN.test(hex)) {
    throw new Error(`[pa-ui] Invalid hex color: "${hex}"`);
  }

  const value = hex.slice(1);
  const expanded =
    value.length === 3
      ? value
          .split('')
          .map((ch) => ch + ch)
          .join('')
      : value;

  return {
    r: parseInt(expanded.slice(0, 2), 16),
    g: parseInt(expanded.slice(2, 4), 16),
    b: parseInt(expanded.slice(4, 6), 16),
  };
}

/** Converts 0-255 RGB channels to HSL (float precision — no rounding here). */
export function rgbToHsl({ r, g, b }: RGB): HSL {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    if (max === rNorm) {
      h = ((gNorm - bNorm) / delta) % 6;
    } else if (max === gNorm) {
      h = (bNorm - rNorm) / delta + 2;
    } else {
      h = (rNorm - gNorm) / delta + 4;
    }

    h *= 60;
    if (h < 0) {
      h += 360;
    }
  }

  return { h, s: s * 100, l: l * 100 };
}

/**
 * Converts HSL back to 0-255 RGB channels. Keeps float precision — rounding
 * happens ONLY in `hslToHex` (resolved Open Question 3), so intermediate
 * lightness adjustments in `color-derivation.ts` never accumulate rounding
 * drift.
 */
export function hslToRgb({ h, s, l }: HSL): RGB {
  const sNorm = s / 100;
  const lNorm = l / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let rPrime: number;
  let gPrime: number;
  let bPrime: number;

  if (h < 60) {
    [rPrime, gPrime, bPrime] = [c, x, 0];
  } else if (h < 120) {
    [rPrime, gPrime, bPrime] = [x, c, 0];
  } else if (h < 180) {
    [rPrime, gPrime, bPrime] = [0, c, x];
  } else if (h < 240) {
    [rPrime, gPrime, bPrime] = [0, x, c];
  } else if (h < 300) {
    [rPrime, gPrime, bPrime] = [x, 0, c];
  } else {
    [rPrime, gPrime, bPrime] = [c, 0, x];
  }

  return {
    r: (rPrime + m) * 255,
    g: (gPrime + m) * 255,
    b: (bPrime + m) * 255,
  };
}

/** Parses a hex color directly into HSL (`hexToRgb` composed with `rgbToHsl`). */
export function hexToHsl(hex: string): HSL {
  return rgbToHsl(hexToRgb(hex));
}

/**
 * Converts HSL back to a lowercase `#rrggbb` hex string. Channels are
 * rounded and clamped to `[0,255]` ONLY here (resolved Open Question 3).
 */
export function hslToHex(hsl: HSL): string {
  const { r, g, b } = hslToRgb(hsl);

  const toHexChannel = (channel: number): string => {
    const clamped = Math.min(255, Math.max(0, Math.round(channel)));
    return clamped.toString(16).padStart(2, '0');
  };

  return `#${toHexChannel(r)}${toHexChannel(g)}${toHexChannel(b)}`;
}

/**
 * WCAG 2.1 relative luminance for gamma-corrected sRGB channels
 * (Requirement: WCAG Contrast Foreground Selection). Coefficients
 * 0.2126/0.7152/0.0722 per spec, linearized via the exact sRGB piecewise
 * formula.
 */
export function relativeLuminance({ r, g, b }: RGB): number {
  const linearize = (channel: number): number => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };

  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}
