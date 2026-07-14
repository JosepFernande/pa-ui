import { PA_INPUT_TOKENS } from './input.tokens';

describe('input tokens', () => {
  it('should define PA_INPUT_TOKENS as const object', () => {
    expect(PA_INPUT_TOKENS).toBeDefined();
    expect(typeof PA_INPUT_TOKENS).toBe('object');
  });

  it('should have all token keys prefixed with --pa-input-', () => {
    Object.values(PA_INPUT_TOKENS).forEach((token) => {
      expect(token).toMatch(/^--pa-input-/);
    });
  });

  it('should have expected token count', () => {
    expect(Object.keys(PA_INPUT_TOKENS).length).toBe(34);
  });
});
