---
name: pa-ui-testing
description: "Trigger: writing or reviewing tests for pa-ui Angular components, directives, pipes, or services. Defines test patterns, jest-axe a11y, coverage thresholds, and CDK mocking conventions."
license: MIT
metadata:
  author: JosepFernande
  version: "1.0"
  project: pa-ui
---

## Activation Contract

Load this skill when writing or reviewing tests for any `pa-ui` library. Tests are a first-class artifact — every component PR MUST include or update tests. This skill defines the patterns, conventions, and thresholds that make tests consistent across the project.

## Test Stack

| Tool | Version | Role |
|------|---------|------|
| Jest | ^29.7.0 | Test runner |
| jest-preset-angular | ~14.4.0 | Angular transform, zone setup, serializers |
| jest-axe | ^10.0.0 | A11y assertions via axe-core |
| jest-environment-jsdom | ^29.7.0 | DOM environment |

No `@testing-library/angular`, no `ComponentHarness`. Use `TestBed` + `DebugElement` + `By.css` + `nativeElement`.

## Project Configuration

### Per-lib jest.config.ts

```typescript
export default {
  displayName: '<lib-name>',
  preset: '../../jest.preset.cjs',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../coverage/libs/<lib-name>',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      { tsconfig: '<rootDir>/tsconfig.spec.json', stringifyContentPathRegex: '\\.(html|svg)$' },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
```

### test-setup.ts

```typescript
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
setupZoneTestEnv({ errorOnUnknownElements: true, errorOnUnknownProperties: true });
```

## Coverage Thresholds

Minimum thresholds: **80% lines, 80% branches, 90% functions, 80% statements**.

Configured in each lib's `jest.config.ts`:

```typescript
collectCoverageFrom: ['<rootDir>/src/lib/**/*.ts'],
coverageThreshold: {
  global: {
    lines: 80,
    branches: 80,
    functions: 90,
    statements: 80,
  },
},
```

## Test Categories

Every component lib MUST have tests in these categories:

### 1. Pure Unit Tests (no TestBed)

For types, constants, tokens — pure functions and data structures only.

```typescript
import { PaButtonVariant, PaButtonSize } from './button.types';

describe('Button Types', () => {
  it('should export PaButtonVariant as a union type', () => {
    const solid: PaButtonVariant = 'solid';
    expect(solid).toBe('solid');
  });
});
```

### 2. Token Contract Tests

Verify component tokens export the correct CSS variable names.

```typescript
import { PA_BUTTON_TOKENS } from './button.tokens';

describe('Button Tokens', () => {
  it('should export PA_BUTTON_TOKENS with CSS variable name strings', () => {
    expect(PA_BUTTON_TOKENS.bg).toBe('--pa-button-bg');
  });

  it('should include all required token keys from the design spec', () => {
    const keys = Object.keys(PA_BUTTON_TOKENS);
    const required = ['bg', 'color', 'border', 'radius', 'shadow', 'hover-bg',
      'hover-color', 'active-bg', 'active-color', 'focus-ring', 'disabled-opacity',
      'font-size', 'font-weight', 'padding-x', 'padding-y', 'min-height',
      'gap', 'transition-duration', 'loading-opacity'];
    for (const key of required) { expect(keys).toContain(key); }
    expect(keys).toHaveLength(required.length);
  });

  it('should have all values prefixed with --pa-button-', () => {
    const values = Object.values(PA_BUTTON_TOKENS);
    for (const value of values) { expect(value).toMatch(/^--pa-button-/); }
  });
});
```

### 3. Component Unit Tests (TestBed + Test Host)

For directive-based components (attribute selectors like `button[pa-button]`), use a **Test Host** wrapper.

```typescript
@Component({
  standalone: true,
  imports: [PaButton],
  template: `
    <button pa-button [variant]="variant" [size]="size"
            [color]="color" [disabled]="disabled"
            [loading]="loading" (click)="onClick()">
      {{ label }}
    </button>
  `,
})
class TestHost {
  variant: PaButtonVariant = 'solid';
  size: PaButtonSize = 'md';
  color = 'primary';
  disabled = false;
  loading = false;
  label = 'Test Button';
  clicked = false;
  onClick(): void { this.clicked = true; }
}

describe('PaButton', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [/* CDK mocks here */],
    }).compileComponents();
  });

  function createTestHost() {
    const fixture = TestBed.createComponent(TestHost);
    const host = fixture.componentInstance;
    const buttonDebug = fixture.debugElement.query(By.css('button'));
    const buttonEl = buttonDebug.nativeElement as HTMLButtonElement;
    return { fixture, host, buttonEl, buttonDebug };
  }
});
```

#### Required describe blocks (in order):

**rendering**
- Renders native element
- Projects content/slots correctly
- Implicit ARIA role (if applicable)
- Base BEM class present

