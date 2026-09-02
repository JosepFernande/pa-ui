import postcss from 'postcss';
import type { Result } from 'postcss';

import { ruleFunction } from '../no-important-outside-host';

async function run(css: string): Promise<Result> {
  const processor = postcss([(root, result) => ruleFunction(root, result)]);
  return processor.process(css, { from: undefined });
}

describe('no-important-outside-host', () => {
  // ================================================================
  // VALID cases (no warnings)
  // ================================================================

  it('should allow !important inside :host', async () => {
    const result = await run(':host { display: block !important; }');
    expect(result.messages).toHaveLength(0);
  });

  it('should allow !important inside :host(...)', async () => {
    const result = await run(':host(.dark) { color: white !important; }');
    expect(result.messages).toHaveLength(0);
  });

  it('should allow styles without !important', async () => {
    const result = await run('.ha-button { padding: 8px; }');
    expect(result.messages).toHaveLength(0);
  });

  it('should allow styles without !important outside :host', async () => {
    const result = await run('.ha-button { display: flex; color: red; }');
    expect(result.messages).toHaveLength(0);
  });

  it('should allow important inside nested :host via @media', async () => {
    const result = await run('@media (max-width: 600px) { :host { display: block !important; } }');
    expect(result.messages).toHaveLength(0);
  });

  // ================================================================
  // INVALID cases (warnings)
  // ================================================================

  it('should reject !important outside :host', async () => {
    const result = await run('.ha-button { padding: 0 !important; }');
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].text).toContain('!important');
    expect(result.messages[0].text).toContain('no-important-outside-host');
  });

  it('should reject !important in nested selector outside :host', async () => {
    const result = await run(
      '@media (max-width: 600px) { .ha-button { width: 100% !important; } }',
    );
    expect(result.messages).toHaveLength(1);
  });

  it('should reject !important in multiple declarations', async () => {
    const result = await run('.ha-button { padding: 0 !important; margin: 0 !important; }');
    expect(result.messages).toHaveLength(2);
  });

  it('should reject !important with property value before it', async () => {
    const result = await run('.ha-card { width: 300px !important; }');
    expect(result.messages).toHaveLength(1);
  });
});
