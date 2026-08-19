import assert from 'node:assert';
import { getEncapsulationStatus } from './encapsulation-detect.ts';

// Regression case that broke the regex: nested `})` inside `host` object literal
const nestedHost = `@Component({
  host: { '[class]': 'hostClasses()' },
  encapsulation: ViewEncapsulation.None,
})
export class X {}`;

const cases: { source: string; expected: 'None' | 'missing' | 'wrong' }[] = [
  {
    source: `@Component({ selector: 'x', encapsulation: ViewEncapsulation.None }) export class X {}`,
    expected: 'None',
  },
  {
    source: nestedHost,
    expected: 'None',
  },
  {
    source: `@Component({ selector: 'x' }) export class X {}`,
    expected: 'missing',
  },
  {
    source: `@Component({ encapsulation: ViewEncapsulation.Emulated }) export class X {}`,
    expected: 'wrong',
  },
];

for (const { source, expected } of cases) {
  const actual = getEncapsulationStatus(source);
  assert.strictEqual(
    actual,
    expected,
    `Expected ${expected} for source:\n${source}\nGot ${actual}`,
  );
}

console.log('✅ all encapsulation-detect cases passed');
