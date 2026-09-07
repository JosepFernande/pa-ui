/**
 * Unit tests for the pure CSS/TS-parsing helpers backing the halo-ui audit
 * script (issue #139, S4 task 4.5). Imported from `./parse` (not `./index`)
 * — `index.ts` is a CLI script using real ESM `import.meta.url`, which
 * collides with ts-jest's CommonJS transform if imported directly.
 */
import { SELECTOR_PREFIX, parseSelectors, parseTokens, getComponentSelector } from './parse';

describe('SELECTOR_PREFIX', () => {
  it('is the halo-ui brand prefix (#139)', () => {
    expect(SELECTOR_PREFIX).toBe('ha-');
  });
});

describe('parseSelectors', () => {
  it('matches class selectors under the ha- prefix', () => {
    const css = '.ha-button { display: flex; } .ha-button__icon { width: 16px; }';
    expect(parseSelectors(css)).toEqual(['.ha-button', '.ha-button__icon']);
  });

  it('matches element selectors under the ha- prefix', () => {
    const css = 'ha-accordion { display: block; }\nha-select { display: inline-block; }';
    expect(parseSelectors(css)).toEqual(['ha-accordion', 'ha-select']);
  });

  it('returns an empty, sorted array for CSS with no ha- selectors', () => {
    expect(parseSelectors('.generic { color: red; }')).toEqual([]);
  });
});

describe('parseTokens', () => {
  it('matches design tokens under var(--ha-*)', () => {
    const css = '.ha-button { background: var(--ha-primary); color: var(--ha-primary-contrast); }';
    expect(parseTokens(css)).toEqual(['--ha-primary', '--ha-primary-contrast']);
  });

  it('returns an empty array for CSS with no --ha- custom properties', () => {
    expect(parseTokens('.ha-button { color: red; }')).toEqual([]);
  });
});

describe('getComponentSelector', () => {
  it('extracts the selector string from a @Component decorator', () => {
    const ts = `@Component({ selector: 'ha-button', standalone: true })\nexport class HaButton {}`;
    expect(getComponentSelector(ts)).toBe('ha-button');
  });

  it('returns null when no selector is present', () => {
    expect(getComponentSelector('export class NotAComponent {}')).toBeNull();
  });
});
