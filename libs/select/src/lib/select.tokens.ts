/**
 * `HaSelectTokens` and its matching `HA_SELECT_TOKENS` CSS-variable-name
 * registry now live in `@halolib-ui/core` (`component-token-shapes.ts`) so
 * `core` can build `HaTheme.components.select` and walk a consumer's Select
 * overrides against this exact registry without importing FROM
 * `@halolib-ui/select` — `select` already depends on `core`
 * (`select.tokens.spec.ts` imports `HA_COMPONENT_TOKEN_DEFAULTS` from it), so
 * the reverse import would be a circular project dependency.
 *
 * Re-exported here verbatim so this file — and therefore
 * `libs/select/src/public-api.ts`'s existing
 * `export { HA_SELECT_TOKENS } from './lib/select.tokens';` /
 * `export type { HaSelectTokens } from './lib/select.tokens';` — keeps
 * working with zero further changes.
 */
export { HA_SELECT_TOKENS } from '@halolib-ui/core';
export type { HaSelectTokens } from '@halolib-ui/core';
