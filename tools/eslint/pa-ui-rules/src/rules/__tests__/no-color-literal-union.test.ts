import { RuleTester } from '@typescript-eslint/rule-tester';
// eslint-disable-next-line import/no-relative-packages -- local plugin rule under test
import { rule } from '../no-color-literal-union';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
});

ruleTester.run('no-color-literal-union', rule, {
  valid: [
    {
      name: 'color is typed as string with @Input() decorator',
      code: `
import { Component, Input } from '@angular/core';

@Component({
  selector: 'pa-button',
  template: '<button></button>',
})
export class PaButton {
  @Input() color: string = 'primary';
}
      `,
    },
    {
      name: 'non-color input with union type',
      code: `
import { Component, Input } from '@angular/core';

@Component({
  selector: 'pa-button',
  template: '<button></button>',
})
export class PaButton {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() variant: 'solid' | 'outline' | 'ghost' = 'solid';
}
      `,
    },
    {
      name: 'no @Input decorators in file',
      code: `
export function pureHelper(x: number): number {
  return x * 2;
}

export class PlainClass {
  value: string = 'hello';
}
      `,
    },
  ],
  invalid: [
    {
      name: 'color input with union of string literals',
      code: `
import { Component, Input } from '@angular/core';

@Component({
  selector: 'pa-button',
  template: '<button></button>',
})
export class PaButton {
  @Input() color: 'primary' | 'secondary' = 'primary';
}
      `,
      errors: [
        {
          messageId: 'colorNotString',
        },
      ],
    },
    {
      name: 'color input with single string literal type',
      code: `
import { Component, Input } from '@angular/core';

@Component({
  selector: 'pa-button',
  template: '<button></button>',
})
export class PaButton {
  @Input() color: 'primary' = 'primary';
}
      `,
      errors: [
        {
          messageId: 'colorNotString',
        },
      ],
    },
    {
      name: 'signal-based color input with union type',
      code: `
import { Component, input } from '@angular/core';

@Component({
  selector: 'pa-button',
  template: '<button></button>',
})
export class PaButton {
  readonly color = input<'primary' | 'secondary'>('primary');
}
      `,
      errors: [
        {
          messageId: 'colorNotString',
        },
      ],
    },
  ],
});
