import {
  PA_SELECT_POSITIONS,
  PA_SELECT_TYPEAHEAD_DEBOUNCE,
  PA_SELECT_VIEWPORT_MARGIN,
} from './select.constants';

describe('select constants', () => {
  it('debounces typeahead input by 200ms', () => {
    expect(PA_SELECT_TYPEAHEAD_DEBOUNCE).toBe(200);
  });

  it('keeps an 8px margin between the panel and the viewport edge', () => {
    expect(PA_SELECT_VIEWPORT_MARGIN).toBe(8);
  });

  it('defines exactly two connected positions: below-start then above-start', () => {
    expect(PA_SELECT_POSITIONS).toHaveLength(2);
    expect(PA_SELECT_POSITIONS[0]).toEqual({
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
    });
    expect(PA_SELECT_POSITIONS[1]).toEqual({
      originX: 'start',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'bottom',
    });
  });
});
