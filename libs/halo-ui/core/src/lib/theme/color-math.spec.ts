import { hexToRgb, rgbToHsl, hslToRgb, hexToHsl, hslToHex, relativeLuminance } from './color-math';

describe('hexToRgb / rgbToHsl / hexToHsl round-trip (Task 1.1)', () => {
  it('parses a 6-digit hex into exact RGB channels', () => {
    expect(hexToRgb('#3366ff')).toEqual({ r: 51, g: 102, b: 255 });
  });

  it('parses a 3-digit hex into exact RGB channels', () => {
    expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('converts #3366ff to HSL(225, 100, 60)', () => {
    expect(hexToHsl('#3366ff')).toEqual({ h: 225, s: 100, l: 60 });
  });

  it('converts #fff (3-digit) to HSL(0, 0, 100)', () => {
    expect(hexToHsl('#fff')).toEqual({ h: 0, s: 0, l: 100 });
  });

  it('converts #ffffff (6-digit) to HSL(0, 0, 100)', () => {
    expect(hexToHsl('#ffffff')).toEqual({ h: 0, s: 0, l: 100 });
  });

  it('converts #000000 to HSL(0, 0, 0)', () => {
    expect(hexToHsl('#000000')).toEqual({ h: 0, s: 0, l: 0 });
  });

  it('round-trips #3366ff through hexToRgb -> rgbToHsl -> hslToRgb -> hslToHex back to the original hex', () => {
    const rgb = hexToRgb('#3366ff');
    const hsl = rgbToHsl(rgb);
    expect(hslToHex(hsl)).toBe('#3366ff');
  });

  it('round-trips #ffffff through the full pipeline back to itself', () => {
    expect(hslToHex(hexToHsl('#ffffff'))).toBe('#ffffff');
  });

  it('round-trips #000000 through the full pipeline back to itself', () => {
    expect(hslToHex(hexToHsl('#000000'))).toBe('#000000');
  });

  it('exposes hslToRgb as the inverse of rgbToHsl for #3366ff', () => {
    const original = { r: 51, g: 102, b: 255 };
    const hsl = rgbToHsl(original);
    const roundTripped = hslToRgb(hsl);
    expect(Math.round(roundTripped.r)).toBe(original.r);
    expect(Math.round(roundTripped.g)).toBe(original.g);
    expect(Math.round(roundTripped.b)).toBe(original.b);
  });

  it('converts saturated primary #ff0000 to HSL(0, 100, 50) and round-trips back', () => {
    expect(hexToHsl('#ff0000')).toEqual({ h: 0, s: 100, l: 50 });
    expect(hslToHex(hexToHsl('#ff0000'))).toBe('#ff0000');
  });

  it('converts saturated secondary #00ff00 to HSL(120, 100, 50) and round-trips back', () => {
    expect(hexToHsl('#00ff00')).toEqual({ h: 120, s: 100, l: 50 });
    expect(hslToHex(hexToHsl('#00ff00'))).toBe('#00ff00');
  });

  it('converts mid-gray #808080 to zero saturation and round-trips back', () => {
    const hsl = hexToHsl('#808080');
    expect(hsl.s).toBe(0);
    expect(hsl.h).toBe(0);
    expect(hslToHex(hsl)).toBe('#808080');
  });

  it('wraps a negative intermediate hue back into [0,360) when blue exceeds green (rgbToHsl branch)', () => {
    const hsl = rgbToHsl({ r: 255, g: 0, b: 128 });
    expect(hsl.h).toBeCloseTo(329.88, 1);
  });

  it.each([
    [30, { r: 255, g: 127.5, b: 0 }],
    [90, { r: 127.5, g: 255, b: 0 }],
    [150, { r: 0, g: 255, b: 127.5 }],
    [210, { r: 0, g: 127.5, b: 255 }],
    [270, { r: 127.5, g: 0, b: 255 }],
    [330, { r: 255, g: 0, b: 127.5 }],
  ])('hslToRgb covers every 60-degree hue sector (h=%i)', (h, expected) => {
    const rgb = hslToRgb({ h, s: 100, l: 50 });
    expect(rgb.r).toBeCloseTo(expected.r, 5);
    expect(rgb.g).toBeCloseTo(expected.g, 5);
    expect(rgb.b).toBeCloseTo(expected.b, 5);
  });
});

describe('relativeLuminance (Task 1.3 — WCAG 2.1 gamma-corrected sRGB)', () => {
  it('returns 0 for pure black', () => {
    expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBe(0);
  });

  it('returns 1 for pure white', () => {
    expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBe(1);
  });

  it('returns ~0.2159 for mid-gray #808080 (128,128,128)', () => {
    expect(relativeLuminance({ r: 128, g: 128, b: 128 })).toBeCloseTo(0.21586, 5);
  });

  it('returns exactly 0.2126 for pure red — high luminance despite low perceived brightness', () => {
    expect(relativeLuminance({ r: 255, g: 0, b: 0 })).toBeCloseTo(0.2126, 10);
  });
});

describe('malformed hex detection (Task 1.5 — consumed by Phase 2 fail-soft skip)', () => {
  it('throws on invalid hex characters ("#zzz")', () => {
    expect(() => hexToRgb('#zzz')).toThrow();
  });

  it('throws on wrong-length hex ("#12345")', () => {
    expect(() => hexToRgb('#12345')).toThrow();
  });
});
