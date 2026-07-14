import postcss from 'postcss';
import type { Result } from 'postcss';

// eslint-disable-next-line import/no-relative-packages -- local plugin rule under test
import { ruleFunction } from '../no-ng-deep-host-context';

async function run(css: string): Promise<Result> {
  const processor = postcss([(root, result) => ruleFunction(root, result)]);
  return processor.process(css, { from: undefined });
}

describe('no-ng-deep-host-context', () => {
  // ================================================================
  // VALID cases (no warnings)
  // ================================================================

  it('should allow normal selectors without ng-deep or host-context', async () => {
    const result = await run('.pa-button { color: red; }');
    expect(result.messages).toHaveLength(0);
  });

  it('should allow :host selector', async () => {
    const result = await run(':host { display: block; }');
    expect(result.messages).toHaveLength(0);
  });

  it('should allow :host-context with token override (contains --)', async () => {
    const result = await run(':host-context([data-theme="dark"]) { --pa-btn-bg: var(--blue-900); }');
    expect(result.messages).toHaveLength(0);
  });

  it('should allow :host-context with only -- custom properties', async () => {
    const result = await run(':host-context(.dark) { --bg: black; --text: white; }');
    expect(result.messages).toHaveLength(0);
  });

  it('should allow CSS without Angular-specific selectors', async () => {
    const result = await run('.pa-button:hover { background: blue; }');
    expect(result.messages).toHaveLength(0);
  });

  it('should allow @keyframes (no selectors)', async () => {
    const result = await run('@keyframes spin { to { transform: rotate(360deg); } }');
    expect(result.messages).toHaveLength(0);
  });

  // ================================================================
  // INVALID cases (warnings)
  // ================================================================

  it('should reject ::ng-deep usage', async () => {
    const result = await run('::ng-deep .child { color: red; }');
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].text).toContain('ng-deep');
    expect(result.messages[0].text).toContain('no-ng-deep-host-context');
  });

  it('should reject ::ng-deep in compound selector', async () => {
    const result = await run('.pa-parent ::ng-deep .child { padding: 8px; }');
    expect(result.messages).toHaveLength(1);
  });

  it('should reject :host-context with non-token rules (no -- in value)', async () => {
    const result = await run(':host-context(.dark) .pa-btn { color: red; }');
    expect(result.messages).toHaveLength(1);
  });

  it('should reject :host-context with mix of token and non-token', async () => {
    const result = await run(':host-context(.dark) { --bg: black; color: red; }');
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].text).toContain('host-context');
  });
});
