import { HaInputSize } from './input.types';

describe('input types', () => {
  it('should define HaInputSize as union type', () => {
    const size: HaInputSize = 'md';
    expect(size).toBe('md');
  });
});
