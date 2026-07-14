import { RuleTester } from '@typescript-eslint/rule-tester';
// eslint-disable-next-line import/no-relative-packages -- local plugin rule under test
import { rule } from '../max-component-lines';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
});

function generateLines(count: number): string {
  // 7 header lines + 1 closing line = 8 fixed lines
  // Need count - 8 filler lines to reach total of count
  const fillerCount = count - 8;
  const lines: string[] = [];
  lines.push("import { Component } from '@angular/core';");
  lines.push('');
  lines.push('@Component({');
  lines.push("  selector: 'pa-test',");
  lines.push("  template: '<div>hello</div>',");
  lines.push('})');
  lines.push('export class TestComponent {');
  for (let i = 0; i < fillerCount; i++) {
    lines.push(`  // Filler line ${i + 1}`);
  }
  lines.push('}');
  return lines.join('\n');
}

const code400Lines = generateLines(400);
const code401Lines = generateLines(401);
const code500Lines = generateLines(500);

ruleTester.run('max-component-lines', rule, {
  valid: [
    {
      name: 'component file at exactly 400 lines',
      code: code400Lines,
      filename: 'test.component.ts',
    },
    {
      name: 'non-component TS file with 500 lines',
      code: code500Lines,
      filename: 'utils.ts',
    },
    {
      name: 'short component file',
      code: `
import { Component } from '@angular/core';

@Component({
  selector: 'pa-test',
  template: '<div>hello</div>',
})
export class TestComponent {}
      `,
      filename: 'test.component.ts',
    },
  ],
  invalid: [
    {
      name: 'component file with 401 lines',
      code: code401Lines,
      filename: 'test.component.ts',
      errors: [
        {
          messageId: 'componentFileTooLong',
        },
      ],
    },
    {
      name: 'component file with 500 lines',
      code: code500Lines,
      filename: 'test.component.ts',
      errors: [
        {
          messageId: 'componentFileTooLong',
        },
      ],
    },
    {
      name: 'component file with exactly 401 lines — just over threshold',
      code: generateLines(401),
      filename: 'my-component.component.ts',
      errors: [
        {
          messageId: 'componentFileTooLong',
        },
      ],
    },
  ],
});
