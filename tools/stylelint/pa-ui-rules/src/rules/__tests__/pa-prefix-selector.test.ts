import postcss from 'postcss';
import type { Result } from 'postcss';

// The PostCSS rule function is exported directly for testing
// eslint-disable-next-line import/no-relative-packages -- local plugin rule under test
import { ruleFunction } from '../pa-prefix-selector';

/**
 * Test harness: wraps the rule function as a PostCSS plugin and processes CSS.
 */
async function run(css: string): Promise<Result> {
  const processor = postcss([(root, result) => ruleFunction(root, result)]);
  return processor.process(css, { from: undefined });
}

describe('pa-prefix-selector', () => {
  // ================================================================
  // VALID cases (should produce NO warnings)
  // ================================================================

  it('should accept selectors starting with .pa-', async () => {
    const result = await run('.pa-button { display: flex; }');
    expect(result.messages).toHaveLength(0);
  });

  it('should accept selectors starting with .pa- with pseudo-classes', async () => {
    const result = await run('.pa-button:hover { background: blue; }');
    expect(result.messages).toHaveLength(0);
  });

  it('should accept selectors starting with .pa- with compound pseudo-classes', async () => {
    const result = await run('.pa-button:not(.pa-button--disabled):hover { opacity: 0.5; }');
    expect(result.messages).toHaveLength(0);
  });

  it('should accept element selectors starting with pa-', async () => {
    const result = await run('pa-accordion { display: block; }');
    expect(result.messages).toHaveLength(0);
  });

  it('should accept :host selector', async () => {
    const result = await run(':host { display: block; }');
    expect(result.messages).toHaveLength(0);
  });

  it('should accept :host(...) functional selector', async () => {
    const result = await run(':host(.dark) { --bg: black; }');
    expect(result.messages).toHaveLength(0);
  });

  it('should accept BEM modifier selectors starting with .pa-', async () => {
    const result = await run('.pa-button--solid { background: blue; }');
    expect(result.messages).toHaveLength(0);
  });

  it('should accept BEM element selectors starting with .pa-', async () => {
    const result = await run('.pa-button__spinner { animation: spin 1s infinite; }');
    expect(result.messages).toHaveLength(0);
  });

  it('should accept @keyframes without selectors (no false positives)', async () => {
    const result = await run('@keyframes pa-button-spin { to { transform: rotate(360deg); } }');
    expect(result.messages).toHaveLength(0);
  });

  it('should accept @media queries without prefix requirement', async () => {
    const result = await run('@media (max-width: 600px) { .pa-button { width: 100%; } }');
    expect(result.messages).toHaveLength(0);
  });

  it('should accept selectors with attribute brackets on .pa- elements', async () => {
    const result = await run('.pa-button[disabled] { opacity: 0.5; }');
    expect(result.messages).toHaveLength(0);
  });

  it('should accept selectors with combinators on .pa- elements', async () => {
    const result = await run('.pa-form > .pa-input { margin: 0; }');
    expect(result.messages).toHaveLength(0);
  });

  // ================================================================
  // INVALID cases (should produce warnings)
  // ================================================================

  it('should reject selectors NOT starting with .pa-', async () => {
    const result = await run('.my-button { display: block; }');
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].text).toContain('pa-prefix-selector');
    expect(result.messages[0].text).toContain('.my-button');
  });

  it('should reject selectors with generic names', async () => {
    const result = await run('.container { width: 100%; }');
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].text).toContain('.container');
  });

  it('should reject one invalid selector in a comma-separated list', async () => {
    const result = await run('.pa-button, .bad-selector { padding: 0; }');
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].text).toContain('.bad-selector');
  });

  it('should reject element selectors without pa- prefix', async () => {
    const result = await run('div { margin: 0; }');
    expect(result.messages).toHaveLength(1);
  });

  it('should reject nested selectors without pa- prefix', async () => {
    const result = await run('.pa-button .inner { color: red; }');
    // The full selector .pa-button .inner - inner needs prefix too
    // Only one warning for the selector (.inner part is caught)
    expect(result.messages.length).toBeGreaterThan(0);
  });

  it('should reject id selectors', async () => {
    const result = await run('#my-id { position: absolute; }');
    expect(result.messages).toHaveLength(1);
  });
});
