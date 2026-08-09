import postcss from 'postcss';
import type { Result } from 'postcss';

// eslint-disable-next-line import/no-relative-packages -- local plugin rule under test
import { ruleFunction } from '../no-hardcoded-spacing-radius';

async function run(css: string): Promise<Result> {
  const processor = postcss([(root, result) => ruleFunction(root, result)]);
  return processor.process(css, { from: undefined });
}

describe('no-hardcoded-spacing-radius', () => {
  // ================================================================
  // VALID cases (no warnings)
  // ================================================================

  it('should allow var(--*) for margin', async () => {
    const result = await run('.pa-button { margin: var(--pa-margin); }');
    expect(result.messages).toHaveLength(0);
  });

  it('should allow var(--*) for padding', async () => {
    const result = await run('.pa-button { padding: var(--pa-button-padding-sm); }');
    expect(result.messages).toHaveLength(0);
  });

  it('should allow var(--*) for gap', async () => {
    const result = await run('.pa-button { gap: var(--pa-button-gap); }');
    expect(result.messages).toHaveLength(0);
  });

  it('should allow var(--*) for border-radius', async () => {
    const result = await run('.pa-button { border-radius: var(--pa-button-radius); }');
    expect(result.messages).toHaveLength(0);
  });

  it('should allow zero values (unit-independent)', async () => {
    const result = await run('.pa-button { margin: 0; padding: 0; }');
    expect(result.messages).toHaveLength(0);
  });

  it('should allow zero in multi-value shorthands', async () => {
    const result = await run('.pa-button { margin: 0 0 4px 0; }');
    expect(result.messages).toHaveLength(1); // 4px is flagged
  });

  it('should allow non-spacing properties with px', async () => {
    const result = await run('.pa-button { opacity: 0.5; z-index: 10; }');
    expect(result.messages).toHaveLength(0);
  });

  it('should allow var(--*) for width', async () => {
    const result = await run('.pa-button { width: var(--pa-button-width); }');
    expect(result.messages).toHaveLength(0);
  });

  it('should allow var(--*) for height', async () => {
    const result = await run('.pa-button { min-height: var(--pa-button-min-height); }');
    expect(result.messages).toHaveLength(0);
  });

  it('should allow zero with px unit', async () => {
    const result = await run('.pa-button { margin: 0px; }');
    expect(result.messages).toHaveLength(0);
  });

  it('should allow zero with em unit', async () => {
    const result = await run('.pa-button { gap: 0em; }');
    expect(result.messages).toHaveLength(0);
  });

  it('should allow zero with rem unit', async () => {
    const result = await run('.pa-button { padding: 0rem; }');
    expect(result.messages).toHaveLength(0);
  });

  it('should allow negative zero with unit', async () => {
    const result = await run('.pa-button { border-radius: -0px; }');
    expect(result.messages).toHaveLength(0);
  });

  it('should allow decimal zero with unit', async () => {
    const result = await run('.pa-button { margin: 0.0px; }');
    expect(result.messages).toHaveLength(0);
  });

  it('should flag non-zero part in mixed zero-with-unit shorthand', async () => {
    const result = await run('.pa-button { margin: 0px 8px; }');
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].text).toContain('8px');
  });

  // ================================================================
  // INVALID cases (warnings)
  // ================================================================

  it('should reject px in padding', async () => {
    const result = await run('.pa-button { padding: 8px; }');
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].text).toContain('no-hardcoded-spacing-radius');
    expect(result.messages[0].text).toContain('8px');
  });

  it('should reject px in margin', async () => {
    const result = await run('.pa-button { margin: 16px; }');
    expect(result.messages).toHaveLength(1);
  });

  it('should reject rem in gap', async () => {
    const result = await run('.pa-flex { gap: 1rem; }');
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].text).toContain('1rem');
  });

  it('should reject em in padding', async () => {
    const result = await run('.pa-button { padding: 0.5em; }');
    expect(result.messages).toHaveLength(1);
  });

  it('should reject px in border-radius', async () => {
    const result = await run('.pa-button { border-radius: 4px; }');
    expect(result.messages).toHaveLength(1);
  });

  it('should reject px in width', async () => {
    const result = await run('.pa-button { width: 200px; }');
    expect(result.messages).toHaveLength(1);
  });

  it('should reject px in min-height', async () => {
    const result = await run('.pa-button { min-height: 40px; }');
    expect(result.messages).toHaveLength(1);
  });

  it('should reject px in margin with multi-value shorthand', async () => {
    const result = await run('.pa-button { margin: 4px 8px; }');
    expect(result.messages).toHaveLength(1);
  });

  it('should reject rem in border-radius with two values', async () => {
    const result = await run('.pa-card { border-radius: 0.25rem 0.5rem; }');
    expect(result.messages).toHaveLength(1);
  });

  it('should reject negative px in margin', async () => {
    const result = await run('.pa-button { margin: -4px; }');
    expect(result.messages).toHaveLength(1);
  });

  it('should not flag font-size with rem (font rules are separate)', async () => {
    const result = await run('.pa-button { font-size: 1rem; line-height: 1.5; }');
    expect(result.messages).toHaveLength(0);
  });

  it('should not flag non-spacing properties with units', async () => {
    const result = await run('.pa-button { border-width: 2px; outline-width: 2px; }');
    expect(result.messages).toHaveLength(0);
  });
});
