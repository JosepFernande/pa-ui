import * as fs from 'node:fs';
import * as path from 'node:path';
import { toFoundationCssVariables } from './foundation-css';
import { PA_FOUNDATION_PALETTE } from './foundation.tokens';

/**
 * Parity + shape guard for the shipped `theme.css` artifact (D1/D4/D5).
 * TS (`foundation.tokens.ts` + `foundation-css.ts`) is the source of truth;
 * `theme.css` is a hand-authored mirror. Drift between the two is caught
 * here instead of by a new build step (design's stated tradeoff).
 */

function readThemeCss(): string {
  return fs.readFileSync(path.resolve(__dirname, 'theme.css'), 'utf-8');
}

function extractRootBody(css: string): string {
  const match = css.match(/:root\s*{([\s\S]*)}/);
  if (!match) {
    throw new Error('theme.css: no :root block found');
  }
  return match[1];
}

/** Parses `--name: value;` declarations, stripping any trailing inline comment from the value. */
function parseCssCustomProperties(body: string): Record<string, string> {
  const declRegex = /(--[a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;
  const result: Record<string, string> = {};
  let match: RegExpExecArray | null;
  while ((match = declRegex.exec(body)) !== null) {
    const [, name, rawValue] = match;
    result[name] = rawValue.replace(/\/\*.*?\*\//g, '').trim();
  }
  return result;
}

describe('Foundation CSS parity (theme.css <-> toFoundationCssVariables())', () => {
  it('theme.css declares the exact same custom-property names as toFoundationCssVariables()', () => {
    const cssVars = parseCssCustomProperties(extractRootBody(readThemeCss()));
    const tsVars = toFoundationCssVariables();

    expect(Object.keys(cssVars).sort()).toEqual(Object.keys(tsVars).sort());
  });

  it('every declared value in theme.css matches the TS-computed value exactly', () => {
    const cssVars = parseCssCustomProperties(extractRootBody(readThemeCss()));
    const tsVars = toFoundationCssVariables();

    for (const [name, value] of Object.entries(tsVars)) {
      expect(cssVars[name]).toBe(value);
    }
  });

  it('produces a non-trivial number of variables (foundation + semantic non-color + component defaults)', () => {
    const tsVars = toFoundationCssVariables();
    expect(Object.keys(tsVars).length).toBeGreaterThan(100);
  });
});

describe('theme.css shape guard', () => {
  it('uses :root as its only selector', () => {
    const css = readThemeCss().replace(/\/\*[\s\S]*?\*\//g, '');
    const selectors = [...css.matchAll(/([^{}]+)\{/g)].map((m) => m[1].trim());
    expect(selectors.length).toBeGreaterThan(0);
    for (const selector of selectors) {
      expect(selector).toBe(':root');
    }
  });

  it('every declaration inside :root is a custom property (starts with --)', () => {
    const body = extractRootBody(readThemeCss()).replace(/\/\*[\s\S]*?\*\//g, '');
    const propNames = [...body.matchAll(/(?:^|;)\s*([a-zA-Z-]+)\s*:/g)].map((m) => m[1]);
    expect(propNames.length).toBeGreaterThan(0);
    for (const prop of propNames) {
      expect(prop.startsWith('--')).toBe(true);
    }
  });

  it('has no numeric-indexed scale name outside the raw 25-900 color scale steps (Requirement: Foundation Emitted as Static CSS)', () => {
    const tsVars = toFoundationCssVariables();
    const rawColorScaleNames = new Set(
      Object.entries(PA_FOUNDATION_PALETTE).flatMap(([family, scale]) =>
        Object.keys(scale).map((step) => `--${family}-${step}`),
      ),
    );

    for (const name of Object.keys(tsVars)) {
      if (rawColorScaleNames.has(name)) {
        continue;
      }
      expect(name).not.toMatch(/-\d+$/);
    }
  });
});

describe('Provisional dimension markers (D5)', () => {
  const provisionalKeys = [
    '--pa-button-min-height-sm',
    '--pa-button-min-height-lg',
    '--pa-button-padding-sm',
    '--pa-button-padding-lg',
    '--pa-button-gap-sm',
    '--pa-button-gap-lg',
  ];

  const confirmedKeys = [
    '--pa-button-min-width-sm',
    '--pa-button-min-width-md',
    '--pa-button-min-width-lg',
    '--pa-button-min-height-md',
    '--pa-button-padding-md',
    '--pa-button-gap-md',
    '--pa-button-radius',
  ];

  function findDeclarationLine(css: string, key: string): string {
    const lineRegex = new RegExp(`${key}\\s*:[^;]+;[^\\n]*`);
    const match = css.match(lineRegex);
    if (!match) {
      throw new Error(`theme.css: no declaration found for ${key}`);
    }
    return match[0];
  }

  it('every sm/lg button dimension sourced from PA_BUTTON_PROVISIONAL_DIMENSIONS carries a provisional comment', () => {
    const css = readThemeCss();
    for (const key of provisionalKeys) {
      expect(findDeclarationLine(css, key)).toContain('provisional');
    }
  });

  it('Figma-confirmed dimensions (md, and sm/lg min-width) are NOT marked provisional', () => {
    const css = readThemeCss();
    for (const key of confirmedKeys) {
      expect(findDeclarationLine(css, key)).not.toContain('provisional');
    }
  });
});
