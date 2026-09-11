/**
 * `HaInputTextTokens` and its matching `HA_INPUT_TEXT_TOKENS` CSS-variable-
 * name registry now live in `@halolib-ui/angular/core` (`component-token-shapes.ts`)
 * so `core` can build `HaTheme.components.inputText` and walk a consumer's
 * Input overrides against this exact registry without importing FROM
 * `@halolib-ui/angular/input-text` — `input-text` already depends on `core`
 * (`input-text.tokens.spec.ts` imports `HA_COMPONENT_TOKEN_DEFAULTS` from
 * it), so the reverse import would be an entry-point cycle.
 *
 * Re-exported here verbatim so this file — and therefore
 * `libs/halo-ui/input-text/src/index.ts`'s existing
 * `export { HA_INPUT_TEXT_TOKENS } from './lib/input-text.tokens';` /
 * `export type { HaInputTextTokens } from './lib/input-text.tokens';` —
 * keeps working with zero further changes.
 */
export { HA_INPUT_TEXT_TOKENS } from '@halolib-ui/angular/core';
export type { HaInputTextTokens } from '@halolib-ui/angular/core';
