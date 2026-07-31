# pa-ui — Agent Skills Index

When working on this project, load the relevant skill(s) BEFORE writing any
code.

## How to Use

1. Check the trigger column to find skills that match your current task
2. Load the skill by reading the SKILL.md file at the listed path
3. Follow ALL patterns and rules from the loaded skill
4. Multiple skills can apply simultaneously

## Skills

| Skill                     | Trigger                                                                                                                                                                                          | Path                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `pa-ui-architecture`      | Implementing, refactoring, or reviewing pa-ui Angular components, tokens, theming, or SDD phases.                                                                                                | [`skills/pa-ui-architecture/SKILL.md`](skills/pa-ui-architecture/SKILL.md)           |
| `pa-ui-coding-standards`  | Writing component logic, templates, styles, tests, or PRs. Defines file structure, input/output patterns, signal usage, CSS conventions, and gga review criteria.                                | [`skills/pa-ui-coding-standards/SKILL.md`](skills/pa-ui-coding-standards/SKILL.md)   |
| `pa-ui-testing`           | Writing or reviewing tests. Defines TestBed + Test Host pattern, jest-axe a11y, CDK mocking, coverage thresholds, and required describe blocks per component.                                    | [`skills/pa-ui-testing/SKILL.md`](skills/pa-ui-testing/SKILL.md)                     |
| `github-issues-from-docs` | crear issue, GitHub issue, US-XX, revisar issue, alinear issue con documentación. Crear y revisar issues de GitHub alineados con documentación técnica usando cache híbrido de Notion en Engram. | [`skills/github-issues-from-docs/SKILL.md`](skills/github-issues-from-docs/SKILL.md) |

## Project Language Override

This overrides the global Language Domain Contract (`~/.claude/CLAUDE.md`) and
the persona output-style default (`~/.claude/output-styles/gentleman.md`) for
this repository only. It applies regardless of which agent/tool is reading this
file (Claude Code, OpenCode, gga, etc.).

### Collaboration artifacts → always Spanish

Always write these in neutral/professional Spanish, without asking each time:

- Commit messages
- Pull request titles and descriptions
- GitHub issue titles and descriptions
- PR/issue comments

This applies regardless of the conversation language used to request the work.

### Code artifacts → always English (unchanged)

The general rule still applies as-is: source code, identifiers, code comments,
UI copy/labels, docs, tests, and any string literal inside source code default
to English. Do not translate these to Spanish unless explicitly requested for
that specific artifact.
