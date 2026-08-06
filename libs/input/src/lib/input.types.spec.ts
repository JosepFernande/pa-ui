import { PaInputSize } from './input.types';

describe('input types', () => {
  it('should define PaInputSize as union type', () => {
    const size: PaInputSize = 'md';
    expect(size).toBe('md');
  });
});