**variant classes**
- Each variant (`solid`, `outline`, `ghost`)
- Negative test (unknown variant)

**size classes**
- Each size (`sm`, `md`, `lg`)
- Negative test (unknown size)

**color CSS variable**
- `--pa-component-color` resolves to `var(--pa-{color})`

**state classes / attributes**
- `disabled` — native attribute, click suppressed, BEM class
- `loading` — `aria-busy`, spinner visible, click suppressed
- Combination states (disabled + loading)

**CDK integration**
- FocusMonitor: mock with `Subject<FocusOrigin>`, verify `cdk-keyboard-focused` class
- CdkTrapFocus: verify trap activates on open
- LiveAnnouncer: verify announcement on state change

**architectural compliance**
- `standalone: true`
- `ChangeDetectionStrategy.OnPush`
- Signal inputs (if applicable)

**accessibility**
- `toHaveNoViolations()` with jest-axe

### 4. Build/Packaging Contract Tests

For the entry-point lib (`libs/pa-ui/`), verify public API, side effects, peer dependencies, and tree-shaking.

```typescript
// packaging.contract.spec.ts
it('should have sideEffects: false in package.json', () => {
  const pkg = require('../../package.json');
  expect(pkg.sideEffects).toBe(false);
});

it('should declare all @angular/cdk and @angular/forms as peerDependencies', () => {
  const pkg = require('../../package.json');
  expect(pkg.peerDependencies).toHaveProperty('@angular/cdk');
  expect(pkg.peerDependencies).toHaveProperty('@angular/forms');
});
```

## CDK Mocking Pattern

When a component depends on CDK services (`FocusMonitor`, `LiveAnnouncer`, `CdkDrag`, etc.), provide mocks in `TestBed.configureTestingModule`:

```typescript
import { Subject } from 'rxjs';

const focusMonitorMock = {
  monitor: jest.fn().mockReturnValue(new Subject<FocusOrigin>()),
  stopMonitoring: jest.fn(),
};

beforeEach(async () => {
  await TestBed.configureTestingModule({
    imports: [TestHost],
    providers: [
      { provide: FocusMonitor, useValue: focusMonitorMock },
    ],
  }).compileComponents();
});
```

## A11y Testing with jest-axe

Import and extend in the spec file:

```typescript
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { axe, toHaveNoViolations } = require('jest-axe') as {
  axe: (element: Element | Document, options?: Record<string, unknown>) => Promise<Record<string, unknown>>;
  toHaveNoViolations: Record<string, jest.CustomMatcher>;
};
expect.extend(toHaveNoViolations);

declare global {
  namespace jest {
    interface Matchers<R> { toHaveNoViolations(): R; }
  }
}
```

Usage in tests:

```typescript
it('should have no accessibility violations in default state', async () => {
  const { fixture } = createTestHost();
  fixture.detectChanges();
  const results = await axe(fixture.nativeElement);
  expect(results).toHaveNoViolations();
});
```

Test at minimum 3 states: default, disabled/loading, and a custom-color variant.

## What gga Will Flag in Tests

1. **Missing a11y test** (`toHaveNoViolations`) for any component spec
2. **Missing coverage threshold enforcement** in jest.config.ts
3. **No token contract test** for components that define tokens
4. **No type/constants test** for components that define types or constants
5. **Component spec without Test Bed** (component is NOT tested with TestBed)
6. **Tests using `@testing-library/angular` or `ComponentHarness`** (reject — use TestBed + DebugElement)
7. **Tests missing one or more required describe blocks** (rendering, variants, states, a11y)
8. **Snapshots without explicit review** (snapshot serializers are configured, but prefer explicit assertions)

## Review Checklist (For Human Reviewers)

- [ ] Pure unit tests for types, constants, tokens
- [ ] Component tests cover all input variants (size, variant, color)
- [ ] Component tests cover all states (enabled, disabled, loading, error)
- [ ] A11y test with `jest-axe` exists and passes
- [ ] CDK services mocked correctly (FocusMonitor, LiveAnnouncer, etc.)
- [ ] Test Host pattern used for directive-based components
- [ ] Architectural compliance verified (standalone, OnPush, signal inputs)
- [ ] Coverage thresholds met (80/80/90/80)
- [ ] No snapshots used when explicit assertions suffice
- [ ] Build/packaging contract tests exist for entry-point libs

## References

- Architecture skill: `pa-ui-architecture`
- Coding standards skill: `pa-ui-coding-standards`
- Notion — Architecture & Foundation: `35f80bf9-7f94-814a-96d6-ccb90055e545`
- jest-axe docs: https://github.com/nickcolley/jest-axe
- jest-preset-angular docs: https://github.com/thymikee/jest-preset-angular
- Repo: `https://github.com/JosepFernande/pa-ui`
