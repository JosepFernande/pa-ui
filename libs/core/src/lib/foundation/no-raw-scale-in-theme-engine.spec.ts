import * as fs from 'node:fs';
import * as path from 'node:path';
import { DEFAULT_THEME } from '../theme/theme.tokens';
import { PA_COLOR_SCALE_STEPS } from './foundation.types';
import { PA_FOUNDATION_PALETTE } from './foundation.tokens';

/**
 * Requirement: `deriveTokens()` Never Processes Raw Scales.
 *
 * "Raw 25-900 scale values MUST NOT be passed to `deriveTokens()` or
 * registered as `PaThemeConfig.colors` entries." (spec: foundation-tokens)
 *
 * Two independent proofs:
 * 1. Runtime shape check — no `DEFAULT_THEME.colors` entry is a
 *    `PaColorScale`/`PaPartialColorScale`-shaped object (i.e. an object
 *    whose keys are all valid scale steps).
 * 2. Static source-inspection check — `theme/theme-engine.ts` and
 *    `theme/theme.tokens.ts` (the only two producers of `ResolvedTheme`)
 *    never import anything from the `foundation/` directory, so there is no
 *    code path through which a raw scale could reach `mergeTheme`/
 *    `deriveTokens` even indirectly.
 */

function isColorScaleShaped(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const keys = Object.keys(value);
  if (keys.length === 0) {
    return false;
  }
  return keys.every((key) =>
    PA_COLOR_SCALE_STEPS.includes(Number(key) as (typeof PA_COLOR_SCALE_STEPS)[number]),
  );
}

describe('deriveTokens() never processes raw Foundation color scales', () => {
  it('no DEFAULT_THEME.colors entry is a PaColorScale/PaPartialColorScale-shaped object', () => {
    const offendingEntries = Object.entries(DEFAULT_THEME.colors).filter(([, value]) =>
      isColorScaleShaped(value),
    );

    expect(offendingEntries).toEqual([]);
  });

  it('sanity check: the detector actually recognizes a real Foundation scale as scale-shaped', () => {
    // Proves the detector above is not a tautology — it must flag a REAL
    // Foundation palette entry, or the previous assertion would be trivial.
    expect(isColorScaleShaped(PA_FOUNDATION_PALETTE['dark-blue'])).toBe(true);
    expect(isColorScaleShaped('#0a4f6b')).toBe(false);
    expect(isColorScaleShaped({ base: '#0a4f6b', hover: '#083f55' })).toBe(false);
  });

  it('theme-engine.ts and theme.tokens.ts never import from foundation/ (no code path for a raw scale to reach mergeTheme/deriveTokens)', () => {
    const themeEngineSource = fs.readFileSync(
      path.resolve(__dirname, '../theme/theme-engine.ts'),
      'utf-8',
    );
    const themeTokensSource = fs.readFileSync(
      path.resolve(__dirname, '../theme/theme.tokens.ts'),
      'utf-8',
    );
    const colorDerivationSource = fs.readFileSync(
      path.resolve(__dirname, '../theme/color-derivation.ts'),
      'utf-8',
    );

    expect(themeEngineSource).not.toMatch(/from ['"].*foundation/);
    expect(themeTokensSource).not.toMatch(/from ['"].*foundation/);
    expect(colorDerivationSource).not.toMatch(/from ['"].*foundation/);
  });
});
