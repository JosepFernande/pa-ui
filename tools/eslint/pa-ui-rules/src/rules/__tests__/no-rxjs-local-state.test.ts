import { RuleTester } from '@typescript-eslint/rule-tester';
import { rule } from '../no-rxjs-local-state';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
});

ruleTester.run('no-rxjs-local-state', rule, {
  valid: [
    {
      name: 'component file using signal/computed',
      code: `
import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'pa-test',
  template: '<div>{{ doubled() }}</div>',
})
export class TestComponent {
  count = signal(0);
  doubled = computed(() => this.count() * 2);
}
      `,
      filename: 'test.component.ts',
    },
    {
      name: 'component file importing rxjs operators (not flagged imports)',
      code: `
import { Component } from '@angular/core';
import { map, filter } from 'rxjs/operators';

@Component({
  selector: 'pa-test',
  template: '<div>hello</div>',
})
export class TestComponent {}
      `,
      filename: 'test.component.ts',
    },
    {
      name: 'non-component TS file importing BehaviorSubject',
      code: `
import { BehaviorSubject } from 'rxjs';

export class SomeService {
  state$ = new BehaviorSubject(0);
}
      `,
      filename: 'some.service.ts',
    },
    {
      name: 'non-component TS file importing Subject',
      code: `
import { Subject } from 'rxjs';

export class SomeUtil {
  events$ = new Subject<void>();
}
      `,
      filename: 'some.util.ts',
    },
  ],
  invalid: [
    {
      name: 'component file importing BehaviorSubject',
      code: `
import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'pa-test',
  template: '<div>hello</div>',
})
export class TestComponent {
  count$ = new BehaviorSubject(0);
}
      `,
      filename: 'test.component.ts',
      errors: [
        {
          messageId: 'noRxjsLocalState',
        },
      ],
    },
    {
      name: 'component file importing Subject',
      code: `
import { Component } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'pa-test',
  template: '<div>hello</div>',
})
export class TestComponent {
  clicks$ = new Subject<void>();
}
      `,
      filename: 'test.component.ts',
      errors: [
        {
          messageId: 'noRxjsLocalState',
        },
      ],
    },
    {
      name: 'component file importing Observable and Subscription together',
      code: `
import { Component } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'pa-test',
  template: '<div>hello</div>',
})
export class TestComponent {
  data$?: Observable<string>;
  sub?: Subscription;
}
      `,
      filename: 'test.component.ts',
      errors: [
        {
          messageId: 'noRxjsLocalState',
        },
        {
          messageId: 'noRxjsLocalState',
        },
      ],
    },
  ],
});
