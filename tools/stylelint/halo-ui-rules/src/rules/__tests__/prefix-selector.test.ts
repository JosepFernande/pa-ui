import postcss from 'postcss';
import type { Result } from 'postcss';

// The PostCSS rule function is exported directly for testing
import { ruleFunction } from '../prefix-selector';

/**
 * Test harness: wraps the rule function as a PostCSS plugin and processes CSS.
 */
async function run(css: string, secondary?: { prefixes?: string[] }): Promise<Result> {
  const processor = postcss([(root, result) => ruleFunction(root, result, secondary)]);
  return processor.process(css, { from: undefined });
}

describe('prefix-selector', () => {
  // ================================================================
  // Default option (['ha-']) — VALID cases
  // ================================================================

  it('should accept selectors starting with .ha- by default', async () => {
    const result = await run('.ha-button { display: flex; }');
    expect(result.messages).toHaveLength(0);
  });

  it('should accept selectors starting with .ha- with pseudo-classes', async () => {
    const result = await run('.ha-button:hover { background: blue; }');
    expect(result.messages).toHaveLength(0);
  });

  it('should accept selectors starting with .ha- with compound pseudo-classes', async () => {
    const result = await run('.ha-button:not(.ha-button--disabled):hover { opacity: 0.5; }');
    expect(result.messages).toHaveLength(0);
  });

  it('should accept element selectors starting with ha- by default', async () => {
    const result = await run('ha-accordion { display: block; }');
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

  it('should accept BEM modifier selectors starting with .ha- by default', async () => {
    const result = await run('.ha-button--solid { background: blue; }');
    expect(result.messages).toHaveLength(0);
  });

  it('should accept BEM element selectors starting with .ha- by default', async () => {
    const result = await run('.ha-button__spinner { animation: spin 1s infinite; }');
    expect(result.messages).toHaveLength(0);
  });

  it('should accept @keyframes without selectors (no false positives)', async () => {
    const result = await run('@keyframes ha-button-spin { to { transform: rotate(360deg); } }');
    expect(result.messages).toHaveLength(0);
  });

  it('should accept @media queries without prefix requirement', async () => {
    const result = await run('@media (max-width: 600px) { .ha-button { width: 100%; } }');
    expect(result.messages).toHaveLength(0);
  });

  it('should accept selectors with attribute brackets on .ha- elements', async () => {
    const result = await run('.ha-button[disabled] { opacity: 0.5; }');
    expect(result.messages).toHaveLength(0);
  });

  it('should accept selectors with combinators on .ha- elements', async () => {
    const result = await run('.ha-form > .ha-input { margin: 0; }');
    expect(result.messages).toHaveLength(0);
  });

  // ================================================================
  // Default option (['ha-']) — INVALID cases
  // ================================================================

  it('should reject selectors NOT starting with .ha-', async () => {
    const result = await run('.my-button { display: block; }');
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].text).toContain('prefix-selector');
    expect(result.messages[0].text).toContain('.my-button');
  });

  it('should reject selectors with generic names', async () => {
    const result = await run('.container { width: 100%; }');
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].text).toContain('.container');
  });

  it('should reject one invalid selector in a comma-separated list', async () => {
    const result = await run('.ha-button, .bad-selector { padding: 0; }');
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].text).toContain('.bad-selector');
  });

  it('should reject element selectors without ha- prefix', async () => {
    const result = await run('div { margin: 0; }');
    expect(result.messages).toHaveLength(1);
  });

  it('should reject nested selectors without ha- prefix', async () => {
    const result = await run('.ha-button .inner { color: red; }');
    expect(result.messages.length).toBeGreaterThan(0);
  });

  it('should reject id selectors', async () => {
    const result = await run('#my-id { position: absolute; }');
    expect(result.messages).toHaveLength(1);
  });

  // ================================================================
  // Multi-prefix option { prefixes: ['ha-', 'legacy-'] }
  // ================================================================

  it('should accept both .ha- and a configured second prefix', async () => {
    const haResult = await run('.ha-button { display: flex; }', { prefixes: ['ha-', 'legacy-'] });
    expect(haResult.messages).toHaveLength(0);

    const secondResult = await run('.legacy-button { display: flex; }', {
      prefixes: ['ha-', 'legacy-'],
    });
    expect(secondResult.messages).toHaveLength(0);
  });

  it('should accept both ha- and a configured second prefix for element selectors', async () => {
    const haResult = await run('ha-accordion { display: block; }', {
      prefixes: ['ha-', 'legacy-'],
    });
    expect(haResult.messages).toHaveLength(0);

    const secondResult = await run('legacy-accordion { display: block; }', {
      prefixes: ['ha-', 'legacy-'],
    });
    expect(secondResult.messages).toHaveLength(0);
  });

  it('should still reject unrelated prefixes when multiple prefixes are configured', async () => {
    const result = await run('.foo-x { display: block; }', { prefixes: ['ha-', 'legacy-'] });
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].text).toContain('.foo-x');
  });
});
