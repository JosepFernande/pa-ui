import { readFileSync } from 'fs';
import { join } from 'path';
import { toComponentCssVariables } from './component-overrides';
import { HA_DEFAULT_THEME } from './default-theme';

describe('toComponentCssVariables', () => {
  it('returns the full default Component var map for undefined input (nothing overridden)', () => {
    const result = toComponentCssVariables(undefined);
    expect(result['--ha-button-bg']).toBe(HA_DEFAULT_THEME.components.button.surface.bg);
    expect(result['--ha-input-bg']).toBe(HA_DEFAULT_THEME.components.inputText.surface.bg);
    expect(result['--ha-select-option-selected-bg']).toBe(
      HA_DEFAULT_THEME.components.select.option.optionSelectedBg,
    );
    expect(Object.keys(result).length).toBeGreaterThan(100);
  });

  it('returns the same full default map for an empty input object', () => {
    expect(toComponentCssVariables({})).toEqual(toComponentCssVariables(undefined));
  });

  it('overrides a single Button leaf while every other Button token keeps its default (HA_BUTTON_TOKENS.surface.bg)', () => {
    const result = toComponentCssVariables({
      button: { surface: { bg: 'var(--ha-accent)' } },
    });
    expect(result['--ha-button-bg']).toBe('var(--ha-accent)');
    expect(result['--ha-button-color']).toBe(HA_DEFAULT_THEME.components.button.surface.color);
  });

  it('overrides a single InputText leaf while every other InputText token keeps its default (HA_INPUT_TEXT_TOKENS.focus.focusBorder)', () => {
    const result = toComponentCssVariables({
      inputText: { focus: { focusBorder: '#00897b' } },
    });
    expect(result['--ha-input-focus-border']).toBe('#00897b');
    expect(result['--ha-input-bg']).toBe(HA_DEFAULT_THEME.components.inputText.surface.bg);
  });

  it('overrides a single Select leaf while every other Select token keeps its default (HA_SELECT_TOKENS.option.optionSelectedBg)', () => {
    const result = toComponentCssVariables({
      select: { option: { optionSelectedBg: 'var(--ha-accent)' } },
    });
    expect(result['--ha-select-option-selected-bg']).toBe('var(--ha-accent)');
    expect(result['--ha-select-bg']).toBe(HA_DEFAULT_THEME.components.select.trigger.bg);
  });

  it('combines overrides across button/inputText/select in one call, leaving everything else default', () => {
    const result = toComponentCssVariables({
      button: { surface: { bg: 'red' } },
      inputText: { surface: { color: 'blue' } },
      select: { trigger: { border: '1px solid green' } },
    });
    expect(result['--ha-button-bg']).toBe('red');
    expect(result['--ha-input-color']).toBe('blue');
    expect(result['--ha-select-border']).toBe('1px solid green');
    expect(result['--ha-button-color']).toBe(HA_DEFAULT_THEME.components.button.surface.color);
  });

  it('combines multiple leaves within the same component group', () => {
    const result = toComponentCssVariables({
      button: {
        surface: { bg: 'red', color: 'white' },
        focus: { focusRing: '2px solid black' },
      },
    });
    expect(result['--ha-button-bg']).toBe('red');
    expect(result['--ha-button-color']).toBe('white');
    expect(result['--ha-button-focus-ring']).toBe('2px solid black');
  });

  it('is defensive: an unknown top-level group key is silently ignored, never thrown, defaults untouched', () => {
    const input = { unknownComponent: { x: 'y' } } as unknown as Parameters<
      typeof toComponentCssVariables
    >[0];
    expect(() => toComponentCssVariables(input)).not.toThrow();
    expect(toComponentCssVariables(input)).toEqual(toComponentCssVariables(undefined));
  });

  it('is defensive: an unknown leaf key inside a known group is silently skipped, never thrown', () => {
    const input = { button: { surface: { notARealKey: 'x' } } } as unknown as Parameters<
      typeof toComponentCssVariables
    >[0];
    expect(() => toComponentCssVariables(input)).not.toThrow();
    expect(toComponentCssVariables(input)).toEqual(toComponentCssVariables(undefined));
  });

  it('never imports color-derivation.ts (component values are opaque CSS values, never routed through the semantic color-math pipeline)', () => {
    const source = readFileSync(join(__dirname, 'component-overrides.ts'), 'utf-8');
    expect(source).not.toMatch(/from ['"].*color-derivation/);
  });

  it('never imports from @halolib-ui/button, @halolib-ui/input-text, or @halolib-ui/select (would be a type:ui -> type:core -> type:ui cycle)', () => {
    const source = readFileSync(join(__dirname, 'component-overrides.ts'), 'utf-8');
    expect(source).not.toMatch(/from ['"]@halolib-ui\/(button|input-text|select)['"]/);
  });

  it('has zero @angular/* import statements', () => {
    const source = readFileSync(join(__dirname, 'component-overrides.ts'), 'utf-8');
    const angularImportLines = source
      .split('\n')
      .filter((line) => /^\s*import\b/.test(line) && line.includes('@angular/'));
    expect(angularImportLines).toEqual([]);
  });
});
