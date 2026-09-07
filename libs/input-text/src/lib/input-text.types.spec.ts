import { HaInputTextSize } from './input-text.types';

describe('input types', () => {
  it('should define HaInputTextSize as union type', () => {
    const size: HaInputTextSize = 'md';
    expect(size).toBe('md');
  });
});
