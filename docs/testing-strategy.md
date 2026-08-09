# Testing Strategy

This is the deep reference for why and how `pa-ui` tests components — the
philosophy, the full a11y checklist, and the illustrative roadmap layer. For the
concrete day-to-day patterns (exact `jest.config.ts` shape, CDK mocking
snippets, required `describe` blocks, what gga flags), see the `pa-ui-testing`
skill (`skills/pa-ui-testing/SKILL.md`) — this document does not duplicate that
operational checklist.

## Testing Philosophy

Testing is not optional. In a component library used by multiple projects across
the company, an undetected bug can break several projects at once. CI must
prevent untested code from reaching `main`. The main rule: **no tests, no
merge**.

## The 3 Levels of Testing

### Level 1 — Unit Testing

Test the component's logic in isolation: inputs work, outputs emit, signals
react, state changes correctly.

**Tools:**

- **Jest** — test runner (faster than Karma/Jasmine, better DX)
- **Angular `TestBed`** (`@angular/core/testing`) — component test harness.
  Query the rendered DOM via `fixture.debugElement.query(By.css(...))`, not a
  separate query library.

**Real example: `PaButton`**

```typescript
// button.component.spec.ts (simplified — see the real file for the full suite)
import { Component, ViewEncapsulation } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PaButton } from './button.component';

@Component({
  standalone: true,
  imports: [PaButton],
  encapsulation: ViewEncapsulation.None,
  template: `<button pa-button [disabled]="disabled" (click)="onClick()">
    {{ label }}
  </button>`,
})
class TestHost {
  disabled = false;
  label = 'Save';
  clicked = false;
  onClick(): void {
    this.clicked = true;
  }
}

describe('PaButton', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHost],
    }).compileComponents();
    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
  });

  it('should render the projected label', () => {
    fixture.detectChanges();
    const buttonEl = fixture.debugElement.query(By.css('button'))
      .nativeElement as HTMLButtonElement;
    expect(buttonEl.textContent).toContain('Save');
  });

  it('should fire the click handler when clicked', () => {
    fixture.detectChanges();
    const buttonEl = fixture.debugElement.query(By.css('button'))
      .nativeElement as HTMLButtonElement;
    buttonEl.click();
    expect(host.clicked).toBe(true);
  });

  it('should not fire the click handler when disabled', () => {
    host.disabled = true;
    fixture.detectChanges();
    const buttonEl = fixture.debugElement.query(By.css('button'))
      .nativeElement as HTMLButtonElement;
    buttonEl.click();
    expect(host.clicked).toBe(false);
  });
});
```

**What unit tests must cover:**

- Correct rendering with different inputs
- Output emission on interactions
- Signal behavior (local state)
- States: disabled, loading, error
- CSS classes applied based on inputs
- Integration with `ControlValueAccessor` (for form components)

### Level 2 — Interaction Testing (roadmap)

Test the component's visual and interactive behavior directly from Storybook —
flows like opening a dialog, keyboard-navigating a dropdown, closing a toast.
Neither `@storybook/addon-interactions` nor `@storybook/test` is installed today
(only `@storybook/addon-essentials`, see [Storybook](./storybook.md)) — this
layer is a reference design, not a pattern in active use. The
`PaDialogComponent` example below is illustrative: `dialog` does not exist yet
as a component.

**Tools (to install when implemented):**

- **Storybook Interactions** (`@storybook/addon-interactions`)
- **`@storybook/test`** (includes `userEvent`, `expect`, `within`)

**Illustrative example: Dialog (not yet implemented)**

```typescript
// dialog.stories.ts
import { Meta, StoryObj } from '@storybook/angular';
import { within, userEvent, expect } from '@storybook/test';
import { PaDialogComponent } from './dialog.component';

export default { component: PaDialogComponent } satisfies Meta;
type Story = StoryObj<PaDialogComponent>;

export const OpenAndClose: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Open Dialog' }));
    await expect(canvas.getByRole('dialog')).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: 'Close' }));
    await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
  },
};

export const CloseWithEscape: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Open Dialog' }));
    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
  },
};
```

### Level 3 — Accessibility Testing

Automatically detect accessibility (WCAG) violations in every component. Since
accessibility is one of the library's core goals, this level is mandatory.

**Tools:**

- **jest-axe** — for unit tests
- **@storybook/addon-a11y** — for Storybook (visual a11y panel)
- **axe-playwright** — for e2e tests, if implemented in the future

**Real example: axe in a unit test**

```typescript
import { Component, ViewEncapsulation } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
// jest-axe v10 has no TS declarations in this repo — imported via require()
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { axe, toHaveNoViolations } = require('jest-axe');

import { PaButton } from './button.component';

expect.extend(toHaveNoViolations);

@Component({
  standalone: true,
  imports: [PaButton],
  encapsulation: ViewEncapsulation.None,
  template: `<button pa-button>Save</button>`,
})
class TestHost {}

describe('PaButton — Accessibility', () => {
  let fixture: ComponentFixture<TestHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHost],
    }).compileComponents();
    fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
  });

  it('should have no accessibility violations', async () => {
    const results = await axe(fixture.nativeElement);
    expect(results).toHaveNoViolations();
  });
});
```

## Minimum Required Coverage

CI must fail if coverage drops below these thresholds:

| Metric     | Minimum required |
| ---------- | ---------------- |
| Statements | 80%              |
| Branches   | 80%              |
| Functions  | 90%              |
| Lines      | 80%              |

These values are centralized in `jest.preset.cjs` (repo root) — each lib's
`jest.config.ts` inherits the preset, it does not declare its own
`coverageThreshold`. The real preset also excludes story files from coverage
accounting:

```javascript
// jest.preset.cjs
collectCoverageFrom: [
  '<rootDir>/src/lib/**/*.ts',
  '!<rootDir>/src/lib/**/*.stories.ts',
],
coverageThreshold: {
  global: { lines: 80, branches: 80, functions: 90, statements: 80 },
},
```

## Test File Structure per Component

```
libs/button/
  src/
    lib/
      button.component.ts
      button.component.spec.ts         ← unit tests + accessibility tests (jest-axe)
      button.stories.ts                ← story, colocated next to the component (not a separate stories/ folder)
```

## Commands

```bash
# Run all tests
npx nx run-many -t test

# Run tests for a specific package
npx nx test button

# Run tests with coverage
npx nx test button --coverage

# Run Storybook (see Storybook — no test-storybook target exists)
npx nx run showcase:storybook
```

## Rules of the Team

- Every new component MUST have unit tests before its first merge.
- Every component MUST have at least one accessibility test with axe.
- Interaction tests are mandatory for components with complex state (dialog,
  dropdown, tooltip, toast) — once that testing layer is implemented.
- Tests MUST run in CI. A build with failing tests cannot be merged.
- Tests MUST be written using Angular `TestBed`
  (`TestBed.configureTestingModule`, `TestBed.createComponent`). Query the
  rendered DOM via `fixture.debugElement.query(By.css(...))` and assert against
  the resulting native element — this is the pattern used in every existing spec
  in the repo.

## Reference

- `pa-ui-testing` skill (`skills/pa-ui-testing/SKILL.md`) — operational
  patterns, CDK mocking, required `describe` blocks, gga review criteria
- `jest.preset.cjs` — coverage thresholds and `collectCoverageFrom`
- [Storybook](./storybook.md) — the real, centralized Storybook setup
