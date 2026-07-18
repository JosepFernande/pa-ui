# pa-ui — Project Language Override

This overrides the global Language Domain Contract (`~/.claude/CLAUDE.md`) and
the persona output-style default (`~/.claude/output-styles/gentleman.md`) for
this repository only.

## Collaboration artifacts → always Spanish

Always write these in neutral/professional Spanish, without asking each time:

- Commit messages
- Pull request titles and descriptions
- GitHub issue titles and descriptions
- PR/issue comments

This applies regardless of the conversation language used to request the work.

## Code artifacts → always English (unchanged)

The general rule still applies as-is: source code, identifiers, code comments,
UI copy/labels, docs, tests, and any string literal inside source code default
to English. Do not translate these to Spanish unless explicitly requested for
that specific artifact.
