---
name: pa-ui-architecture
description: "Trigger: pa-ui, Angular UI library, pa- components, design tokens, theming, sdd design spec tasks apply verify. Apply the six hard rules and three-layer token system to every pa-ui artifact."
license: MIT
metadata:
  author: JosepFernande
  version: "1.0"
  project: pa-ui
---

## Activation Contract

Load this skill whenever work targets the `pa-ui` repository: any `sdd-*` phase (explore, propose, spec, design, tasks, apply, verify) or any direct implementation, refactor, or review of Angular components, theming, or tokens. The skill is the operational contract for the architecture documented in Notion. It does not replace reading the source Notion page when a decision is non-obvious.

## Hard Rules (non-negotiable)

1. **Tokens first.** No hardcoded colors, spacing, or radius. Every value comes from a token.
2. **Standalone only.** No NgModules. Every component, directive, and pipe is `standalone: true`.
3. **Signals first.** Use Signals, not RxJS, for local state, UI state, and internal interactions. Reserve RxJS for streams, async events, and interop.
4. **CSS variables first.** Prefer native CSS and custom properties. Reject heavy SCSS, mixin stacks, and utility-class frameworks.
5. **CDK over custom.** Use Angular CDK for overlays, a11y, focus, keyboard, and scrolling. Do not reimplement.
6. **Consistent APIs.** Naming, inputs, outputs, and variants follow project conventions: `pa-` prefix, `size=sm|md|lg`, `variant=solid|outline|ghost`, `color` as a string (theme-registered, never a closed enum).

## Token System

Three layers, in order of definition:

1. **Foundation** — raw values: `--blue-500`, `--gray-100`, `--radius-2`, `--spacing-4`.
2. **Semantic** — `--pa-primary`, `--pa-surface`, `--pa-border`, `--pa-text`.
3. **Component** — `--pa-button-bg`, `--pa-button-color`, `--pa-input-focus-ring`.

Components consume ONLY semantic and component tokens. Foundation tokens are off-limits inside components. The Theme Engine (`providePaTheme()`) auto-derives hover, active, and contrast variants from user-registered colors.

## Decision Gates

| Situation | Rule |
| --- | --- |
| Adding a color, spacing, or radius value | Use semantic or component token. Reject hardcoded values. |
| Component receives a color input | Type as `string` (theme-registered). Reject closed enums. |
| Component needs overlay, a11y, focus, keyboard, or scrolling | Use Angular CDK primitives. Reject custom implementations. |
| Component local or UI state | Use Signals. Reject `BehaviorSubject` for UI state. |
| Cross-component styling | Use component tokens. Reject global utility classes and shared mutable state. |
| Component file size | Stay within 300–400 lines. Split otherwise. |
| Third-party dependency | Justify it. Default to no — avoid lodash, utility libraries, heavy CSS frameworks. |

## Execution Steps

1. Confirm the change targets the `pa-ui` repo and identify which artifacts you own (spec, design, task, implementation, verification).
2. Re-read the Notion source of truth if any rule application is ambiguous. Do not invent.
3. Apply the hard rules to your output: spec criteria, design decisions, task acceptance, code, and verification checklist must reference these rules explicitly.
4. For each component, place files at `libs/<lib>/src/lib/<comp>.{component.ts,component.html,component.css,types.ts,tokens.ts,constants.ts,utils.ts}` with `index.ts` and `public-api.ts` at the lib root.
5. Verification phase: produce a checklist mapping each of the six hard rules to the evidence (file, line, test) that proves compliance. Flag any deviation as a blocker, not a warning.

## Output Contract

Every phase or direct implementation must return:

- **Rule compliance map**: for each of the 6 hard rules, the artifact(s) that satisfy it.
- **Token map**: which semantic and component tokens the change introduces or consumes.
- **CDK usage**: which CDK module(s) the change relies on (if any).
- **Limits**: confirm the change respects the 300–400 line component cap.
- **Deviations**: any rule the change cannot satisfy, with rationale and proposed follow-up.

## References

- Notion — Architecture & Foundation: `35f80bf9-7f94-814a-96d6-ccb90055e545`
- Notion — Documentacion hub: `35f80bf9-7f94-80d7-83ff-e06cb99a1505`
- Repo: `https://github.com/JosepFernande/pa-ui`

