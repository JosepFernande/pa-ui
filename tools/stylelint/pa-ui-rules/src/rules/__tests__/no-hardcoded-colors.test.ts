import postcss from 'postcss';
import type { Result } from 'postcss';

// eslint-disable-next-line import/no-relative-packages -- local plugin rule under test
import { ruleFunction } from '../no-hardcoded-colors';

async function run(css: string): Promise<Result> {
  const processor = postcss([(root, result) => ruleFunction(root, result)]);
  return processor.process(css, { from: undefined });
}

describe('no-hardcoded-colors', () => {
  // ================================================================
  // VALID cases (no warnings)
  // ================================================================

  it('should allow var(--*) token references', async () => {
    const result = await run('.pa-button { color: var(--pa-text); }');
    expect(result.messages).toHaveLength(0);
  });

  it('should allow var(--*) with fallback', async () => {
    const result = await run('.pa-button { color: var(--pa-text, #333); }');
    expect(result.messages).toHaveLength(0);
  });

  it('should allow transparent keyword', async () => {
    const result = await run('.pa-button { background: transparent; }');
    expect(result.messages).toHaveLength(0);
  });

  it('should allow currentColor keyword', async () => {
    const result = await run('.pa-icon { color: currentColor; }');
    expect(result.messages).toHaveLength(0);
  });

  it('should allow inherit keyword', async () => {
    const result = await run('.pa-button { color: inherit; }');
    expect(result.messages).toHaveLength(0);
  });

  it('should allow initial keyword', async () => {
    const result = await run('.pa-button { color: initial; }');
    expect(result.messages).toHaveLength(0);
  });

  it('should allow unset keyword', async () => {
    const result = await run('.pa-button { color: unset; }');
    expect(result.messages).toHaveLength(0);
  });

  it('should allow non-color properties with hardcoded values', async () => {
    const result = await run('.pa-button { display: flex; opacity: 0.5; z-index: 10; }');
    expect(result.messages).toHaveLength(0);
  });

  it('should allow border shorthand with var() for color', async () => {
    const result = await run('.pa-button { border: var(--pa-button-border); }');
    expect(result.messages).toHaveLength(0);
  });

  // ================================================================
  // INVALID cases (warnings)
  // ================================================================

  it('should reject hex colors (3-digit)', async () => {
    const result = await run('.pa-button { color: #333; }');
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].text).toContain('no-hardcoded-colors');
    expect(result.messages[0].text).toContain('#333');
  });

  it('should reject hex colors (6-digit)', async () => {
    const result = await run('.pa-button { color: #ffffff; }');
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].text).toContain('#ffffff');
  });

  it('should reject hex colors with alpha (8-digit)', async () => {
    const result = await run('.pa-button { border-color: #ffffff80; }');
    expect(result.messages).toHaveLength(1);
  });

  it('should reject hex colors (4-digit)', async () => {
    const result = await run('.pa-button { border-color: #fff8; }');
    expect(result.messages).toHaveLength(1);
  });

  it('should reject rgb() colors', async () => {
    const result = await run('.pa-button { background: rgb(0, 0, 0); }');
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].text).toContain('rgb(');
  });

  it('should reject rgba() colors', async () => {
    const result = await run('.pa-button { background: rgba(0, 0, 0, 0.5); }');
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].text).toContain('rgba(');
  });

  it('should reject hsl() colors', async () => {
    const result = await run('.pa-button { background: hsl(0, 0%, 100%); }');
    expect(result.messages).toHaveLength(1);
  });

  it('should reject hsla() colors', async () => {
    const result = await run('.pa-button { background: hsla(0, 0%, 100%, 0.8); }');
    expect(result.messages).toHaveLength(1);
  });

  it('should reject named color red', async () => {
    const result = await run('.pa-error { color: red; }');
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].text).toContain('red');
  });

  it('should reject named color white', async () => {
    const result = await run('.pa-box { background: white; }');
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].text).toContain('white');
  });

  it('should reject named color blue', async () => {
    const result = await run('.pa-box { border-color: blue; }');
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].text).toContain('blue');
  });

  it('should reject hardcoded color in background shorthand', async () => {
    const result = await run('.pa-hero { background: #333 url(bg.png) no-repeat; }');
    expect(result.messages).toHaveLength(1);
  });

  it('should not false-positive on px/em values (not colors)', async () => {
    const result = await run('.pa-button { padding: 8px; font-size: 1rem; }');
    expect(result.messages).toHaveLength(0);
  });

  // ================================================================
  // TRIANGULATE — edge cases
  // ================================================================

  it('should reject uppercase hex', async () => {
    const result = await run('.pa-button { color: #FFF; }');
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].text).toContain('#FFF');
  });

  it('should reject color inside shorthand border', async () => {
    const result = await run('.pa-button { border: 1px solid red; }');
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].text).toContain('red');
  });

  it('should reject color in box-shadow with rgba', async () => {
    const result = await run('.pa-card { box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }');
    expect(result.messages).toHaveLength(1);
  });

  it('should reject color in background gradient', async () => {
    const result = await run('.pa-hero { background: linear-gradient(to right, red, blue); }');
    // red and blue are hardcoded, but we report only once per declaration
    expect(result.messages).toHaveLength(1);
  });

  it('should not flag border: none', async () => {
    const result = await run('.pa-button { border: none; }');
    expect(result.messages).toHaveLength(0);
  });

  it('should not flag non-color keyword values', async () => {
    const result = await run('.pa-button { background: none; border-style: solid; }');
    expect(result.messages).toHaveLength(0);
  });

  it('should reject named color black', async () => {
    const result = await run('.pa-button { color: black; }');
    expect(result.messages).toHaveLength(1);
  });

  it('should reject named color gray inside multiple values', async () => {
    const result = await run('.pa-divider { border: 2px solid gray; }');
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].text).toContain('gray');
  });

  it('should allow outline property with var() token', async () => {
    const result = await run('.pa-button { outline: var(--pa-focus-ring); }');
    expect(result.messages).toHaveLength(0);
  });

  it('should reject hsl with spaces inside function', async () => {
    const result = await run('.pa-button { background: hsl(210, 50%, 50%); }');
    expect(result.messages).toHaveLength(1);
  });
});
