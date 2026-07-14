import { RuleTester } from '@typescript-eslint/rule-tester';
// eslint-disable-next-line import/no-relative-packages -- local plugin rule under test
import { rule } from '../require-view-encapsulation-none';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
});

ruleTester.run('require-view-encapsulation-none', rule, {
  valid: [
    {
      name: 'has ViewEncapsulation.None',
      code: `
import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'pa-test',
  encapsulation: ViewEncapsulation.None,
  template: '<div></div>',
})
export class TestComponent {}
      `,
    },
    {
      name: 'has ViewEncapsulation.None with other properties',
      code: `
import { Component, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'pa-button',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './button.component.html',
})
export class PaButton {}
      `,
    },
    {
      name: 'no @Component decorator in file',
      code: `
export function pureHelper(x: number): number {
  return x * 2;
}

export class PlainClass {
  doSomething(): void {}
}
      `,
    },
  ],
  invalid: [
    {
      name: 'missing encapsulation property entirely',
      code: `
import { Component } from '@angular/core';

@Component({
  selector: 'pa-broken',
  template: '<div></div>',
})
export class BrokenComponent {}
      `,
      errors: [
        {
          messageId: 'missingViewEncapsulationNone',
        },
      ],
    },
    {
      name: 'has ViewEncapsulation.Emulated',
      code: `
import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'pa-broken',
  encapsulation: ViewEncapsulation.Emulated,
  template: '<div></div>',
})
export class BrokenComponent {}
      `,
      errors: [
        {
          messageId: 'wrongViewEncapsulation',
        },
      ],
    },
    {
      name: 'has ViewEncapsulation.ShadowDom',
      code: `
import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'pa-broken',
  encapsulation: ViewEncapsulation.ShadowDom,
  template: '<div></div>',
})
export class BrokenComponent {}
      `,
      errors: [
        {
          messageId: 'wrongViewEncapsulation',
        },
      ],
    },
  ],
});
