import { PaButtonVariant, PaButtonSize } from './button.types';

describe('Button Types', () => {
  it('should export PaButtonVariant as a union type', () => {
    const solid: PaButtonVariant = 'solid';
    const outline: PaButtonVariant = 'outline';
    const ghost: PaButtonVariant = 'ghost';

    expect(solid).toBe('solid');
    expect(outline).toBe('outline');
    expect(ghost).toBe('ghost');
  });

  it('should export PaButtonSize as a union type', () => {
    const sm: PaButtonSize = 'sm';
    const md: PaButtonSize = 'md';
    const lg: PaButtonSize = 'lg';

    expect(sm).toBe('sm');
    expect(md).toBe('md');
    expect(lg).toBe('lg');
  });
});
