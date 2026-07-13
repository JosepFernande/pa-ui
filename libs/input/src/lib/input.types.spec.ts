import { PaInputSize, PaInputType } from './input.types';

describe('input types', () => {
  it('should define PaInputSize as union type', () => {
    const size: PaInputSize = 'md';
    expect(size).toBe('md');
  });

  it('should define PaInputType as union type', () => {
    const type: PaInputType = 'text';
    expect(type).toBe('text');
  });
});
