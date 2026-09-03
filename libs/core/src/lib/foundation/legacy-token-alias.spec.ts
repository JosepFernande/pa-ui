import { withLegacyAliases } from './legacy-token-alias';

/**
 * `withLegacyAliases` — S1's temporary CSS alias mechanism (spec: Requirement
 * "Temporary CSS Alias"). For every `--ha-*` key it emits the legacy
 * `--pa-*: <value>` declaration AND rewrites `--ha-*: var(--pa-*)`, so both
 * a `:root`-level legacy override and a direct read of `--ha-*` resolve to
 * the same value (design: "Legacy-first chain").
 */
describe('withLegacyAliases', () => {
  it('emits a --pa-* alias carrying the original value for every --ha-* key', () => {
    const result = withLegacyAliases({ '--ha-primary': '#16709e' });
    expect(result['--pa-primary']).toBe('#16709e');
  });

  it('rewrites the --ha-* key to var(--pa-*) pointing at the legacy alias', () => {
    const result = withLegacyAliases({ '--ha-primary': '#16709e' });
    expect(result['--ha-primary']).toBe('var(--pa-primary)');
  });

  it('handles multi-segment --ha-* keys (e.g. --ha-button-bg)', () => {
    const result = withLegacyAliases({ '--ha-button-bg': 'var(--ha-primary)' });
    expect(result['--pa-button-bg']).toBe('var(--ha-primary)');
    expect(result['--ha-button-bg']).toBe('var(--pa-button-bg)');
  });

  it('passes non---ha- keys through unchanged', () => {
    const result = withLegacyAliases({ '--font-size-body': '1rem', '--spacing-md': '16px' });
    expect(result['--font-size-body']).toBe('1rem');
    expect(result['--spacing-md']).toBe('16px');
  });

  it('mixes --ha-* aliasing with passthrough for non-prefixed keys in the same map', () => {
    const result = withLegacyAliases({
      '--ha-primary': '#16709e',
      '--font-family': 'Montserrat, sans-serif',
    });
    expect(result['--pa-primary']).toBe('#16709e');
    expect(result['--ha-primary']).toBe('var(--pa-primary)');
    expect(result['--font-family']).toBe('Montserrat, sans-serif');
  });

  it('is idempotent — applying it twice produces the same output as applying it once', () => {
    const input = { '--ha-primary': '#16709e', '--font-family': 'Montserrat, sans-serif' };
    const once = withLegacyAliases(input);
    const twice = withLegacyAliases(once);
    expect(twice).toEqual(once);
  });

  it('never produces a self-referential var() cycle for any --ha-* key', () => {
    const result = withLegacyAliases({ '--ha-primary': '#16709e' });
    expect(result['--pa-primary']).not.toContain('var(--ha-primary)');
  });
});
