import { HaButtonVariant, HaButtonSize } from './button.types';

describe('Button Types', () => {
  it('should export HaButtonVariant as a union type', () => {
    const solid: HaButtonVariant = 'solid';
    const outline: HaButtonVariant = 'outline';
    const ghost: HaButtonVariant = 'ghost';

    expect(solid).toBe('solid');
    expect(outline).toBe('outline');
    expect(ghost).toBe('ghost');
  });

  it('should export HaButtonSize as a union type', () => {
    const sm: HaButtonSize = 'sm';
    const md: HaButtonSize = 'md';
    const lg: HaButtonSize = 'lg';

    expect(sm).toBe('sm');
    expect(md).toBe('md');
    expect(lg).toBe('lg');
  });
});
