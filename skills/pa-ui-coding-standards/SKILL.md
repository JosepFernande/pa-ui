---
name: pa-ui-coding-standards
description: "Trigger: pa-ui component implementation, refactor, code review, PR checklist. Enforces component file structure, input/output conventions, signal usage, CSS variable patterns, and gga review criteria."
license: MIT
metadata:
  author: JosepFernande
  version: "1.0"
  project: pa-ui
---

## Activation Contract

Load this skill when implementing, refactoring, or reviewing Angular components in the `pa-ui` repository. This skill defines the concrete code patterns, file organization, and review criteria that complement the architectural rules in `pa-ui-architecture`.

## Component File Organization

```
libs/<lib>/src/lib/<component>/
├── <component>.component.ts    # Logic (signals, inputs, outputs, CDK usage)
├── <component>.component.html  # Template (native HTML, CDK directives)
├── <component>.component.css   # Styles (CSS variables only, :host scoping)
├── <component>.types.ts        # TypeScript interfaces, types
├── <component>.tokens.ts       # Component token definitions (--pa-<comp>-* )
├── <component>.constants.ts    # Constants, default values, variant maps
├── <component>.utils.ts        # Pure helper functions (no side effects)
├── index.ts                    # Barrel export
└── public-api.ts               # Public API export (at lib root)
```

## Required Component Decorator

```typescript
@Component({
  selector: 'pa-<name>',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  // template and styles...
})
```

## Input/Output Patterns

```typescript
// Size: exactly these three
@Input() size: 'sm' | 'md' | 'lg' = 'md';

// Variant: exactly these three
@Input() variant: 'solid' | 'outline' | 'ghost' = 'solid';

// Color: string (theme-registered), never enum
@Input() color: string = 'primary';

// Boolean: no prefix
@Input() disabled = false;

// Output: past tense, no 'on' prefix
@Output() closed = new EventEmitter<void>();
@Output() valueChange = new EventEmitter<string>();
```

## Signal Usage Patterns

```typescript
// Local UI state
readonly isOpen = signal(false);
readonly loading = signal(false);

// Computed derived state
readonly buttonClasses = computed(() => [
  'pa-button',
  `pa-button--${this.size()}`,
  `pa-button--${this.variant()}`,
  `pa-button--${this.color()}`,
  this.disabled() ? 'pa-button--disabled' : '',
  this.loading() ? 'pa-button--loading' : '',
]);

// Effects for side effects (rare)
effect(() => {
  if (this.isOpen()) {
    this.focusTrap.focusInitialElement();
  }
});
```

## gga Review Criteria (What Gets Flagged)

When gga reviews a PR, it checks for violations of:

1. **Hardcoded values** in `.component.css` — any `#hex`, `rgb()`, `px`, `rem`, `em` for colors/spacing/radius
2. **Missing `standalone: true`** on components, directives, pipes
3. **RxJS imports** (`BehaviorSubject`, `Subject`, `Observable`, `Subscription`, operators) used for local state
4. **SCSS features** (`@mixin`, `@include`, `@function`, nesting beyond 1 level, `&:`)
5. **Custom overlay/focus/keyboard code** instead of CDK imports
6. **Color input as enum** instead of `string`
7. **Component files > 400 lines**
8. **Missing CDK imports** when overlay/a11y/focus/keyboard is needed
9. **Global CSS selectors** (`::ng-deep`, `:host-context`, element selectors outside `:host`)
10. **Utility class frameworks** (Tailwind classes, Bootstrap classes)

## Exceptions (Require Explicit Justification)

If a rule cannot be satisfied, add a comment explaining why:

```typescript
// gga-ignore: CDK virtual scroll not yet stable for this use case
// TODO: Replace with CdkVirtualScrollViewport when @angular/cdk#12345 lands
```

These should be rare and temporary. gga will still flag them but the team can approve with the justification.

## Review Checklist (For Human Reviewers)

### Architecture
- [ ] The 6 hard rules are respected (see `pa-ui-architecture` skill).
- [ ] **gga (Gentleman Guardian Angel) passes** — AI review of 6 hard rules + token system in CI.
- [ ] No new hardcoded colors, spacing, or radius in component CSS.
- [ ] No `::ng-deep`, no global selectors, no `!important` outside `:host`.
- [ ] `ViewEncapsulation.None`, `ChangeDetectionStrategy.OnPush`, `standalone: true` set.
- [ ] The component is under 400 lines.

### Theming
- [ ] Colors are bound to CSS custom properties on the host, not BEM modifiers.
- [ ] Custom colors (`treasury`, etc.) work without changes to the component.
- [ ] Hover/active/contrast states are derived automatically by the Theme Engine.

### Forms (CVA)
- [ ] Component implements `ControlValueAccessor`.
- [ ] `NgControl` is injected with `{ optional: true }`.
- [ ] Component works outside a form (no errors when used standalone).
- [ ] `onChange`, `onTouched`, `setDisabledState` are correctly called.
- [ ] `hasError` reflects `(invalid && touched)`.

### Accessibility
- [ ] All interactive elements are keyboard-reachable.
- [ ] Focus ring is visible (no `outline: none` without a replacement).
- [ ] ARIA attributes are correct (role, aria-*, etc.).
- [ ] `jest-axe` test passes.
- [ ] Component works with screen readers (manual test with VoiceOver/NVDA).
- [ ] `prefers-reduced-motion` respected for animations.

### Testing
- [ ] Unit tests cover inputs, outputs, signals, state changes.
- [ ] A11y test with `jest-axe` exists.
- [ ] Storybook story exists with all variants and at least one custom color.
- [ ] Interaction tests for state changes (where applicable).
- [ ] Coverage thresholds met (80/80/90/80).

### Documentation
- [ ] Public API documented in TSDoc.
- [ ] `README.md` of the affected lib is updated (if user-facing change).
- [ ] Storybook autodocs generated.
- [ ] The showcase is updated (if user-facing).

### Performance
- [ ] Component is under its budget (per `Performance Budgets`).
- [ ] No heavy dependencies added.
- [ ] Tree-shaking verified.

### CI
- [ ] All CI checks pass (lint, test, build, audit, gga-review).
- [ ] No `[skip ci]` in commit messages.
- [ ] Changeset is correct (packages, bump type, description).

## References

- Architecture skill: `pa-ui-architecture`
- Notion — Architecture & Foundation: `35f80bf9-7f94-814a-96d6-ccb90055e545`
- Notion — AI Code Review with gga: `35f80bf9-7f94-8179-8025-d0c378a83fb5`
- Notion — Contribution / PR / Code Review Guidelines: `35f80bf9-7f94-8179-8025-d0c378a83fb5`
- Repo: `https://github.com/JosepFernande/pa-ui`